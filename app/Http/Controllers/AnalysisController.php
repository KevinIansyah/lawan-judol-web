<?php

namespace App\Http\Controllers;

use App\Jobs\CommentInferenceJob;
use App\Models\Analysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            Log::error("Failed to store analysis data for user ID: {$user->id}. Error: " . $e->getMessage());

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

    public function destroy(Analysis $analysis) {}
}
