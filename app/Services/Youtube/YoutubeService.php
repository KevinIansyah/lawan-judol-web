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
      $initialResponse = $this->youtubeFetcher->videoDetailsById($user->google_token, $videoId);

      $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($videoId) {
        return $this->youtubeFetcher->videoDetailsById($token, $videoId);
      });

      if (!$tokenResult['success']) {
        return $this->errorResponseBuilder->videoErrorResponse($tokenResult['message']);
      }

      $response = $tokenResult['response'];

      if (!$response->successful()) {
        $quotaError = $this->youtubeErrorHelper->quotaError($response);

        if ($quotaError['reason']) {
          Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");
          return $this->errorResponseBuilder->videoErrorResponse($quotaError['message']);
        }

        $videoError = $this->youtubeErrorHelper->videoError($response);
        if ($videoError['reason']) {
          Log::warning("Video not found or forbidden for user ID {$user->id}.");
          return $this->errorResponseBuilder->videoErrorResponse($videoError['message']);
        }

        Log::error("Video fetch failed with status {$response->status()} for user ID {$user->id}.");
        return $this->errorResponseBuilder->videoErrorResponse('Terjadi kesalahan saat mengambil data video. Silakan coba beberapa saat lagi.');
      }

      $items = $response->json('items', []);

      if (empty($items)) {
        return $this->errorResponseBuilder->videoErrorResponse('Video tidak ditemukan atau telah dihapus. Pastikan ID video yang Anda masukkan benar.');
      }

      $video = $this->youtubeFormatter->videoFromApiById($items[0]);

      Log::info("Fetched video: {$video['title']} from channel: {$video['channel_title']}");

      return $this->successResponseBuilder->videoSuccessResponse($video);
    } catch (\Exception $e) {
      Log::error("Error fetching video: " . $e->getMessage(), [
        'user_id' => $user->id,
        'video_id' => $videoId,
        'trace' => $e->getTraceAsString()
      ]);

      return $this->errorResponseBuilder->videoErrorResponse('Terjadi kesalahan saat mengambil data video. Silakan coba beberapa saat lagi');
    }
  }

  /**
   * Get authenticated user's channel information.
   */
  public function getUserChannel(User $user): ?array
  {
    try {
      $initialResponse = $this->youtubeFetcher->authenticatedUserChannel($user->google_token);

      $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) {
        return $this->youtubeFetcher->authenticatedUserChannel($token);
      });

      if (!$tokenResult['success']) {
        return null;
      }

      $response = $tokenResult['response'];

      if (!$response->successful()) {
        $quotaError = $this->youtubeErrorHelper->quotaError($response);

        if ($quotaError['reason']) {
          Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");
          return $this->errorResponseBuilder->userVideosErrorResponse($quotaError['message']);
        }

        $channelError = $this->youtubeErrorHelper->channelError($response);
        if ($channelError['reason']) {
          Log::warning("Channel not found or forbidden for user ID {$user->id}.");
          return $this->errorResponseBuilder->userVideosErrorResponse($channelError['message']);
        }

        Log::error("Channel fetch failed with status {$response->status()} for user ID {$user->id}.");
        return $this->errorResponseBuilder->userVideosErrorResponse('Terjadi kesalahan saat mengambil data channel. Silakan coba beberapa saat lagi.');
      }

      return $tokenResult['response']->json();
    } catch (\Exception $e) {
      Log::error("Error fetching user channel: " . $e->getMessage(), [
        'user_id' => $user->id,
        'trace' => $e->getTraceAsString()
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
      Log::info("Returning cached videos for user: {$user->id}");
      $cachedData['from_cache'] = true;
      return $cachedData;
    }

    try {
      $channelData = $this->getUserChannel($user);

      if (!$channelData || empty($channelData['items'])) {
        return $this->errorResponseBuilder->userVideosErrorResponse('Channel tidak ditemukan atau Anda tidak memiliki izin untuk mengaksesnya.');
      }

      $channel = $channelData['items'][0];
      $uploadsPlaylistId = $channel['contentDetails']['relatedPlaylists']['uploads'];

      $allVideos = [];
      $nextPageToken = null;
      $requestCount = 0;
      $videoCount = 0;
      $tokenRefreshed = false;

      Log::info("Starting to fetch all videos from YouTube API for user: {$user->id}");

      do {
        $initialResponse = $this->youtubeFetcher->videosFromUploadsPlaylist($user->google_token, $uploadsPlaylistId, $nextPageToken);

        if (!$tokenRefreshed && $initialResponse->status() === 401) {
          $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($uploadsPlaylistId, $nextPageToken) {
            return $this->youtubeFetcher->videosFromUploadsPlaylist($token, $uploadsPlaylistId, $nextPageToken);
          });

          if (!$tokenResult['success']) {
            Log::error("Failed to refresh token while fetching videos for user ID {$user->id}.");
            return $this->errorResponseBuilder->userVideosErrorResponse($tokenResult['message']);
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
            $allVideos[] = $this->youtubeFormatter->videoFromChannelList($video);
            $videoCount++;
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          Log::info("Fetched batch {$requestCount}, got " . count($videos) . " videos");

          if ($nextPageToken) {
            usleep(config('youtube.api.request_delay_microseconds'));
          }
        } else {
          $quotaError = $this->youtubeErrorHelper->quotaError($response);

          if ($quotaError['reason']) {
            Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");
            return $this->errorResponseBuilder->userVideosErrorResponse($quotaError['message']);
          }

          Log::error("Failed to fetch videos batch {$requestCount} for user ID {$user->id}");
          break;
        }
      } while ($nextPageToken && $requestCount < config('youtube.api.max_requests'));

      $result = $this->successResponseBuilder->userVideosSuccessResponse($allVideos, $videoCount, $channel, $requestCount);

      Cache::put($cacheKey, $result, now()->addHours(config('youtube.cache.hours')));

      Log::info("Successfully fetched and cached {$result['total']} videos for user: {$user->id} for " . config('youtube.cache.hours') . " hours");

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching user videos: " . $e->getMessage(), [
        'user_id' => $user->id,
        'trace' => $e->getTraceAsString()
      ]);

      return $this->errorResponseBuilder->userVideosErrorResponse('Terjadi kesalahan saat mengambil data video. Silakan coba beberapa saat lagi');
    }
  }

  /**
   * Get comments for a given video ID.
   */
  public function getCommentsByVideoId(User $user, string $videoId): array
  {
    try {
      $allComments = [];
      $nextPageToken = null;
      $requestCount = 0;
      $commentCount = 0;
      $tokenRefreshed = false;

      Log::info("Starting to fetch all comments from YouTube API for video: {$videoId} for user: {$user->id}");

      do {
        $initialResponse = $this->youtubeFetcher->videoComments($user->google_token, $videoId, $nextPageToken);

        if (!$tokenRefreshed && $initialResponse->status() === 401) {
          $tokenResult = $this->tokenHandler->tokenRefresh($user, $initialResponse, function ($token) use ($videoId, $nextPageToken) {
            return $this->youtubeFetcher->videoComments($token, $videoId, $nextPageToken);
          });

          if (!$tokenResult['success']) {
            Log::error("Failed to refresh token while fetching comments for user ID {$user->id}.");
            return $this->errorResponseBuilder->commentsErrorResponse($tokenResult['message']);
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
            Log::info("Tidak ditemukan komentar untuk video ID {$videoId} milik user ID {$user->id} pada permintaan pertama.");
            return $this->errorResponseBuilder->commentsErrorResponse('Video ini tidak memiliki komentar yang tersedia.');
          }

          foreach ($comments as $comment) {
            $allComments[] = $this->youtubeFormatter->topLevelComment($comment, $videoId);
            $commentCount++;
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          Log::info("Fetched batch {$requestCount}, got " . count($comments) . " comments");

          if ($nextPageToken) {
            usleep(config('youtube.api.request_delay_microseconds'));
          }
        } else {
          $quotaError = $this->youtubeErrorHelper->quotaError($response);

          if ($quotaError['reason']) {
            Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");
            return $this->errorResponseBuilder->videoErrorResponse($quotaError['message']);
          }

          $commentsError = $this->youtubeErrorHelper->commentsError($response);

          if ($commentsError['reason']) {
            Log::critical("Failed to fetch comments for user ID {$user->id}, video ID {$videoId}.");
            return $this->errorResponseBuilder->commentsErrorResponse($commentsError['message']);
          }

          Log::error("YouTube API error while fetching comments: " . $response->body());
          return $this->errorResponseBuilder->commentsErrorResponse('Terjadi kesalahan saat mengambil data komentar. Silakan coba beberapa saat lagi.');
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
        Log::error("Failed to save comments to file: " . $e->getMessage());
      }

      Log::info("Successfully fetched {$commentCount} comments for video: {$videoId} and for user: {$user->id} and filename: {$filename}");

      return $this->successResponseBuilder->commentsSuccessResponse($filename, $commentCount, $requestCount);
    } catch (\Exception $e) {
      Log::error("Error fetching comments: " . $e->getMessage(), [
        'user_id' => $user->id,
        'video_id' => $videoId,
        'trace' => $e->getTraceAsString()
      ]);

      return $this->errorResponseBuilder->commentsErrorResponse('Terjadi kesalahan saat mengambil data komentar. Silakan coba beberapa saat lagi.');
    }
  }
}
