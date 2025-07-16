<?php

namespace App\Http\Controllers;

use App\Jobs\CommentInferenceJob;
use App\Models\Analysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AnalysisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'data.mergedData.video_id' => 'required|string',
            'data.mergedData.title' => 'required|string',
            'data.mergedData.description' => 'nullable|string',
            'data.mergedData.published_at' => 'required|date',
            'data.mergedData.thumbnail' => 'required|string',
            'data.mergedData.channel_title' => 'required|string',
            'data.mergedData.youtube_url' => 'required|string',
            'data.mergedData.comments_path' => 'required|string',
            'data.mergedData.comments_total' => 'required|integer',
            'data.type' => 'required|in:public,your',
        ]);

        try {
            $user = Auth::user();

            $mergedData = $request->input('data.mergedData');
            $type = $request->input('data.type');

            $analysis = Analysis::create([
                'user_id' => $user->id,
                'video' => $mergedData,
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
                'message' => 'Data analysis berhasil disimpan.',
                'analysis' => $analysis,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to store analysis data for user ID: {$user->id}. Error: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'analysis' => null,
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Analysis $analysis)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Analysis $analysis)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Analysis $analysis)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Analysis $analysis)
    {
        //
    }
}
