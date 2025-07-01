<?php

namespace App\Http\Controllers;

use App\Services\YouTube\Handlers\CacheHandler;
use App\Services\Youtube\YoutubeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class VideoController extends Controller
{
    protected $youtubeService;
    protected $cacheHandler;

    public function __construct(YoutubeService $youtubeService, CacheHandler $cacheHandler)
    {
        $this->youtubeService = $youtubeService;
        $this->cacheHandler = $cacheHandler;
    }

    /**
     * Get video (JSON response)
     */
    public function getVideo(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'video' => null,
                'total' => 0,
            ], 401);
        }

        $videoId = $request->input('video_id');

        if (empty($videoId) || !$this->isValidYouTubeVideoId($videoId)) {
            return response()->json([
                'success' => false,
                'message' => 'ID video tidak valid. Pastikan Anda memasukkan ID video YouTube yang benar.',
                'video' => null,
                'total' => 0,
            ], 400);
        }

        try {
            $result = $this->youtubeService->getVideoById($user, $videoId);

            if ($result['success']) {
                Log::info("Successfully retrieved video for user: {$user->id}", [
                    'video_id' => $videoId,
                    'video_title' => $result['video']['title'] ?? 'Unknown'
                ]);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed fetch video in getVideo(): " . $e->getMessage(), [
                'user_id' => $user->id,
                'video_id' => $videoId ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil video. Silakan coba lagi.',
                'video' => null,
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Get all user videos (JSON response)
     */
    public function getVideos(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'videos' => [],
                'total' => 0,
                'channel_info' => null,
                'from_cache' => false
            ], 401);
        }

        $forceRefresh = $request->boolean('refresh', false);

        try {
            $shouldFetchFresh = $forceRefresh || !$this->cacheHandler->isVideosCached($user);

            if ($forceRefresh) {
                Log::info("Force refresh requested for user: {$user->id}");
            } elseif (!$shouldFetchFresh) {
                Log::info("Using cached data for user: {$user->id}");
            } else {
                Log::info("No cache found for user: {$user->id}, fetching fresh data");
            }

            $result = $this->youtubeService->getUserVideos($user, $shouldFetchFresh);

            if ($result['success']) {
                $source = $result['from_cache'] ? 'cache' : 'YouTube API';
                Log::info("Successfully returned videos for user: {$user->id}", [
                    'total_videos' => $result['total'],
                    'source' => $source,
                    'channel_title' => $result['channel_info']['title'] ?? 'Unknown'
                ]);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed fetch videos in getVideos(): " . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'videos' => [],
                'total' => 0,
                'channel_info' => null,
                'from_cache' => false
            ], 500);
        }
    }

    /**
     * Get comments (JSON response)
     */
    public function getComments(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'comments' => '',
                'total' => 0,
            ], 401);
        }

        $videoId = $request->input('video_id');

        try {
            $result = $this->youtubeService->getCommentsByVideoId($user, $videoId);

            if ($result['success']) {
                Log::info("Successfully retrieved comments for user: {$user->id}", [
                    'video_id' => $videoId,
                    'total_comments' => $result['total'],
                    'requests_made' => $result['requests_made'] ?? 0
                ]);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed fetch comments in getComments(): " . $e->getMessage(), [
                'user_id' => $user->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil komentar. Silakan coba lagi.',
                'comments' => '',
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Clear user videos cache
     */
    public function clearCache(): JsonResponse
    {
        $user = Auth::user();

        $this->cacheHandler->clearUserVideosCache($user);

        Log::info("Cache cleared for user: {$user->id}");

        return response()->json([
            'success' => true,
            'message' => 'Cache berhasil dihapus.',
        ]);
    }

    /**
     * Get cache information
     */
    public function getCacheInfo(): JsonResponse
    {
        $user = Auth::user();

        $cacheInfo = $this->cacheHandler->getCacheExpiry($user);

        return response()->json([
            'success' => true,
            'message' => 'Informasi cache berhasil diambil.',
            'cache_info' => $cacheInfo,
            'is_cached' => $this->cacheHandler->isVideosCached($user)
        ]);
    }

    /**
     * Validate YouTube video ID format
     */
    private function isValidYouTubeVideoId(string $videoId): bool
    {
        return preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId);
    }
}
