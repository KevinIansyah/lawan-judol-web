<?php

namespace App\Services\Youtube\Handlers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CacheHandler
{
  public function isVideosCached(User $user): bool
  {
    try {
      $cacheKey = "user_videos_{$user->id}";

      return Cache::has($cacheKey);
    } catch (\Exception $e) {
      Log::error("Failed to check cache", [
        'user_id' => $user->id,
        'error' => $e->getMessage()
      ]);

      return false;
    }
  }
}
