<?php

namespace App\Http\Controllers;

use App\Jobs\CommentInferenceJob;
use App\Models\Analysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AnalysisController extends Controller
{
    public function index() {}

    public function create() {}

    public function store(Request $request)
    {
        $request->validate([
            'data.video.video_id' => 'required|string',
            'data.video.title' => 'required|string',
            'data.video.description' => 'nullable|string',
            'data.video.published_at' => 'required|date',
            'data.video.thumbnail' => 'required|string',
            'data.video.channel_title' => 'required|string',
            'data.video.youtube_url' => 'required|string',
            'data.video.comments_path' => 'required|string',
            'data.video.comments_total' => 'required|integer',
            'data.type' => 'required|in:public,your',
        ]);

        try {
            $user = Auth::user();

            $video = $request->input('data.video');
            $type = $request->input('data.type');

            $analysis = Analysis::create([
                'user_id' => $user->id,
                'video' => $video,
                'status' => 'queue',
                'type' => $type,
                'gambling_file_path' => null,
                'nongambling_file_path' => null,
                'keyword_file_path' => null,
            ]);

            Log::info("Analysis data successfully stored for user ID: {$user->id}");

            CommentInferenceJob::dispatch($analysis)->onQueue('inference');

            Log::info("Analysis data successfully stored in queue for user ID: {$user->id}");

            return response()->json([
                'success' => true,
                'message' => 'Data analisis berhasil disimpan.',
                'data' => $analysis,
            ], 201);
        } catch (\Exception $e) {
            Log::error("Failed to create analysis", [
                'user_id' => $user->id ?? null,
                'video_title' => $request->input('data.video.title') ?? 'Unknown',
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'data' => null,
            ], 500);
        }
    }

    public function show(Analysis $analysis) {}

    public function edit(Analysis $analysis) {}

    public function update(Request $request, Analysis $analysis) {}

    public function destroy(Analysis $analysis)
    {
        $user = Auth::user();

        try {
            if ($analysis->user_id !== $user->id) {
                Log::warning("Unauthorized analysis deletion attempt", [
                    'user_id' => $user->id,
                    'analysis_id' => $analysis->id,
                    'analysis_owner' => $analysis->user_id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki izin untuk menghapus analisis ini.',
                ], 403);
            }

            if (in_array($analysis->status, ['on_process', 'queue'])) {
                Log::info("Analysis deletion blocked - processing status", [
                    'user_id' => $user->id,
                    'analysis_id' => $analysis->id,
                    'status' => $analysis->status
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Analisis sedang diproses dan tidak dapat dihapus.',
                ], 422);
            }

            $filesToDelete = array_filter([
                !empty($analysis->gambling_file_path) ? storage_path('app/public/' . $analysis->gambling_file_path) : null,
                !empty($analysis->nongambling_file_path) ? storage_path('app/public/' . $analysis->nongambling_file_path) : null,
                !empty($analysis->keyword_file_path) ? storage_path('app/public/' . $analysis->keyword_file_path) : null
            ]);

            $filesDeleted = 0;
            $filesFailed = 0;

            DB::transaction(function () use ($analysis, $filesToDelete, &$filesDeleted, &$filesFailed) {
                $analysis->delete();

                foreach ($filesToDelete as $filePath) {
                    if (file_exists($filePath)) {
                        if (unlink($filePath)) {
                            $filesDeleted++;
                        } else {
                            $filesFailed++;
                            Log::warning("Analysis file deletion failed", [
                                'file_path' => $filePath,
                                'analysis_id' => $analysis->id
                            ]);
                        }
                    }
                }
            });

            Log::info("Analysis deletion completed", [
                'user_id' => $user->id,
                'analysis_id' => $analysis->id,
                'files_deleted' => $filesDeleted,
                'files_failed' => $filesFailed
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data analisis berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            Log::error("Analysis deletion failed", [
                'user_id' => $user->id,
                'analysis_id' => $analysis->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus analisis. Silakan coba lagi.',
            ], 500);
        }
    }

    public function retry(Analysis $analysis)
    {
        try {
            $user = Auth::user();

            if ($analysis->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki izin untuk mengulang analisis ini.',
                ], 403);
            }

            if ($analysis->status !== 'failed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya analisis yang gagal yang dapat diulang.',
                ], 422);
            }

            $analysis->update([
                'status' => 'queue',
                'gambling_file_path' => null,
                'nongambling_file_path' => null,
                'keyword_file_path' => null,
                'updated_at' => now(),
            ]);

            CommentInferenceJob::dispatch($analysis)->onQueue('inference');

            Log::info("Analysis retry successfully queued", [
                'user_id' => $user->id,
                'analysis_id' => $analysis->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Analisis berhasil dimasukkan kembali ke dalam antrean.',
                'data' => $analysis->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to retry analysis", [
                'user_id' => $user->id ?? null,
                'analysis_id' => $analysis->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengulang analisis. Silakan coba lagi.',
            ], 500);
        }
    }
}
