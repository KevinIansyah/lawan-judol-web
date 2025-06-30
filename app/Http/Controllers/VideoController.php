<?php

namespace App\Http\Controllers;

use App\Services\Youtube\YoutubeService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class VideoController extends Controller
{
    protected $youtubeService;

    public function __construct(YoutubeService $youtubeService)
    {
        $this->youtubeService = $youtubeService;
    }

    /**
     * Get user-friendly error message and status code
     */
    private function getErrorResponse(\Exception $e, string $context = 'operation'): array
    {
        $message = $e->getMessage();
        $statusCode = 500;
        $userMessage = 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';

        // Network/Connection errors
        if (
            $e instanceof ConnectionException ||
            str_contains($message, 'cURL error') ||
            str_contains($message, 'Connection') ||
            str_contains($message, 'network') ||
            str_contains($message, 'timeout')
        ) {

            $statusCode = 503;
            $userMessage = 'Tidak dapat terhubung ke layanan YouTube. Periksa koneksi internet Anda dan coba lagi.';
        } elseif (str_contains($message, 'quotaExceeded')) {
            $statusCode = 429;
            $userMessage = 'Batas penggunaan YouTube API telah tercapai. Coba lagi dalam beberapa jam.';
        } elseif (str_contains($message, 'videoNotFound') || str_contains($message, 'Video not found')) {
            $statusCode = 404;
            $userMessage = 'Video tidak ditemukan. Pastikan ID video yang Anda masukkan benar.';
        } elseif (str_contains($message, 'forbidden') || str_contains($message, 'accessNotConfigured')) {
            $statusCode = 403;
            $userMessage = 'Akses ditolak. Periksa pengaturan privasi video atau coba video lain.';
        } elseif (str_contains($message, 'invalid') && str_contains($message, 'videoId')) {
            $statusCode = 400;
            $userMessage = 'ID video tidak valid. Periksa kembali ID video yang Anda masukkan.';
        }
        // Authentication errors
        elseif (str_contains($message, 'unauthorized') || str_contains($message, 'authentication')) {
            $statusCode = 401;
            $userMessage = 'Akun Google belum terhubung atau sesi telah berakhir. Silakan login ulang.';
        }

        // Log the technical error for developers
        Log::error("Error in {$context}: " . $message, [
            'exception' => $e,
            'user_id' => Auth::id(),
            'context' => $context,
            'trace' => $e->getTraceAsString()
        ]);

        return [
            'status_code' => $statusCode,
            'user_message' => $userMessage,
            'technical_message' => config('app.debug') ? $message : null
        ];
    }

    /**
     * Check if user has valid Google token
     */
    private function checkGoogleToken(): ?JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'error_code' => 'GOOGLE_TOKEN_MISSING'
            ], 401);
        }

        return null;
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
            Log::error("Gagal mengambil video di getVideo(): " . $e->getMessage(), [
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
        // Check authentication
        if ($tokenError = $this->checkGoogleToken()) {
            return $tokenError;
        }

        $user = Auth::user();
        $forceRefresh = $request->boolean('refresh', false);

        try {
            $shouldFetchFresh = $forceRefresh || !$this->youtubeService->isVideosCached($user);

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
            $errorResponse = $this->getErrorResponse($e, 'getVideos');

            return response()->json([
                'success' => false,
                'message' => $errorResponse['user_message'],
                'videos' => [],
                'total' => 0,
                'channel_info' => null,
                'from_cache' => false,
                'error_code' => 'VIDEOS_FETCH_ERROR',
                'debug_info' => $errorResponse['technical_message']
            ], $errorResponse['status_code']);
        }
    }

    /**
     * Get comments (JSON response)
     */
    public function getComments(Request $request): JsonResponse
    {
        // Check authentication
        if ($tokenError = $this->checkGoogleToken()) {
            return $tokenError;
        }

        $user = Auth::user();
        $videoId = $request->input('video_id');

        // Validate video ID format
        // if (empty($videoId) || !$this->isValidYouTubeVideoId($videoId)) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'ID video tidak valid. Pastikan Anda memasukkan ID video YouTube yang benar.',
        //         'comments' => '',
        //         'total' => 0,
        //         'error_code' => 'INVALID_VIDEO_ID'
        //     ], 400);
        // }

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
            $errorResponse = $this->getErrorResponse($e, 'getComments');

            return response()->json([
                'success' => false,
                'message' => $errorResponse['user_message'],
                'comments' => '',
                'total' => 0,
                'error_code' => 'COMMENTS_FETCH_ERROR',
                'debug_info' => $errorResponse['technical_message']
            ], $errorResponse['status_code']);
        }
    }

    /**
     * Clear user videos cache
     */
    public function clearCache(Request $request): JsonResponse
    {
        // Check authentication
        if ($tokenError = $this->checkGoogleToken()) {
            return $tokenError;
        }

        $user = Auth::user();

        try {
            $this->youtubeService->clearUserVideosCache($user);

            Log::info("Cache cleared for user: {$user->id}");

            return response()->json([
                'success' => true,
                'message' => 'Cache berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            $errorResponse = $this->getErrorResponse($e, 'clearCache');

            return response()->json([
                'success' => false,
                'message' => $errorResponse['user_message'],
                'error_code' => 'CACHE_CLEAR_ERROR',
                'debug_info' => $errorResponse['technical_message']
            ], $errorResponse['status_code']);
        }
    }

    /**
     * Get cache information
     */
    public function getCacheInfo(Request $request): JsonResponse
    {
        // Check authentication
        if ($tokenError = $this->checkGoogleToken()) {
            return $tokenError;
        }

        $user = Auth::user();

        try {
            $cacheInfo = $this->youtubeService->getCacheExpiry($user);

            return response()->json([
                'success' => true,
                'message' => 'Informasi cache berhasil diambil.',
                'cache_info' => $cacheInfo,
                'is_cached' => $this->youtubeService->isVideosCached($user)
            ]);
        } catch (\Exception $e) {
            $errorResponse = $this->getErrorResponse($e, 'getCacheInfo');

            return response()->json([
                'success' => false,
                'message' => $errorResponse['user_message'],
                'cache_info' => null,
                'is_cached' => false,
                'error_code' => 'CACHE_INFO_ERROR',
                'debug_info' => $errorResponse['technical_message']
            ], $errorResponse['status_code']);
        }
    }

    /**
     * Validate YouTube video ID format
     */
    private function isValidYouTubeVideoId(string $videoId): bool
    {
        return preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId);
    }
}
