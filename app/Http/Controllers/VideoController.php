<?php

namespace App\Http\Controllers;

use App\Services\YouTubeService;
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
     * Get all user videos (JSON response)
     */
    public function getAllVideos(Request $request)
    {
        $user = Auth::user();

        // Check if user has google token
        if (!$user->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'videos' => [],
                'total' => 0,
                'from_cache' => false
            ], 401);
        }

        // Check if force refresh is requested
        $forceRefresh = $request->boolean('refresh', false);

        try {
            // Determine if we should fetch fresh data
            $shouldFetchFresh = false;

            if ($forceRefresh) {
                // User explicitly requested refresh
                $shouldFetchFresh = true;
                Log::info("Force refresh requested for user: {$user->id}");
            } else {
                // Check if cache exists and is still valid
                $isCached = $this->youtubeService->isVideosCached($user->id);

                if (!$isCached) {
                    // No cache exists - this is likely first time or cache expired
                    $shouldFetchFresh = true;
                    Log::info("No cache found for user: {$user->id}, fetching fresh data");
                } else {
                    Log::info("Cache found for user: {$user->id}, using cached data");
                }
            }

            // Get videos (either from cache or fresh from API)
            $result = $this->youtubeService->getAllUserVideos(
                $user->id,
                $user->google_token,
                $shouldFetchFresh
            );

            // Log the action
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
                'from_cache' => false
            ], 500);
        }
    }

    /**
     * Clear videos cache
     */
    public function clearCache()
    {
        $user = Auth::user();

        $this->youtubeService->clearUserVideosCache($user->id);

        Log::info("Cache manually cleared for user: {$user->id}");

        return response()->json([
            'success' => true,
            'message' => 'Cache cleared successfully'
        ]);
    }

    /**
     * Get cache status with detailed information
     */
    public function getCacheStatus()
    {
        $user = Auth::user();

        $isCached = $this->youtubeService->isVideosCached($user->id);
        $cacheExpiry = $this->youtubeService->getCacheExpiry($user->id);

        return response()->json([
            'success' => true,
            'is_cached' => $isCached,
            'cache_key' => "user_videos_{$user->id}",
            'cache_expiry' => $cacheExpiry,
            'is_expired' => $this->youtubeService->isCacheExpired($user->id)
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
                'from_cache' => false
            ], 401);
        }

        try {
            // Clear cache first
            $this->youtubeService->clearUserVideosCache($user->id);

            // Fetch fresh data
            $result = $this->youtubeService->getAllUserVideos(
                $user->id,
                $user->google_token,
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
