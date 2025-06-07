<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class YouTubeService
{
  private $baseUrl = 'https://www.googleapis.com/youtube/v3';
  private $cacheHours = 24;
  protected $googleService;

  public function __construct(GoogleService $googleService)
  {
    $this->googleService = $googleService;
  }

  /**
   * Fetch video
   */
  private function fetchVideo(string $accessToken, string $videoId)
  {
    return Http::withHeaders([
      'Authorization' => 'Bearer ' . $accessToken,
    ])->get($this->baseUrl . '/videos', [
      'part' => 'id,snippet,contentDetails,statistics',
      'id' => $videoId,
    ]);
  }

  /**
   * Get video by id
   */
  public function getVideoById(User $user, $videoId)
  {
    try {
      $response = $this->fetchVideo($user->google_token, $videoId);

      if ($response->status() === 401) {
        Log::warning("Access token expired or unauthorized. Attempting to refresh token for user ID {$user->id}.");

        $refreshResult = $this->googleService->refreshAccessToken($user->google_refresh_token, $user);

        if (!$refreshResult['success']) {
          Log::error("Failed to refresh access token for user ID {$user->id}.");

          return [
            'success' => false,
            'message' => 'Token sudah tidak valid, silakan login ulang.',
            'video' => [],
            'total' => 0,
          ];
        }

        $newGoogleToken = $refreshResult['google_token'];
        Log::info("Successfully refreshed access token for user ID {$user->id}. Retrying video fetch.");

        $response = $this->fetchVideo($newGoogleToken, $videoId);

        if (!$response->successful()) {
          Log::error("Failed to fetch video after token refresh for user ID {$user->id}.");

          return [
            'success' => false,
            'message' => 'Gagal mengambil data video setelah refresh token, silahkan login ulang.',
            'video' => [],
            'total' => 0,
          ];
        }
      } elseif (!$response->successful()) {
        Log::error("Video fetch failed with status {$response->status()} for user ID {$user->id}.");

        return [
          'success' => false,
          'message' => 'Gagal mengambil data video.',
          'video' => [],
          'total' => 0,
        ];
      }

      $items = $response['items'];

      if (empty($items)) {
        return [
          'success' => false,
          'message' => 'Video tidak ditemukan.',
          'video' => [],
          'total' => 0,
        ];
      }

      $video = $items[0];
      $snippet = $video['snippet'];

      $result = [
        'success' => true,
        'message' => 'Video berhasil diambil.',
        'video' => [
          'video_id' => $video['id'],
          'title' => $snippet['title'],
          'description' => $snippet['description'],
          'thumbnail' => $snippet['thumbnails']['medium']['url'] ?? $snippet['thumbnails']['default']['url'],
          'published_at' => $snippet['publishedAt'],
          'channel_title' => $snippet['channelTitle'],
          'youtube_url' => 'https://www.youtube.com/watch?v=' . $video['id'],
        ],
        'total' => 1,
      ];

      Log::info("Fetched video: {$result['video']['title']} from channel: {$result['video']['channel_title']}");

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching video: " . $e->getMessage());

      return [
        'success' => false,
        'message' => 'Terjadi kesalahan saat mengambil video: ' . $e->getMessage(),
        'video' => [],
        'total' => 0,
      ];
    }
  }

  /**
   * Get user's channel info
   */
  public function getUserChannel($accessToken)
  {
    $response = Http::withHeaders([
      'Authorization' => 'Bearer ' . $accessToken,
    ])->get($this->baseUrl . '/channels', [
      'part' => 'id,snippet,contentDetails,statistics',
      'mine' => 'true'
    ]);

    return $response->successful() ? $response->json() : null;
  }

  /**
   * Get ALL user's videos with caching (24 hours)
   */
  public function getAllUserVideos($userId, $accessToken, $forceRefresh = false)
  {
    $cacheKey = "user_videos_{$userId}";

    // Check cache first (unless force refresh)
    if (!$forceRefresh && Cache::has($cacheKey)) {
      $cachedData = Cache::get($cacheKey);
      Log::info("Returning cached videos for user: {$userId}");

      // Add flag to indicate data is from cache
      $cachedData['from_cache'] = true;

      return $cachedData;
    }

    try {
      // Get channel info first
      $channelData = $this->getUserChannel($accessToken);

      if (!$channelData || empty($channelData['items'])) {
        return [
          'success' => false,
          'message' => 'Channel tidak ditemukan atau tidak memiliki akses.',
          'videos' => [],
          'total' => 0,
          'from_cache' => false
        ];
      }

      $channel = $channelData['items'][0];
      $uploadsPlaylistId = $channel['contentDetails']['relatedPlaylists']['uploads'];

      // Get all videos with pagination
      $allVideos = [];
      $nextPageToken = null;
      $requestCount = 0;
      $maxRequests = 20; // Safety limit to prevent infinite loop

      Log::info("Starting to fetch all videos from YouTube API for user: {$userId}");

      do {
        $params = [
          'part' => 'snippet,contentDetails',
          'playlistId' => $uploadsPlaylistId,
          'maxResults' => 50,
        ];

        if ($nextPageToken) {
          $params['pageToken'] = $nextPageToken;
        }

        $response = Http::withHeaders([
          'Authorization' => 'Bearer ' . $accessToken,
        ])->timeout(30)->get($this->baseUrl . '/playlistItems', $params);

        if ($response->successful()) {
          $data = $response->json();
          $videos = $data['items'] ?? [];

          // Process and clean video data
          foreach ($videos as $video) {
            $allVideos[] = [
              'video_id' => $video['snippet']['resourceId']['videoId'],
              'title' => $video['snippet']['title'],
              'description' => $video['snippet']['description'],
              'thumbnail' => $video['snippet']['thumbnails']['medium']['url'] ?? $video['snippet']['thumbnails']['default']['url'],
              'published_at' => $video['snippet']['publishedAt'],
              'channel_title' => $video['snippet']['channelTitle'],
              'youtube_url' => 'https://www.youtube.com/watch?v=' . $video['snippet']['resourceId']['videoId']
            ];
          }

          $nextPageToken = $data['nextPageToken'] ?? null;
          $requestCount++;

          Log::info("Fetched batch {$requestCount}, got " . count($videos) . " videos");

          // Small delay to avoid rate limiting
          usleep(100000); // 0.1 second

        } else {
          Log::error("YouTube API error: " . $response->body());
          break;
        }
      } while ($nextPageToken && $requestCount < $maxRequests);

      $result = [
        'success' => true,
        'message' => 'Data video berhasil diambil',
        'videos' => $allVideos,
        'total' => count($allVideos),
        'channel_info' => [
          'title' => $channel['snippet']['title'],
          'description' => $channel['snippet']['description'],
          'subscriber_count' => $channel['statistics']['subscriberCount'] ?? 0,
          'video_count' => $channel['statistics']['videoCount'] ?? 0,
          'view_count' => $channel['statistics']['viewCount'] ?? 0
        ],
        'cached_at' => now()->toISOString(),
        'requests_made' => $requestCount,
        'from_cache' => false
      ];

      // Cache for 24 hours
      Cache::put($cacheKey, $result, now()->addHours($this->cacheHours));

      Log::info("Successfully fetched and cached {$result['total']} videos for user: {$userId} for {$this->cacheHours} hours");

      return $result;
    } catch (\Exception $e) {
      Log::error("Error fetching user videos: " . $e->getMessage());

      return [
        'success' => false,
        'message' => 'Terjadi kesalahan saat mengambil video: ' . $e->getMessage(),
        'videos' => [],
        'total' => 0,
        'from_cache' => false
      ];
    }
  }

  /**
   * Clear user videos cache
   */
  public function clearUserVideosCache($userId)
  {
    $cacheKey = "user_videos_{$userId}";
    Cache::forget($cacheKey);

    Log::info("Cleared video cache for user: {$userId}");

    return true;
  }

  /**
   * Check if user videos are cached and still valid
   */
  public function isVideosCached($userId)
  {
    $cacheKey = "user_videos_{$userId}";
    return Cache::has($cacheKey);
  }

  /**
   * Get cache expiry time for user videos
   */
  public function getCacheExpiry($userId)
  {
    $cacheKey = "user_videos_{$userId}";

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
  public function isCacheExpired($userId)
  {
    $cacheInfo = $this->getCacheExpiry($userId);

    if (!$cacheInfo) {
      return true; // No cache means expired
    }

    return $cacheInfo['hours_remaining'] <= 0;
  }
}
