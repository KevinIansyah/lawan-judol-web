<?php

namespace App\Services\Youtube;

use App\Models\User;
use App\Services\YouTube\Fetchers\YoutubeFetcher;
use App\Services\YouTube\Formatters\YoutubeFormatter;
use App\Services\YouTube\Handlers\CacheHandler;
use App\Services\YouTube\Handlers\TokenHandler;
use App\Services\YouTube\Helpers\YouTubeErrorHelper;
use App\Services\YouTube\Responses\ErrorResponseBuilder;
use App\Services\YouTube\Responses\SuccessResponseBuilder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class YoutubeService
{
  protected $tokenHandler;
  protected $cacheHandler;
  protected $youtubeFetcher;
  protected $youtubeFormatter;
  protected $youtubeErrorHelper;
  protected $errorResponseBuilder;
  protected $successResponseBuilder;

  public function __construct(
    TokenHandler $tokenHandler,
    CacheHandler $cacheHandler,
    YoutubeFetcher $youtubeFetcher,
    YoutubeFormatter $youtubeFormatter,
    YouTubeErrorHelper $youTubeErrorHelper,
    ErrorResponseBuilder $errorResponseBuilder,
    SuccessResponseBuilder $successResponseBuilder,
  ) {
    $this->tokenHandler = $tokenHandler;
    $this->cacheHandler = $cacheHandler;
    $this->youtubeFetcher = $youtubeFetcher;
    $this->youtubeFormatter = $youtubeFormatter;
    $this->youtubeErrorHelper = $youTubeErrorHelper;
    $this->errorResponseBuilder = $errorResponseBuilder;
    $this->successResponseBuilder = $successResponseBuilder;
  }

  /**
   * Get video details by video ID.
   */
  public function getVideoById(User $user, string $videoId): array
  {
    try {
      $initialResponse = $this->youtubeFetcher->fetchVideoById($user->google_token, $videoId);

      $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($videoId) {
        return $this->youtubeFetcher->fetchVideoById($token, $videoId);
      });

      if (!$tokenResult['success']) {
        return $this->errorResponseBuilder->buildVideoError($tokenResult['message']);
      }

      $response = $tokenResult['response'];

      if (!$response->successful()) {
        $checkQuotaError = $this->youtubeErrorHelper->checkQuotaError($response);

        if ($checkQuotaError['success']) {
          Log::critical("YouTube API quota exceeded", [
            'user_id' => $user->id,
            'action' => 'get_video_by_id'
          ]);

          return $this->errorResponseBuilder->buildVideoError($checkQuotaError['message'], true);
        }

        $checkVideoError = $this->youtubeErrorHelper->checkVideoError($response);

        if ($checkVideoError['success']) {
          Log::warning("Video not found or forbidden", [
            'user_id' => $user->id,
            'video_id' => $videoId
          ]);

          return $this->errorResponseBuilder->buildVideoError($checkVideoError['message']);
        }

        Log::error("Video fetch failed", [
          'user_id' => $user->id,
          'video_id' => $videoId,
          'status' => $response->status()
        ]);

        return $this->errorResponseBuilder->buildVideoError('Terjadi kesalahan saat mengambil data video. Silakan coba beberapa saat lagi.');
      }

      $items = $response->json('items', []);

      if (empty($items)) {
        return $this->errorResponseBuilder->buildVideoError('Video tidak ditemukan atau telah dihapus. Pastikan ID video yang Anda masukkan benar.');
      }

      $video = $this->youtubeFormatter->formatVideoById($items[0]);

      Log::info("Video fetched successfully", [
        'user_id' => $user->id,
        'video_id' => $videoId,
        'title' => $video['title']
      ]);

      return $this->successResponseBuilder->buildVideoSuccess($video);
    } catch (\Exception $e) {
      Log::error("Error fetching video", [
        'user_id' => $user->id,
        'video_id' => $videoId,
        'error' => $e->getMessage()
      ]);

      return $this->errorResponseBuilder->buildVideoError('Terjadi kesalahan saat mengambil data video. Silakan coba beberapa saat lagi');
    }
  }

  /**
   * Get authenticated user's channel information.
   */
  public function getUserChannel(User $user): ?array
  {
    try {
      $initialResponse = $this->youtubeFetcher->fetchAuthenticatedChannel($user->google_token);

      $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) {
        return $this->youtubeFetcher->fetchAuthenticatedChannel($token);
      });

      if (!$tokenResult['success']) {
        return null;
      }

      $response = $tokenResult['response'];

      if (!$response->successful()) {
        $checkQuotaError = $this->youtubeErrorHelper->checkQuotaError($response);

        if ($checkQuotaError['success']) {
          Log::critical("YouTube API quota exceeded", [
            'user_id' => $user->id,
            'action' => 'get_user_channel'
          ]);

          return $this->errorResponseBuilder->buildUserVideosError($checkQuotaError['message'], true);
        }

        $checkChannelError = $this->youtubeErrorHelper->checkChannelError($response);
        if ($checkChannelError['success']) {
          Log::warning("Channel not found or forbidden", [
            'user_id' => $user->id
          ]);

          return $this->errorResponseBuilder->buildUserVideosError($checkChannelError['message']);
        }

        Log::error("Channel fetch failed", [
          'user_id' => $user->id,
          'status' => $response->status()
        ]);

        return $this->errorResponseBuilder->buildUserVideosError('Terjadi kesalahan saat mengambil data channel. Silakan coba beberapa saat lagi.');
      }

      return $tokenResult['response']->json();
    } catch (\Exception $e) {
      Log::error("Error fetching user channel", [
        'user_id' => $user->id,
        'error' => $e->getMessage()
      ]);

      return null;
    }
  }

  /**
   * Get all videos from the user's uploads playlist.
   */
  public function getUserVideos(User $user, bool $forceRefresh = false): array
  {
    $cacheKey = "user_videos_{$user->id}";

    if (!$forceRefresh && Cache::has($cacheKey)) {
      $cachedData = Cache::get($cacheKey);
      $cachedData['from_cache'] = true;

      return $cachedData;
    }

    $startTime = now();

    try {
      $channelData = $this->getUserChannel($user);

      if (!$channelData || empty($channelData['items'])) {
        return $this->errorResponseBuilder->buildUserVideosError('Channel tidak ditemukan atau Anda tidak memiliki izin untuk mengaksesnya.');
      }

      $channel = $channelData['items'][0];
      $uploadsPlaylistId = $channel['contentDetails']['relatedPlaylists']['uploads'];
      $allVideos = [];
      $nextPageToken = null;
      $requestCount = 0;
      $videoCount = 0;
      $tokenRefreshed = false;

      do {
        $initialResponse = $this->youtubeFetcher->fetchVideosFromPlaylist($user->google_token, $uploadsPlaylistId, $nextPageToken);

        if (!$tokenRefreshed && $initialResponse->status() === 401) {
          $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($uploadsPlaylistId, $nextPageToken) {
            return $this->youtubeFetcher->fetchVideosFromPlaylist($token, $uploadsPlaylistId, $nextPageToken);
          });

          if (!$tokenResult['success']) {
            Log::error("Token refresh failed while fetching videos", [
              'user_id' => $user->id
            ]);

            return $this->errorResponseBuilder->buildUserVideosError($tokenResult['message']);
          }

          $response = $tokenResult['response'];
          $tokenRefreshed = true;
        } else {
          $response = $initialResponse;
        }

        if ($response->successful()) {
          $data = $response->json();
          $videos = $data['items'] ?? [];

          foreach ($videos as $video) {
            $allVideos[] = $this->youtubeFormatter->formatVideoByPlaylist($video);
            $videoCount++;
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          if ($nextPageToken) {
            usleep(config('youtube.api.request_delay_microseconds'));
          }
        } else {
          $checkQuotaError = $this->youtubeErrorHelper->checkQuotaError($response);

          if ($checkQuotaError['success']) {
            Log::critical("YouTube API quota exceeded", [
              'user_id' => $user->id,
              'action' => 'get_user_videos'
            ]);

            return $this->errorResponseBuilder->buildUserVideosError($checkQuotaError['message'], true);
          }

          Log::error("Failed to fetch videos batch", [
            'user_id' => $user->id,
            'batch' => $requestCount,
            'status' => $response->status()
          ]);

          break;
        }
      } while ($nextPageToken && $requestCount < config('youtube.api.videos_max_requests'));

      $result = $this->successResponseBuilder->buildUserVideosSuccess($allVideos, $videoCount, $channel, $requestCount);

      Cache::put($cacheKey, $result, now()->addHours(config('youtube.cache.hours')));

      Log::info("User videos fetched and cached", [
        'user_id' => $user->id,
        'video_count' => $videoCount,
        'request_count' => $requestCount,
        'duration_seconds' => now()->diffInSeconds($startTime),
        'cache_hours' => config('youtube.cache.hours')
      ]);

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching user videos", [
        'user_id' => $user->id,
        'error' => $e->getMessage()
      ]);

      return $this->errorResponseBuilder->buildUserVideosError('Terjadi kesalahan saat mengambil data video. Silakan coba beberapa saat lagi');
    }
  }

  /**
   * Get comments for a given video ID.
   */
  public function getCommentsByVideoId(User $user, string $videoId): array
  {
    $startTime = now();

    try {
      $allComments = [];
      $nextPageToken = null;
      $requestCount = 0;
      $commentCount = 0;
      $tokenRefreshed = false;

      do {
        $initialResponse = $this->youtubeFetcher->fetchComments($user->google_token, $videoId, $nextPageToken);

        if (!$tokenRefreshed && $initialResponse->status() === 401) {
          $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($videoId, $nextPageToken) {
            return $this->youtubeFetcher->fetchComments($token, $videoId, $nextPageToken);
          });

          if (!$tokenResult['success']) {
            Log::error("Token refresh failed while fetching comments", [
              'user_id' => $user->id,
              'video_id' => $videoId
            ]);

            return $this->errorResponseBuilder->buildCommentsError($tokenResult['message']);
          }

          $response = $tokenResult['response'];
          $tokenRefreshed = true;
        } else {
          $response = $initialResponse;
        }

        if ($response->successful()) {
          $data = $response->json();
          $comments = $data['items'] ?? [];

          if (empty($comments) && $requestCount === 0) {
            return $this->errorResponseBuilder->buildCommentsError('Video ini tidak memiliki komentar yang tersedia.');
          }

          foreach ($comments as $comment) {
            $allComments[] = $this->youtubeFormatter->formatTopLevelComment($comment, $videoId);
            $commentCount++;
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          if ($nextPageToken) {
            usleep(config('youtube.api.request_delay_microseconds'));
          }
        } else {
          $checkQuotaError = $this->youtubeErrorHelper->checkQuotaError($response);

          if ($checkQuotaError['success']) {
            Log::critical("YouTube API quota exceeded", [
              'user_id' => $user->id,
              'action' => 'get_comments'
            ]);

            return $this->errorResponseBuilder->buildVideoError($checkQuotaError['message'], true);
          }

          $checkCommentsError = $this->youtubeErrorHelper->checkCommentsError($response);

          if ($checkCommentsError['success']) {
            Log::error("Comments fetch failed", [
              'user_id' => $user->id,
              'video_id' => $videoId,
              'error' => $checkCommentsError['message']
            ]);

            return $this->errorResponseBuilder->buildCommentsError($checkCommentsError['message']);
          }

          Log::error("YouTube API error while fetching comments", [
            'user_id' => $user->id,
            'video_id' => $videoId,
            'status' => $response->status()
          ]);

          return $this->errorResponseBuilder->buildCommentsError('Terjadi kesalahan saat mengambil data komentar. Silakan coba beberapa saat lagi.');
        }
      } while ($nextPageToken);

      $chunks = array_chunk($allComments, 100);
      $totalChunks = count($chunks);

      $chunkedComments = [
        'total_comments' => $commentCount,
        'total_chunks' => $totalChunks,
        'chunks' => []
      ];

      for ($i = 0; $i < $totalChunks; $i++) {
        $chunkedComments['chunks'][] = [
          'chunk_id' => $i + 1,
          'comments' => $chunks[$i]
        ];
      }

      $timestamp = Carbon::now()->format('Ymd_His');
      $filename = "comments/{$user->id}_{$videoId}_{$timestamp}.json";

      try {
        Storage::disk('public')->put($filename, json_encode($chunkedComments, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
      } catch (\Exception $e) {
        Log::error("Failed to save comments to file", [
          'filename' => $filename,
          'error' => $e->getMessage()
        ]);
      }

      Log::info("Comments fetched and saved", [
        'user_id' => $user->id,
        'video_id' => $videoId,
        'comment_count' => $commentCount,
        'request_count' => $requestCount,
        'filename' => $filename,
        'duration_seconds' => now()->diffInSeconds($startTime)
      ]);

      return $this->successResponseBuilder->buildCommentsSuccess($filename, $commentCount, $requestCount);
    } catch (\Exception $e) {
      Log::error("Error fetching comments", [
        'user_id' => $user->id,
        'video_id' => $videoId,
        'error' => $e->getMessage()
      ]);

      return $this->errorResponseBuilder->buildCommentsError('Terjadi kesalahan saat mengambil data komentar. Silakan coba beberapa saat lagi.');
    }
  }


  /**
   * Post moderation (heldForReview or reject) comment by ID.
   */
  public function postModerationCommentById(User $user, string $commentId, string $moderationStatus, bool $banAuthor = false): array
  {
    try {
      $initialResponse = $this->youtubeFetcher->fetchModerationComment($user->google_token, $commentId, $moderationStatus, $banAuthor);

      $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($commentId, $moderationStatus, $banAuthor) {
        return $this->youtubeFetcher->fetchModerationComment($token, $commentId, $moderationStatus, $banAuthor);
      });

      if (!$tokenResult['success']) {
        return $this->errorResponseBuilder->buildModerationCommentError($tokenResult['message'], $commentId);
      }

      $response = $tokenResult['response'];

      if (!$response->successful()) {
        $checkQuotaError = $this->youtubeErrorHelper->checkQuotaError($response);

        if ($checkQuotaError['success']) {
          Log::critical("YouTube API quota exceeded", [
            'user_id' => $user->id,
            'action' => 'moderate_comment'
          ]);

          return $this->errorResponseBuilder->buildModerationCommentError(
            $checkQuotaError['message'],
            $commentId,
            true
          );
        }

        $checkModerationCommentError = $this->youtubeErrorHelper->checkModerationCommentError($response);

        if ($checkModerationCommentError['success']) {
          Log::warning("Moderation failed for comment", [
            'user_id' => $user->id,
            'comment_id' => $commentId
          ]);

          return $this->errorResponseBuilder->buildModerationCommentError(
            $checkModerationCommentError['message'],
            $commentId
          );
        }

        Log::error("Moderation request failed", [
          'user_id' => $user->id,
          'comment_id' => $commentId,
          'status' => $response->status()
        ]);

        return $this->errorResponseBuilder->buildModerationCommentError(
          'Terjadi kesalahan saat memproses moderasi komentar. Silakan coba beberapa saat lagi.',
          $commentId
        );
      }

      Log::info("Comment moderated successfully", [
        'user_id' => $user->id,
        'comment_id' => $commentId,
      ]);
      
      return $this->successResponseBuilder->buildModerationCommentSuccess($commentId);
    } catch (\Exception $e) {
      Log::error("Error during comment moderation", [
        'user_id' => $user->id,
        'comment_id' => $commentId,
        'error' => $e->getMessage()
      ]);

      return $this->errorResponseBuilder->buildModerationCommentError(
        'Terjadi kesalahan saat memproses moderasi komentar. Silakan coba beberapa saat lagi.',
        $commentId
      );
    }
  }

  private function updateJsonFileStatus($filePath, $commentId, $newStatus)
  {
    try {
      if (!file_exists($filePath)) {
        Log::warning("JSON file not found", [
          'file_path' => $filePath,
          'comment_id' => $commentId
        ]);

        return false;
      }

      $jsonContent = file_get_contents($filePath);
      $data = json_decode($jsonContent, true);

      if (!$data || !isset($data['chunks'])) {
        Log::warning("Invalid JSON structure", [
          'file_path' => $filePath,
          'comment_id' => $commentId
        ]);

        return false;
      }

      $updated = false;
      foreach ($data['chunks'] as &$chunk) {
        if (isset($chunk['comments'])) {
          foreach ($chunk['comments'] as &$comment) {
            if ($comment['comment_id'] === $commentId) {
              $comment['status'] = $newStatus;
              $updated = true;
              break 2;
            }
          }
        }
      }

      if ($updated) {
        $result = file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        if ($result === false) {
          Log::error("Failed to write updated JSON", [
            'file_path' => $filePath,
            'comment_id' => $commentId
          ]);

          return false;
        }

        return true;
      } else {
        Log::warning("Comment not found in JSON file", [
          'file_path' => $filePath,
          'comment_id' => $commentId
        ]);

        return false;
      }
    } catch (\Exception $e) {
      Log::error("Error updating JSON file", [
        'file_path' => $filePath,
        'comment_id' => $commentId,
        'error' => $e->getMessage()
      ]);

      return false;
    }
  }
}
