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
                Log::info("Video retrieved successfully", [
                    'user_id' => $user->id,
                    'video_id' => $videoId,
                    'video_title' => $result['video']['title'] ?? 'Unknown'
                ]);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed to fetch video", [
                'user_id' => $user->id,
                'video_id' => $videoId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil video. Silakan coba lagi.',
                'video' => null,
                'total' => 0,
            ], 500);
        }
    }

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

            $result = $this->youtubeService->getUserVideos($user, $shouldFetchFresh);

            if ($result['success']) {
                Log::info("Videos retrieved successfully", [
                    'user_id' => $user->id,
                    'total_videos' => $result['total'],
                    'from_cache' => $result['from_cache'] ?? false,
                    'force_refresh' => $forceRefresh
                ]);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed to fetch videos", [
                'user_id' => $user->id,
                'error' => $e->getMessage()
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
                Log::info("Comments retrieved successfully", [
                    'user_id' => $user->id,
                    'video_id' => $videoId,
                    'total_comments' => $result['total'],
                    'requests_made' => $result['requests_made'] ?? 0
                ]);
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed to fetch comments", [
                'user_id' => $user->id,
                'video_id' => $videoId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil komentar. Silakan coba lagi.',
                'comments' => '',
                'total' => 0,
            ], 500);
        }
    }

    private function isValidYouTubeVideoId(string $videoId): bool
    {
        return preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId);
    }
}
