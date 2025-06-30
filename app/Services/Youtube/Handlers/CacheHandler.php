<?php

namespace App\Services\YouTube\Handlers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CacheHandler
{
  /**
   * Menghapus cache video milik pengguna.
   */
  public function clearUserVideosCache(User $user): bool
  {
    try {
      $cacheKey = "user_videos_{$user->id}";
      $wasDeleted = Cache::forget($cacheKey);

      Log::info("Percobaan hapus cache untuk user: {$user->id}, sukses: " . ($wasDeleted ? 'true' : 'false'));

      return $wasDeleted;
    } catch (\Exception $e) {
      Log::error("Gagal menghapus cache untuk user {$user->id}: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Mengecek apakah video pengguna ada di cache dan masih valid.
   */
  public function isVideosCached(User $user): bool
  {
    try {
      $cacheKey = "user_videos_{$user->id}";
      return Cache::has($cacheKey);
    } catch (\Exception $e) {
      Log::error("Gagal mengecek cache untuk user {$user->id}: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Mengambil informasi waktu kedaluwarsa cache video pengguna.
   */
  public function getCacheExpiry(User $user): ?array
  {
    try {
      $cacheKey = "user_videos_{$user->id}";

      if (!Cache::has($cacheKey)) {
        return null;
      }

      $cachedData = Cache::get($cacheKey);

      if (!isset($cachedData['cached_at'])) {
        return null;
      }

      $cachedAt = Carbon::parse($cachedData['cached_at']);
      $expiresAt = $cachedAt->addHours(self::CACHE_HOURS);
      $hoursRemaining = $expiresAt->diffInHours(now(), false);

      return [
        'cached_at' => $cachedAt->toISOString(),
        'expires_at' => $expiresAt->toISOString(),
        'hours_remaining' => $hoursRemaining,
        'is_expired' => $hoursRemaining <= 0
      ];
    } catch (\Exception $e) {
      Log::error("Gagal mengambil informasi kedaluwarsa cache untuk user {$user->id}: " . $e->getMessage());
      return null;
    }
  }

  /**
   * Mengecek apakah cache sudah kedaluwarsa (digunakan untuk debugging).
   */
  public function isCacheExpired(User $user): bool
  {
    try {
      $cacheInfo = $this->getCacheExpiry($user);

      if (!$cacheInfo) {
        return true;
      }

      return $cacheInfo['is_expired'];
    } catch (\Exception $e) {
      Log::error("Gagal mengecek kedaluwarsa cache untuk user {$user->id}: " . $e->getMessage());
      return true;
    }
  }

  /**
   * Mengambil statistik cache untuk keperluan monitoring.
   */
  public function getCacheStats(): array
  {
    try {
      // Implementasi sederhana - bisa dikembangkan tergantung kemampuan sistem cache
      return [
        'cache_driver' => config('cache.default'),
        'cache_hours' => config('youtube.cache.hours'),
        'max_requests' => config('youtube.api.max_requests'),
        'request_delay_ms' => config('youtube.api.request_delay_microseconds') / 1000,
      ];
    } catch (\Exception $e) {
      Log::error("Gagal mengambil statistik cache: " . $e->getMessage());
      return [];
    }
  }
}
