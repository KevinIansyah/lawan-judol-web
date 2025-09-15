<?php

namespace App\Http\Controllers;

use App\Models\Analysis;
use App\Models\Dataset;
use App\Models\Keyword;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $datasetCount = Dataset::where('user_id', $user->id)->count();
        $keywordCount = Keyword::where('user_id', $user->id)->count();
        $yourAnalysisCount = Analysis::where('user_id', $user->id)->where('type', 'your')->count();
        $publicAnalysisCount = Analysis::where('user_id', $user->id)->where('type', 'public')->count();

        $generateChartData = function ($type, $days) use ($user) {
            $endDate = Carbon::today();
            $startDate = Carbon::today()->subDays($days - 1);

            $data = Analysis::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
                ->where('user_id', $user->id)
                ->where('type', $type)
                ->whereDate('created_at', '>=', $startDate->toDateString())
                ->whereDate('created_at', '<=', $endDate->toDateString())
                ->groupBy('date')
                ->pluck('count', 'date')
                ->toArray();

            $period = CarbonPeriod::create($startDate, $endDate);

            $result = [];
            foreach ($period as $date) {
                $dateStr = $date->format('Y-m-d');
                $result[$dateStr] = $data[$dateStr] ?? 0;
            }

            return $result;
        };

        return Inertia::render('dashboard', [
            'dashboard' => [
                'dataset_count' => $datasetCount,
                'keyword_count' => $keywordCount,
                'your_analysis_count' => $yourAnalysisCount,
                'public_analysis_count' => $publicAnalysisCount,
                'your_analysis' => [
                    'three_months' => $generateChartData('your', 90),
                    'one_month' => $generateChartData('your', 30),
                    'seven_days' => $generateChartData('your', 7),
                ],
                'public_analysis' => [
                    'three_months' => $generateChartData('public', 90),
                    'one_month' => $generateChartData('public', 30),
                    'seven_days' => $generateChartData('public', 7),
                ],
            ]
        ]);
    }
}
