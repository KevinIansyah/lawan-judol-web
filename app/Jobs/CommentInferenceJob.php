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
use Illuminate\Support\Facades\Storage;

class CommentInferenceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Analysis $analysis) {}

    public function handle()
    {
        try {
            $this->analysis->status = 'on_process';
            $this->analysis->save();
            Log::info("Job started for analysis id {$this->analysis->id}");

            $url = rtrim(config('model.model_api.url'), '/');

            $filePath = storage_path('app/public/' . $this->analysis->video['comments_path']);

            if (!file_exists($filePath)) {
                throw new \Exception("Comment file not found: $filePath");
            }

            Log::info("Sending file to model API...");
            $response = Http::timeout(300)
                ->attach('file', file_get_contents($filePath), 'comments.json')
                ->post("$url/predict-file");

            Log::info("Received response from model API", ['status' => $response->status()]);

            if (!$response->successful()) {
                throw new \Exception("Inference failed. Response: " . $response->body());
            }

            $result = $response->json();
            Log::info("Received prediction result", $result);

            $judolPath = "comments/judol/judol_{$this->analysis->id}.json";
            $nonJudolPath = "comments/nonjudol/nonjudol_{$this->analysis->id}.json";

            $judolDir = storage_path('app/public/comments/judol');
            $nonJudolDir = storage_path('app/public/comments/nonjudol');

            @mkdir($judolDir, 0755, true);
            @mkdir($nonJudolDir, 0755, true);

            $start = now();

            Log::info("Downloading judol file to: " . storage_path("app/public/" . $judolPath));
            Http::timeout(300)
                ->sink(storage_path("app/public/" . $judolPath))
                ->get($url . '/download/' . $result['judol_result']);

            Http::timeout(300)
                ->sink(storage_path("app/public/" . $nonJudolPath))
                ->get($url . '/download/' . $result['non_judol_result']);

            Log::info("Judol file download completed in " . now()->diffInSeconds($start) . " seconds");

            $this->analysis->gambling_file_path = $judolPath;
            $this->analysis->nongambling_file_path = $nonJudolPath;
            $this->analysis->status = 'success';
            $this->sendNotification('success');

            Log::info("Inference completed for analysis id {$this->analysis->id}");
        } catch (\Throwable $e) {
            $this->analysis->status = 'failed';
            $this->analysis->save();
            $this->sendNotification('failed');

            Log::error("Inference job error for analysis id {$this->analysis->id}: {$e->getMessage()}");
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
