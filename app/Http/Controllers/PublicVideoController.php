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

        return Inertia::render('analyses/public-video', [
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

        if ($analysis->status !== 'success') {
            return redirect()->back()->with('error', 'Mohon tunggu hingga proses analisis selesai sebelum melihat hasil.');
        }

        $gamblingPath = storage_path('app/public/' . $analysis->gambling_file_path);
        $nonGamblingPath = storage_path('app/public/' . $analysis->nongambling_file_path);

        $gambling = [];
        $gamblingCount = 0;
        $nonGambling = [];
        $nonGamblingCount = 0;

        if (file_exists($gamblingPath) || file_exists($nonGamblingPath)) {
            if (file_exists($gamblingPath)) {
                $gambling = json_decode(file_get_contents($gamblingPath), true);
                $gamblingCount = $gambling['total_comments'] ?? 0;
            }

            if (file_exists($nonGamblingPath)) {
                $nonGambling = json_decode(file_get_contents($nonGamblingPath), true);
                $nonGamblingCount = $nonGambling['total_comments'] ?? 0;
            }
        } else {
            Log::warning('Kedua file tidak ditemukan', [
                'gamblingPath' => $gamblingPath,
                'nonGamblingPath' => $nonGamblingPath
            ]);
        }

        return Inertia::render('analyses/detail', [
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
