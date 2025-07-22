<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\Dataset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DatasetController extends Controller
{
    public function index() {}

    public function create() {}

    public function store(Request $request)
    {
        $request->validate([
            'data.comment.comment_id' => 'required|string',
            'data.comment.label' => 'required|integer',
            'data.comment.source' => 'required|string',
            'data.comment.status' => 'required|string|in:draft,reject,heldForReview,dataset',
            'data.comment.text' => 'required|string',
            'data.comment.timestamp' => 'required|date',
            'data.comment.user_metadata.profile_url' => 'required|url',
            'data.comment.user_metadata.user_id' => 'required|string',
            'data.comment.user_metadata.username' => 'required|string',
            'data.true_label' => 'required|in:judol,non_judol',
            'data.analysis_id' => 'required|integer',
        ]);

        try {
            $user = Auth::user();
            $comment = $request->input('data.comment');
            $trueLabel = $request->input('data.true_label');
            $analysisId = $request->input('data.analysis_id');

            $existingDataset = Dataset::where('comment->comment_id', $comment['comment_id'])
                ->where('user_id', $user->id)
                ->first();

            if ($existingDataset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Komentar sudah ada dalam dataset.',
                    'data' => null,
                ], 409);
            }

            $analysis = Analysis::find($analysisId);
            if (!$analysis) {
                return response()->json([
                    'success' => false,
                    'message' => 'Analysis tidak ditemukan.',
                    'data' => null,
                ], 404);
            }

            if ($trueLabel === 'judol') {
                $comment['label'] = 0;
                $filePath = storage_path('app/public/' . $analysis->nongambling_file_path);
            } else {
                $comment['label'] = 1;
                $filePath = storage_path('app/public/' . $analysis->gambling_file_path);
            }

            $comment['status'] = 'dataset';

            $this->updateJsonFileStatus($filePath, $comment['comment_id'], 'dataset');

            $dataset = Dataset::create([
                'user_id' => $user->id,
                'comment' => $comment,
                'true_label' => $trueLabel,
            ]);

            Log::info("Comment data successfully stored for user ID: {$user->id}, Comment ID: {$comment['comment_id']}");

            return response()->json([
                'success' => true,
                'message' => 'Data komentar berhasil disimpan.',
                'data' => [
                    'dataset' => $dataset,
                    'updated_comment' => $comment,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error("Failed to store comment data for user ID: {$user->id}. Error: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'data' => null,
            ], 500);
        }
    }

    public function show(Dataset $dataset) {}

    public function edit(Dataset $dataset) {}

    public function update(Request $request, Dataset $dataset) {}

    public function destroy(Dataset $dataset) {}

    private function updateJsonFileStatus($filePath, $commentId, $newStatus)
    {
        try {
            // Check if file exists
            if (!file_exists($filePath)) {
                Log::warning("JSON file not found: {$filePath}");
                return false;
            }

            // Read and decode JSON file
            $jsonContent = file_get_contents($filePath);
            $data = json_decode($jsonContent, true);

            if (!$data || !isset($data['chunks'])) {
                Log::warning("Invalid JSON structure in file: {$filePath}");
                return false;
            }

            // Find and update the comment
            $updated = false;
            foreach ($data['chunks'] as &$chunk) {
                if (isset($chunk['comments'])) {
                    foreach ($chunk['comments'] as &$comment) {
                        if ($comment['comment_id'] === $commentId) {
                            $comment['status'] = $newStatus;
                            $updated = true;
                            break 2; // Break out of both loops
                        }
                    }
                }
            }

            if ($updated) {
                // Write updated data back to file
                $result = file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                if ($result === false) {
                    Log::error("Failed to write updated JSON to file: {$filePath}");
                    return false;
                }

                Log::info("Successfully updated comment status in JSON file: {$filePath}, Comment ID: {$commentId}");
                return true;
            } else {
                Log::warning("Comment not found in JSON file: {$filePath}, Comment ID: {$commentId}");
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Error updating JSON file: {$filePath}. Error: " . $e->getMessage());
            return false;
        }
    }
}
