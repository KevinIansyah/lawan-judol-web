<?php

namespace App\Jobs;

use App\Models\Analysis;
use App\Notifications\AnalysisNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CommentInferenceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Analysis $analysis) {}

    public function handle()
    {
        $startTime = now();

        try {
            $this->analysis->status = 'on_process';
            $this->analysis->save();

            Log::info("Comment inference started", [
                'analysis_id' => $this->analysis->id
            ]);

            $url = rtrim(config('model.model_api.url'), '/');
            $filePath = storage_path('app/public/' . $this->analysis->video['comments_path']);

            if (!file_exists($filePath)) {
                throw new \Exception("Comment file not found: $filePath");
            }

            $response = Http::timeout(600)
                ->attach('file', file_get_contents($filePath), 'comments.json')
                ->post("$url/predict-file");

            if (!$response->successful()) {
                throw new \Exception("Inference failed. Status: " . $response->status());
            }

            $result = $response->json();

            $judolPath = "comments/judol/judol_{$this->analysis->id}.json";
            $nonJudolPath = "comments/nonjudol/nonjudol_{$this->analysis->id}.json";
            $keywordPath = "comments/keyword/keyword_{$this->analysis->id}.json";

            $judolDir = storage_path('app/public/comments/judol');
            $nonJudolDir = storage_path('app/public/comments/nonjudol');
            $keywordDir = storage_path('app/public/comments/keyword');

            @mkdir($judolDir, 0755, true);
            @mkdir($nonJudolDir, 0755, true);
            @mkdir($keywordDir, 0755, true);

            Http::timeout(600)
                ->sink(storage_path("app/public/" . $judolPath))
                ->get($url . '/download/' . $result['judol_result']);

            Http::timeout(600)
                ->sink(storage_path("app/public/" . $nonJudolPath))
                ->get($url . '/download/' . $result['non_judol_result']);

            Http::timeout(600)
                ->sink(storage_path("app/public/" . $keywordPath))
                ->get($url . '/download/' . $result['keyword_result']);

            $this->analysis->gambling_file_path = $judolPath;
            $this->analysis->nongambling_file_path = $nonJudolPath;
            $this->analysis->keyword_file_path = $keywordPath;
            $this->analysis->status = 'success';
            $this->sendNotification('success');

            Log::info("Comment inference completed", [
                'analysis_id' => $this->analysis->id,
                'duration_seconds' => now()->diffInSeconds($startTime)
            ]);
        } catch (\Throwable $e) {
            $this->analysis->status = 'failed';
            $this->analysis->save();
            $this->sendNotification('failed');

            Log::error("Comment inference failed", [
                'analysis_id' => $this->analysis->id,
                'error' => $e->getMessage(),
                'duration_seconds' => now()->diffInSeconds($startTime)
            ]);
        }

        $this->analysis->save();
    }

    private function sendNotification(string $status)
    {
        $user = $this->analysis->user;
        $url = null;
        $analysis = $this->analysis;
        $videoTitle = $analysis->video['title'] ?? 'Video Anda';

        if ($status === 'success') {
            $url = $analysis->type === 'public'
                ? url('/analysis/public-video/' . $analysis->id)
                : url('/analysis/your-video/' . $analysis->id);

            $title = 'Analisis Selesai';
            $message = "Proses analisis video berjudul '{$videoTitle}' telah berhasil diselesaikan.";
        } elseif ($status === 'failed') {
            $title = 'Analisis Gagal';
            $message = "Proses analisis video berjudul '{$videoTitle}' gagal diproses. Silakan coba lagi.";
        } else {
            $title = 'Status Analisis';
            $message = "Proses analisis video berjudul '{$videoTitle}' sedang diproses.";
        }

        $data = [
            'title'   => $title,
            'message' => $message,
            'url'     => $url,
            'status'  => $status,
        ];

        $user->notify(new AnalysisNotification($data));
    }
}
