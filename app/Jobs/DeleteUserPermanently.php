<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DeleteUserPermanently implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $user = User::with('analyses')->find($this->userId);

        if (!$user) {
            Log::warning("User deletion failed - user not found", ['user_id' => $this->userId]);
            return;
        }

        if (!$user->delete_account) {
            Log::info("User deletion cancelled - delete flag disabled", ['user_id' => $this->userId]);
            return;
        }

        if ($user->scheduled_deletion_at && $user->scheduled_deletion_at > now()) {
            Log::info("User deletion postponed - schedule not reached", [
                'user_id' => $this->userId,
                'scheduled_at' => $user->scheduled_deletion_at->toDateTimeString()
            ]);
            return;
        }

        try {
            $summary = DB::transaction(function () use ($user) {
                $analysisSummary = $this->deleteUserAnalyses($user);

                $user->forceDelete();

                return $analysisSummary;
            });

            Log::info("User deletion completed successfully", [
                'user_id' => $this->userId,
                'analyses_deleted' => $summary['analyses_count'],
                'files_deleted' => $summary['files_deleted'],
                'files_failed' => $summary['files_failed']
            ]);
        } catch (\Exception $e) {
            Log::error("User deletion failed", [
                'user_id' => $this->userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Delete user analyses and their associated files
     */
    private function deleteUserAnalyses(User $user): array
    {
        $analyses = $user->analyses;
        $totalFilesDeleted = 0;
        $totalFilesFailed = 0;

        foreach ($analyses as $analysis) {
            $filesToDelete = array_filter([
                !empty($analysis->gambling_file_path) ? storage_path('app/public/' . $analysis->gambling_file_path) : null,
                !empty($analysis->nongambling_file_path) ? storage_path('app/public/' . $analysis->nongambling_file_path) : null,
                !empty($analysis->keyword_file_path) ? storage_path('app/public/' . $analysis->keyword_file_path) : null
            ]);

            $deletedCount = 0;
            $failedCount = 0;

            foreach ($filesToDelete as $filePath) {
                if (file_exists($filePath)) {
                    if (unlink($filePath)) {
                        $deletedCount++;
                    } else {
                        $failedCount++;
                        Log::warning("File deletion failed", [
                            'file_path' => $filePath,
                            'analysis_id' => $analysis->id,
                            'user_id' => $user->id
                        ]);
                    }
                }
            }

            $totalFilesDeleted += $deletedCount;
            $totalFilesFailed += $failedCount;

            $analysis->delete();
        }

        return [
            'analyses_count' => $analyses->count(),
            'files_deleted' => $totalFilesDeleted,
            'files_failed' => $totalFilesFailed
        ];
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("User deletion job failed", [
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
        ]);
    }
}
