<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\Dataset;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DatasetController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $query = Dataset::with(['user:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('comment->text', 'like', '%' . $search . '%')
                    ->orWhere('true_label', $search);
            });
        }

        $datasets = $query->latest()->paginate($perPage);

        $datasets->appends($request->query());

        return Inertia::render('dataset', [
            'datasets' => $datasets,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

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

            Log::info("Dataset comment stored successfully", [
                'user_id' => $user->id,
                'comment_id' => $comment['comment_id'],
                'true_label' => $trueLabel,
                'analysis_id' => $analysisId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data komentar berhasil disimpan.',
                'data' => [
                    'dataset' => $dataset,
                    'updated_comment' => $comment,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error("Failed to store dataset comment", [
                'user_id' => $user->id,
                'comment_id' => $comment['comment_id'] ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
                'data' => null,
            ], 500);
        }
    }

    public function show(Dataset $dataset) {}

    public function edit(Dataset $dataset) {}

    public function update(Request $request, Dataset $dataset) {}

    public function destroy(Dataset $dataset) {}

    public function download(Request $request)
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


        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $label = $request->input('label');

        try {
            if (empty($startDate) && empty($endDate) && empty($label)) {
                return response()->json([
                    'success'  => true,
                    'message'  => 'Minimal salah satu filter (label, tanggal awal, atau tanggal akhir) harus diisi.',
                    'comments' => '',
                    'total'    => 0,
                ], 422);
            }

            if ($startDate && $endDate && Carbon::parse($endDate)->lessThanOrEqualTo(Carbon::parse($startDate))) {
                return response()->json([
                    'success'  => true,
                    'message'  => 'Tanggal akhir harus setelah tanggal awal.',
                    'comments' => '',
                    'total'    => 0,
                ], 422);
            }

            $query = Dataset::query();

            if ($label) {
                $query->where('true_label', $label);
            }

            if ($startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            }

            if ($endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            }

            $datasets = $query->get();

            $timestamp = now()->format('Ymd_His');
            $filename = "datasets/{$timestamp}.json";

            $comments = $datasets->pluck('comment')->map(function ($c) {
                return $c;
            })->toArray();

            Storage::disk('public')->put($filename,   json_encode($comments, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $downloadUrl = Storage::url($filename);

            Log::info("Dataset download generated", [
                'user_id' => $user->id,
                'filters'        => [
                    'label'      => $label,
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                ],
                'total_comments' => $datasets->count(),
                'file_path'      => $filename,
            ]);

            return response()->json([
                'success'  => true,
                'message'  => 'Data dataset berhasil diambil.',
                'datasets' => '',
                'total'    => $datasets->count(),
                'link'     => url($downloadUrl),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to generate dataset download", [
                'user_id' => $user->id,
                'filters' => [
                    'label'      => $label,
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                ],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil komentar. Silakan coba lagi.',
                'datasets' => '',
                'total' => 0,
            ], 500);
        }
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
