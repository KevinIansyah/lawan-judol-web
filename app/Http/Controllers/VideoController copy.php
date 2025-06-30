<?php

namespace App\Http\Controllers;

use App\Services\YouTubeService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class VideoController extends Controller
{
    protected $youtubeService;

    public function __construct(YouTubeService $youtubeService)
    {
        $this->youtubeService = $youtubeService;
    }

    /**
     * Get video (JSON response)
     */
    public function getVideo(Request $request)
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

        try {
            $result = $this->youtubeService->getVideoById(
                $user,
                $videoId
            );

            if ($result['success']) {
                Log::info("Successfully returned video: {$result['video']['title']} for user: {$user->id}");
            }

            return response()->json($result);
        } catch (ConnectionException $e) {
            Log::warning("Koneksi gagal saat mengambil video: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => '',
                'video' => null,
                'total' => 0,
            ], 503);
        } catch (\Exception $e) {
            Log::error("Error in getVideo for user {$user->id}: " . $e->getMessage());

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
    public function getVideos(Request $request)
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
            $shouldFetchFresh = false;

            if ($forceRefresh) {
                $shouldFetchFresh = true;
                Log::info("Force refresh requested for user: {$user->id}");
            } else {
                $isCached = $this->youtubeService->isVideosCached($user);

                if (!$isCached) {
                    $shouldFetchFresh = true;
                    Log::info("No cache found for user: {$user->id}, fetching fresh data");
                } else {
                    Log::info("Cache found for user: {$user->id}, using cached data");
                }
            }

            $result = $this->youtubeService->getUserVideos(
                $user,
                $shouldFetchFresh
            );

            if ($result['success']) {
                $source = $result['from_cache'] ? 'cache' : 'YouTube API';
                Log::info("Successfully returned {$result['total']} videos from {$source} for user: {$user->id}");
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Error in getAllVideos for user {$user->id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil video. Silakan coba lagi.',
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
    public function getComments(Request $request)
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
            $result = $this->youtubeService->getCommentsByVideoId(
                $user,
                $videoId
            );

            if ($result['success']) {
                Log::info("Successfully returned comments: {$result['total']} for user: {$user->id}");
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Error in getComments for user {$user->id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil komentar. Silakan coba lagi.',
                'comments' => '',
                'total' => 0,
            ], 500);
        }
    }

    /**
     * Clear videos cache
     */
    public function clearCache()
    {
        $user = Auth::user();

        $this->youtubeService->clearUserVideosCache($user);

        Log::info("Cache manually cleared for user: {$user->id}");

        return response()->json([
            'success' => true,
            'message' => 'Cache berhasil dibersihkan'
        ]);
    }

    /**
     * Get cache status with detailed information
     */
    public function getCacheStatus()
    {
        $user = Auth::user();

        $isCached = $this->youtubeService->isVideosCached($user);
        $cacheExpiry = $this->youtubeService->getCacheExpiry($user);

        return response()->json([
            'success' => true,
            'is_cached' => $isCached,
            'cache_key' => "user_videos_{$user->id}",
            'cache_expiry' => $cacheExpiry,
            'is_expired' => $this->youtubeService->isCacheExpired($user)
        ]);
    }

    /**
     * Force refresh videos (clear cache and fetch fresh data)
     */
    public function forceRefresh()
    {
        $user = Auth::user();

        // Check if user has google token
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

        try {
            // Clear cache first
            $this->youtubeService->clearUserVideosCache($user);

            // Fetch fresh data
            $result = $this->youtubeService->getUserVideos(
                $user,
                true // Force refresh
            );

            Log::info("Force refresh completed for user: {$user->id}");

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Error in forceRefresh for user {$user->id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui video. Silakan coba lagi.',
                'videos' => [],
                'total' => 0,
                'channel_info' => null,
                'from_cache' => false
            ], 500);
        }
    }

    /**
     * Display videos page (optional - for web interface)
     */
    public function index()
    {
        return view('videos.index');
    }
}
