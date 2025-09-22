<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\Keyword;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KeywordController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 100);
        $perPage = in_array($perPage, [100, 150, 200, 250]) ? $perPage : 100;

        $search = $request->get('search');

        $query = Keyword::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('keyword', 'like', '%' . $search . '%');
            });
        }

        $keywords = $query->latest()->paginate($perPage);

        $keywords->appends($request->query());

        return Inertia::render('keyword', [
            'keywords' => $keywords,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'data.keyword' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $text = $request->input('data.keyword');

            $keyword = Keyword::create([
                'user_id' => $user->id,
                'keyword' => $text,
                'label' => 1,
            ]);

            Log::info("Keyword stored successfully", [
                'user_id' => $user->id,
                'keyword' => $keyword,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Data keyword berhasil disimpan.',
                'data' => [
                    'keyword' => $keyword,
                ],
            ], 201);
        } catch (QueryException $e) {
            if ($e->errorInfo[1] === 1062) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kata kunci sudah ada dalam kamus.',
                    'data' => null,
                ], 409);
            }
            throw $e;
        } catch (\Exception $e) {
            Log::error("Failed to store keyword", [
                'user_id' => $user->id,
                'keyword' => $text ?? null,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'data' => null,
            ], 500);
        }
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }

    public function updateJsonFile(Request $request)
    {
        $request->validate([
            'data.keyword.id' => 'required|integer',
            'data.keyword.label' => 'required|integer',
            'data.analysis_id' => 'required|integer',
        ]);

        try {
            $keyword = $request->input('data.keyword');
            $analysisId = $request->input('data.analysis_id');
            $keywordId = $keyword['id'];
            $newLabel = $keyword['label'];

            $analysis = Analysis::find($analysisId);
            if (!$analysis) {
                return response()->json([
                    'success' => false,
                    'message' => 'Analysis tidak ditemukan.',
                    'data' => null,
                ], 404);
            }

            $filePath = storage_path('app/public/' . $analysis->keyword_file_path);
            if (!file_exists($filePath)) {
                Log::warning("JSON file not found", [
                    'file_path' => $filePath,
                    'keyword_id' => $keywordId
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'File JSON tidak ditemukan.',
                    'data' => null,
                ], 404);
            }

            $jsonContent = file_get_contents($filePath);
            $data = json_decode($jsonContent, true);

            if (!$data || !is_array($data)) {
                Log::warning("Invalid JSON structure", [
                    'file_path' => $filePath,
                    'keyword_id' => $keywordId
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Struktur JSON tidak valid.',
                    'data' => null,
                ], 400);
            }

            $updated = false;
            foreach ($data as &$item) {
                if ((isset($item['id']) && $item['id'] == $keywordId) ||
                    (isset($item['keyword']) && $item['keyword'] === $keywordId)
                ) {

                    $oldLabel = $item['label'] ?? null;
                    $item['label'] = $newLabel;
                    $updated = true;

                    Log::info("Keyword label updated", [
                        'keyword_id' => $keywordId,
                        'old_label' => $oldLabel,
                        'new_label' => $newLabel
                    ]);

                    break;
                }
            }

            if ($updated) {
                $result = file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                if ($result === false) {
                    Log::error("Failed to write updated JSON", [
                        'file_path' => $filePath,
                        'keyword_id' => $keywordId
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal menyimpan perubahan ke file.',
                        'data' => null,
                    ], 500);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Label keyword berhasil diperbarui.',
                    'data' => [
                        'keyword_id' => $keywordId,
                        'new_label' => $newLabel
                    ],
                ], 200);
            } else {
                Log::warning("Keyword not found in JSON file", [
                    'file_path' => $filePath,
                    'keyword_id' => $keywordId
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Keyword tidak ditemukan dalam file.',
                    'data' => null,
                ], 404);
            }
        } catch (\Exception $e) {
            Log::error("Error updating JSON file", [
                'keyword_id' => $keywordId ?? 'unknown',
                'analysis_id' => $analysisId ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui file.',
                'data' => null,
            ], 500);
        }
    }
}
