<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class YouTubeService
{
  private $baseUrl = 'https://www.googleapis.com/youtube/v3';
  private $cacheHours = 24;
  protected $googleService;

  public function __construct(GoogleService $googleService)
  {
    $this->googleService = $googleService;
  }

  private function handleTokenRefresh(User $user, $initialResponse, callable $retryCallback)
  {
    if ($initialResponse->status() === 401) {
      Log::warning("Google token expired or unauthorized. Attempting to refresh token for user ID {$user->id}.");

      if (empty($user->google_refresh_token)) {
        Log::error("No refresh token available for user ID {$user->id}.");
        return [
          'success' => false,
          'response' => null,
          'message' => 'Refresh token tidak tersedia, silakan login ulang.'
        ];
      }

      $refreshResult = $this->googleService->refreshGoogleToken($user->google_refresh_token, $user);

      if (!$refreshResult['success']) {
        Log::error("Failed to refresh google token for user ID {$user->id}.");
        return [
          'success' => false,
          'response' => null,
          'message' => 'Token sudah tidak valid, silakan login ulang.'
        ];
      }

      $user->google_token = $refreshResult['google_token'];
      Log::info("Successfully refreshed google token for user ID {$user->id}. Retrying request.");

      $retryResponse = $retryCallback($user->google_token);

      if (!$retryResponse->successful()) {
        Log::error("Failed to fetch data after token refresh for user ID {$user->id}.");
        return [
          'success' => false,
          'response' => null,
          'message' => 'Gagal mengambil data setelah refresh token, silahkan login ulang.'
        ];
      }

      return [
        'success' => true,
        'response' => $retryResponse,
        'message' => 'Request berhasil setelah refresh token.'
      ];
    }

    return [
      'success' => $initialResponse->successful(),
      'response' => $initialResponse,
      'message' => $initialResponse->successful() ? 'Request berhasil.' : 'Request gagal.'
    ];
  }

  private function videoErrorResponse(string $message)
  {
    return [
      'success' => false,
      'message' => $message,
      'video' => null,
      'total' => 0,
    ];
  }

  private function userVideosErrorResponse(string $message)
  {
    return [
      'success' => false,
      'message' => $message,
      'videos' => [],
      'total' => 0,
      'channel_info' => null,
      'from_cache' => false,
    ];
  }

  private function commentsErrorResponse(string $message): array
  {
    return [
      'success' => false,
      'message' => $message,
      'comments' => '',
      'total' => 0,
    ];
  }

  private function fetchVideo(string $googleToken, string $videoId)
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->get($this->baseUrl . '/videos', [
      'part' => 'id,snippet,contentDetails,statistics',
      'id' => $videoId,
    ]);
  }

  private function fetchUserChannel(string $googleToken)
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->get($this->baseUrl . '/channels', [
      'part' => 'id,snippet,contentDetails,statistics',
      'mine' => 'true'
    ]);
  }

  private function fetchUserVideos(string $googleToken, string $uploadsPlaylistId, ?string $nextPageToken = null)
  {
    $params = [
      'part' => 'snippet,contentDetails',
      'playlistId' => $uploadsPlaylistId,
      'maxResults' => 50,
    ];

    if ($nextPageToken) {
      $params['pageToken'] = $nextPageToken;
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(30)->get($this->baseUrl . '/playlistItems', $params);
  }

  private function fetchComments(string $googleToken, string $videoId, ?string $nextPageToken = null)
  {
    $params = [
      'part' => 'snippet',
      'videoId' => $videoId,
      'maxResults' => 100,
    ];

    if ($nextPageToken) {
      $params['pageToken'] = $nextPageToken;
    }

    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $googleToken,
    ])->timeout(30)->get($this->baseUrl . '/commentThreads', $params);
  }

  public function getVideoById(User $user, $videoId)
  {
    try {
      $initialResponse = $this->fetchVideo($user->google_token, $videoId);

      $tokenResult = $this->handleTokenRefresh($user, $initialResponse, function ($token) use ($videoId) {
        return $this->fetchVideo($token, $videoId);
      });

      if (!$tokenResult['success']) {
        return $this->videoErrorResponse($tokenResult['message']);
      }

      $response = $tokenResult['response'];

      if (!$response->successful()) {
        $errorBody = $response->json();
        $reason = $errorBody['error']['errors'][0]['reason'] ?? null;

        if ($reason === 'quotaExceeded') {
          Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");

          return $this->videoErrorResponse('Kuota YouTube API telah habis. Silakan coba lagi besok.');
        }

        Log::error("Video fetch failed with status {$response->status()} for user ID {$user->id}.");

        return $this->videoErrorResponse('Gagal mengambil data video.');
      }

      $items = $response['items'];

      if (empty($items)) {
        return $this->videoErrorResponse('Video tidak ditemukan.');
      }

      $video = $items[0];

      $result = [
        'success' => true,
        'message' => 'Video berhasil diambil.',
        'video' => [
          'video_id' => $video['id'],
          'title' => $video['snippet']['title'],
          'description' => $video['snippet']['description'] ?? '',
          'thumbnail' => $video['snippet']['thumbnails']['medium']['url'] ?? $video['snippet']['thumbnails']['default']['url'],
          'published_at' => $video['snippet']['publishedAt'],
          'channel_title' => $video['snippet']['channelTitle'],
          'youtube_url' => 'https://www.youtube.com/watch?v=' . $video['id'],
        ],
        'total' => 1,
      ];

      Log::info("Fetched video: {$result['video']['title']} from channel: {$result['video']['channel_title']}");

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching video: " . $e->getMessage());

      return $this->videoErrorResponse('Terjadi kesalahan saat mengambil video: ' . $e->getMessage());
    }
  }

  public function getUserChannel(User $user)
  {
    $initialResponse = $this->fetchUserChannel($user->google_token);

    $tokenResult = $this->handleTokenRefresh($user, $initialResponse, function ($token) {
      return $this->fetchUserChannel($token);
    });

    if (!$tokenResult['success']) {
      return null;
    }

    return $tokenResult['response']->json();
  }

  public function getUserVideos(User $user, $forceRefresh = false)
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

      $reason = $channelData['error']['errors'][0]['reason'] ?? null;
      if ($reason === 'quotaExceeded') {
        Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");

        return $this->userVideosErrorResponse('Kuota YouTube API telah habis. Silakan coba lagi besok.');
      }

      if (!$channelData || empty($channelData['items'])) {
        return $this->userVideosErrorResponse('Channel tidak ditemukan atau tidak memiliki akses.');
      }

      $channel = $channelData['items'][0];
      $uploadsPlaylistId = $channel['contentDetails']['relatedPlaylists']['uploads'];

      $allVideos = [];
      $nextPageToken = null;
      $requestCount = 0;
      $videoCount = 0;
      $maxRequests = 20;
      $tokenRefreshed = false;

      Log::info("Starting to fetch all videos from YouTube API for user: {$user->id}");

      do {
        $initialResponse = $this->fetchUserVideos($user->google_token, $uploadsPlaylistId, $nextPageToken);

        if (!$tokenRefreshed && $initialResponse->status() === 401) {
          $tokenResult = $this->handleTokenRefresh($user, $initialResponse, function ($token) use ($uploadsPlaylistId, $nextPageToken) {
            return $this->fetchUserVideos($token, $uploadsPlaylistId, $nextPageToken);
          });

          if (!$tokenResult['success']) {
            Log::error("Failed to refresh token while fetching comments for user ID {$user->id}.");
            return $this->videoErrorResponse($tokenResult['message']);
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
            $snippet = $video['snippet'] ?? [];

            $allVideos[] = [
              'video_id' => $snippet['resourceId']['videoId'],
              'title' => $snippet['title'],
              'description' => $snippet['description'] ?? '',
              'thumbnail' => $snippet['thumbnails']['medium']['url'] ?? $snippet['thumbnails']['default']['url'],
              'published_at' => $snippet['publishedAt'],
              'channel_title' => $snippet['channelTitle'],
              'youtube_url' => 'https://www.youtube.com/watch?v=' . $snippet['resourceId']['videoId']
            ];

            $videoCount++;
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          Log::info("Fetched batch {$requestCount}, got " . count($videos) . " videos");

          usleep(100000);
        } else {
          $errorBody = $response->json();
          $reason = $errorBody['error']['errors'][0]['reason'] ?? '';

          if ($reason === 'quotaExceeded') {
            Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");

            return $this->userVideosErrorResponse('Kuota YouTube API telah habis. Silakan coba lagi besok.');
          }
        }
      } while ($nextPageToken && $requestCount < $maxRequests);

      $snippet = $channel['snippet'] ?? [];
      $statistics = $channel['statistics'] ?? [];

      $result = [
        'success' => true,
        'message' => 'Data video berhasil diambil',
        'videos' => $allVideos,
        'total' => $videoCount,
        'channel_info' => [
          'title' => $snippet['title'],
          'description' => $snippet['description'] ?? '',
          'subscriber_count' => $statistics['subscriberCount'] ?? 0,
          'video_count' => $statistics['videoCount'] ?? 0,
          'view_count' => $statistics['viewCount'] ?? 0
        ],
        'cached_at' => now()->toISOString(),
        'requests_made' => $requestCount,
        'from_cache' => false
      ];

      Cache::put($cacheKey, $result, now()->addHours($this->cacheHours));

      Log::info("Successfully fetched and cached {$result['total']} videos for user: {$user->id} for {$this->cacheHours} hours");

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching user videos: " . $e->getMessage());

      return $this->userVideosErrorResponse('Terjadi kesalahan saat mengambil video: ' . $e->getMessage());
    }
  }

  public function getCommentsByVideoId(User $user, $videoId)
  {
    try {
      $allComments = [];
      $nextPageToken = null;
      $requestCount = 0;
      $commentCount = 0;
      $tokenRefreshed = false;

      Log::info("Starting to fetch all comments from YouTube API for video: {$videoId} for user: {$user->id}");

      do {
        $initialResponse = $this->fetchComments($user->google_token, $videoId, $nextPageToken);

        if (!$tokenRefreshed && $initialResponse->status() === 401) {
          $tokenResult = $this->handleTokenRefresh($user, $initialResponse, function ($token) use ($videoId, $nextPageToken) {
            return $this->fetchComments($token, $videoId, $nextPageToken);
          });

          if (!$tokenResult['success']) {
            Log::error("Failed to refresh token while fetching comments for user ID {$user->id}.");

            return $this->commentsErrorResponse($tokenResult['message']);
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
            Log::info("Video ID {$videoId} has no comments for user ID {$user->id}.");

            return $this->commentsErrorResponse('Video tidak memiliki komentar.');
          }

          foreach ($comments as $comment) {
            $topLevelComment = $comment['snippet']['topLevelComment'] ?? [];
            $snippet = $topLevelComment['snippet'] ?? [];

            $allComments[] = [
              'comment_id' => $topLevelComment['id'],
              'text' => $snippet['textDisplay'],
              'label' => 0,
              'source' => "Video: {$videoId}",
              'timestamp' => $snippet['publishedAt'],
              'user_metadata' => [
                'username' => $snippet['authorDisplayName'],
                'user_id' => $snippet['authorChannelId']['value'] ?? null,
                'profile_url' => $snippet['authorProfileImageUrl'],
              ],
              'status' => 'draft',
            ];

            $commentCount++;
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          Log::info("Fetched batch {$requestCount}, got " . count($comments) . " comments");

          usleep(100000);
        } else {
          $errorBody = $response->json();
          $reason = $errorBody['error']['errors'][0]['reason'] ?? null;

          if ($reason === 'quotaExceeded') {
            Log::critical("YouTube API quota exceeded for user ID {$user->id}. Cannot continue.");

            return $this->commentsErrorResponse('Kuota YouTube API telah habis. Silakan coba lagi besok.');
          }

          if ($reason === 'commentsDisabled') {
            Log::warning("Comments are disabled for video ID {$videoId} by user ID {$user->id}.");

            return $this->commentsErrorResponse('Komentar dinonaktifkan pada video ini.');
          }

          Log::error("YouTube API error: " . $response->body());

          return $this->commentsErrorResponse('Terjadi kesalahan saat mengambil komentar.');
        }
      } while ($nextPageToken);

      $timestamp = Carbon::now()->format('Ymd_His');
      $filename = "comments/{$user->id}_{$videoId}_{$timestamp}.json";
      Storage::disk('public')->put($filename, json_encode($allComments, JSON_PRETTY_PRINT));

      $result = [
        'success' => true,
        'message' => 'Data komentar berhasil diambil',
        'comments' => $filename,
        'total' => $commentCount,
        'requests_made' => $requestCount,
      ];

      Log::info("Successfully fetched {$result['total']} comments for video: {$videoId} and for user: {$user->id}");

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching comment " . $e->getMessage());

      return $this->commentsErrorResponse('Terjadi kesalahan saat mengambil komentar: ' . $e->getMessage());
    }
  }

  /**
   * Clear user videos cache
   */
  public function clearUserVideosCache(User $user)
  {
    $cacheKey = "user_videos_{$user->id}";
    Cache::forget($cacheKey);

    Log::info("Cleared video cache for user: {$user->id}");

    return true;
  }

  /**
   * Check if user videos are cached and still valid
   */
  public function isVideosCached(User $user)
  {
    $cacheKey = "user_videos_{$user->id}";
    return Cache::has($cacheKey);
  }

  /**
   * Get cache expiry time for user videos
   */
  public function getCacheExpiry(User $user)
  {
    $cacheKey = "user_videos_{$user->id}";

    if (!Cache::has($cacheKey)) {
      return null;
    }

    // Get cached data to check cached_at timestamp
    $cachedData = Cache::get($cacheKey);

    if (isset($cachedData['cached_at'])) {
      $cachedAt = Carbon::parse($cachedData['cached_at']);
      $expiresAt = $cachedAt->addHours($this->cacheHours);

      return [
        'cached_at' => $cachedAt->toISOString(),
        'expires_at' => $expiresAt->toISOString(),
        'hours_remaining' => $expiresAt->diffInHours(now(), false)
      ];
    }

    return null;
  }

  /**
   * Check if cache has expired (for debugging)
   */
  public function isCacheExpired(User $user)
  {
    $cacheInfo = $this->getCacheExpiry($user->id);

    if (!$cacheInfo) {
      return true; // No cache means expired
    }

    return $cacheInfo['hours_remaining'] <= 0;
  }
}
