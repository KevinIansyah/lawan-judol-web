<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PublicVideoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [10, 20, 30, 40, 50]) ? $perPage : 10;

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

        return Inertia::render('analysis/public-video', [
            'analyses' => $analyses,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $analysis = Analysis::findOrFail($id);

        $commentsPath = storage_path('app/public/' . $analysis->video['comments_path']);

        $gambling = [];
        $gamblingCount = 10;
        $nonGambling = [];
        $nonGamblingCount = 20;

        if (file_exists($commentsPath)) {
            $allComments = json_decode(file_get_contents($commentsPath), true);
            $nonGambling = $allComments;

            // foreach ($allComments as $comment) {
            //     if ($comment['label'] === 1) {
            //         $gamblingComments[] = $comment;
            //     } else {
            //         $nonGamblingComments[] = $comment;
            //     }
            // }
        } else {
            Log::warning('File komentar tidak ditemukan', ['path' => $commentsPath]);
        }

        return Inertia::render('analysis/detail', [
            'analysis' => $analysis,
            'gambling' => $gambling,
            'gamblingCount' => $gamblingCount,
            'nonGambling' => $nonGambling,
            'nonGamblingCount' => $nonGamblingCount,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
