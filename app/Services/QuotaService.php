<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserQuota;
use App\Models\QuotaUsage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuotaService
{
    public function canAnalyzeVideo(User $user): array
    {
        $quota = $this->getUserQuota($user);
        $usage = $this->getTodayUsage($user);

        $remaining = $quota->daily_video_analysis_limit - $usage->videos_analyzed_count;

        if ($remaining <= 0) {
            return [
                'allowed' => false,
                'message' => "Kuota analisis video harian Anda telah habis ({$quota->daily_video_analysis_limit} video/hari). Silakan coba lagi besok.",
                'limit' => $quota->daily_video_analysis_limit,
                'used' => $usage->videos_analyzed_count,
                'remaining' => 0
            ];
        }

        return [
            'allowed' => true,
            'message' => 'Kuota tersedia',
            'limit' => $quota->daily_video_analysis_limit,
            'used' => $usage->videos_analyzed_count,
            'remaining' => $remaining
        ];
    }

    public function canModerateComment(User $user): array
    {
        $quota = $this->getUserQuota($user);
        $usage = $this->getTodayUsage($user);

        $remaining = $quota->daily_comment_moderation_limit - $usage->comments_moderated_count;

        if ($remaining <= 0) {
            return [
                'allowed' => false,
                'message' => "Kuota moderasi komentar harian Anda telah habis ({$quota->daily_comment_moderation_limit} komentar/hari). Silakan coba lagi besok.",
                'limit' => $quota->daily_comment_moderation_limit,
                'used' => $usage->comments_moderated_count,
                'remaining' => 0
            ];
        }

        return [
            'allowed' => true,
            'message' => 'Kuota tersedia',
            'limit' => $quota->daily_comment_moderation_limit,
            'used' => $usage->comments_moderated_count,
            'remaining' => $remaining
        ];
    }

    public function consumeVideoAnalysis(User $user, int $count = 1): bool
    {
        try {
            DB::beginTransaction();

            $usage = $this->getTodayUsage($user);
            $usage->videos_analyzed_count += $count;
            $usage->save();

            DB::commit();

            Log::info("Video analysis quota consumed", ['user_id' => $user->id, 'count' => $count, 'total_used' => $usage->videos_analyzed_count]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Failed to consume video analysis quota", ['user_id' => $user->id, 'count' => $count, 'error' => $e->getMessage()]);

            return false;
        }
    }

    public function consumeCommentModeration(User $user, int $count = 1): bool
    {
        try {
            DB::beginTransaction();

            $usage = $this->getTodayUsage($user);
            $usage->comments_moderated_count += $count;
            $usage->save();

            DB::commit();

            Log::info("Comment moderation quota consumed", ['user_id' => $user->id, 'count' => $count, 'total_used' => $usage->comments_moderated_count]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Failed to consume comment moderation quota", ['user_id' => $user->id, 'count' => $count, 'error' => $e->getMessage()]);

            return false;
        }
    }

    public function getUserQuota(User $user): UserQuota
    {
        return UserQuota::firstOrCreate(
            ['user_id' => $user->id],
            [
                'daily_video_analysis_limit' => 5,
                'daily_comment_moderation_limit' => 40,
            ]
        );
    }

    public function trackYoutubeQuota(User $user, int $units): bool
    {
        try {
            DB::beginTransaction();

            $usage = $this->getTodayUsage($user);
            $usage->youtube_quota_used += $units;
            $usage->save();

            DB::commit();

            Log::info("YouTube quota tracked", ['user_id' => $user->id,'units' => $units,'total_used' => $usage->youtube_quota_used]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Failed to track YouTube quota", ['user_id' => $user->id,'units' => $units,'error' => $e->getMessage()]);

            return false;
        }
    }

    public function getTodayUsage(User $user): QuotaUsage
    {
        return QuotaUsage::firstOrCreate(
            [
                'user_id' => $user->id,
                'date' => Carbon::today()
            ],
            [
                'videos_analyzed_count' => 0,
                'comments_moderated_count' => 0,
                'youtube_quota_used' => 0,
            ]
        );
    }

    public function updateUserLimit(User $user, ?int $videoLimit = null, ?int $commentLimit = null): bool
    {
        try {
            $quota = $this->getUserQuota($user);

            if ($videoLimit !== null) {
                $quota->daily_video_analysis_limit = $videoLimit;
            }

            if ($commentLimit !== null) {
                $quota->daily_comment_moderation_limit = $commentLimit;
            }

            $quota->save();

            Log::info("User quota limits updated", ['user_id' => $user->id, 'video_limit' => $quota->daily_video_analysis_limit, 'comment_limit' => $quota->daily_comment_moderation_limit]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to update user quota limits", ['user_id' => $user->id, 'error' => $e->getMessage()]);

            return false;
        }
    }

    public function getQuotaInfo(User $user): array
    {
        $quota = $this->getUserQuota($user);
        $usage = $this->getTodayUsage($user);

        return [
            'video_analysis' => [
                'limit' => $quota->daily_video_analysis_limit,
                'used' => $usage->videos_analyzed_count,
                'remaining' => max(0, $quota->daily_video_analysis_limit - $usage->videos_analyzed_count)
            ],
            'comment_moderation' => [
                'limit' => $quota->daily_comment_moderation_limit,
                'used' => $usage->comments_moderated_count,
                'remaining' => max(0, $quota->daily_comment_moderation_limit - $usage->comments_moderated_count)
            ],
            'youtube_api' => [
                'used' => $usage->youtube_quota_used,
            ],
            'date' => Carbon::today()->toDateString(),
            'resets_at' => Carbon::tomorrow()->startOfDay()->toIso8601String()
        ];
    }

    public function resetTodayUsage(User $user): bool
    {
        try {
            QuotaUsage::where('user_id', $user->id)
                ->where('date', Carbon::today())
                ->delete();

            Log::info("Today's quota usage reset", ['user_id' => $user->id]);

            return true;
        } catch (\Exception $e) {
            Log::error("Failed to reset today's quota usage", ['user_id' => $user->id, 'error' => $e->getMessage()]);

            return false;
        }
    }

    public function cleanupOldUsage(int $daysToKeep = 30): int
    {
        $cutoffDate = Carbon::today()->subDays($daysToKeep);

        $deleted = QuotaUsage::where('date', '<', $cutoffDate)->delete();

        Log::info("Old quota usage data cleaned up", ['days_kept' => $daysToKeep, 'records_deleted' => $deleted]);

        return $deleted;
    }
}
