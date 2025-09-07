<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PublicVideoController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');

        $query = Analysis::where('type', 'public')
            ->where('user_id', $user->id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', '%' . $search . '%')
                    ->orWhere('video->title', 'like', '%' . $search . '%')
                    ->orWhere('video->channel_title', 'like', '%' . $search . '%');
            });
        }

        $analyses = $query->latest()->paginate($perPage);

        $analyses->appends($request->query());

        return Inertia::render('analyses/public-video', [
            'analyses' => $analyses,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create() {}

    public function store(Request $request) {}

    public function show($id)
    {
        $analysis = Analysis::findOrFail($id);

        if ($analysis->type !== 'public') {
            if ($analysis->type === 'your') {
                return redirect()->route('your-videos.show', $analysis->id);
            }
            abort(404);
        }

        if ($analysis->status !== 'success') {
            return redirect()->back()->with('error', 'Mohon tunggu hingga proses analisis selesai sebelum melihat hasil.');
        }

        $gamblingPath = storage_path('app/public/' . $analysis->gambling_file_path);
        $nonGamblingPath = storage_path('app/public/' . $analysis->nongambling_file_path);
        $keywordPath = storage_path('app/public/' . $analysis->keyword_file_path);

        $gambling = [];
        $gamblingCount = 0;
        $nonGambling = [];
        $nonGamblingCount = 0;
        $keyword = [];
        $keywordCount = 0;

        if (file_exists($gamblingPath) || file_exists($nonGamblingPath) || file_exists($keywordPath)) {
            if (file_exists($gamblingPath)) {
                $gambling = json_decode(file_get_contents($gamblingPath), true);
                $gamblingCount = $gambling['total_comments'] ?? 0;
            }

            if (file_exists($nonGamblingPath)) {
                $nonGambling = json_decode(file_get_contents($nonGamblingPath), true);
                $nonGamblingCount = $nonGambling['total_comments'] ?? 0;
            }

            if (file_exists($keywordPath)) {
                $keyword = json_decode(file_get_contents($keywordPath), true);
                $keywordCount = count($keyword) ?? 0;
            }
        } else {
            Log::warning('Ketiga file tidak ditemukan', [
                'gamblingPath' => $gamblingPath,
                'nonGamblingPath' => $nonGamblingPath,
                'keywordPath' => $keywordPath
            ]);
        }

        return Inertia::render('analyses/detail', [
            'analysis' => $analysis,
            'gambling' => $gambling,
            'gamblingCount' => $gamblingCount,
            'nonGambling' => $nonGambling,
            'nonGamblingCount' => $nonGamblingCount,
            'keyword' => $keyword,
            'keywordCount' => $keywordCount,
        ]);
    }


    public function edit(string $id) {}

    public function update(Request $request, string $id) {}

    public function destroy(string $id) {}
}
