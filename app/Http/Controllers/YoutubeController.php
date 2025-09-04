<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Services\YouTube\Handlers\CacheHandler;
use App\Services\Youtube\YoutubeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class YoutubeController extends Controller
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

    public function postModerationComment(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung. Silakan login ulang.',
                'comment_id' => '',
            ], 401);
        }

        $commentId = $request->input('data.comment_id');
        $moderationStatus = $request->input('data.moderation_status');
        $banAuthor = $request->boolean('data.ban_author', false);
        $analysisId = $request->input('data.analysis_id');

        $analysis = Analysis::find($analysisId);
        if (!$analysis) {
            return response()->json([
                'success' => false,
                'message' => 'Analysis tidak ditemukan.',
                'comment_id' => '',
            ], 404);
        }
        $filePath = storage_path('app/public/' . $analysis->gambling_file_path);

        try {
            $result = $this->youtubeService->postModerationCommentById(
                $user,
                $commentId,
                $moderationStatus,
                $banAuthor,
            );

            if ($result['success']) {
                Log::info("Moderation comment action successful", [
                    'user_id' => $user->id,
                    'comment_id' => $commentId,
                    'moderation_status' => $moderationStatus,
                ]);
            }

            $this->updateJsonFileStatus($filePath, $commentId, $moderationStatus);

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Failed to moderate comment", [
                'user_id' => $user->id,
                'comment_id' => $commentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses moderasi komentar. Silakan coba lagi.',
                'comment_id' => $commentId,
            ], 500);
        }
    }

    private function isValidYouTubeVideoId(string $videoId): bool
    {
        return preg_match('/^[a-zA-Z0-9_-]{11}$/', $videoId);
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
