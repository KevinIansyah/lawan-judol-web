<?php

namespace App\Services\YouTube\Responses;

class ErrorResponseBuilder
{
  public static function buildVideoError(string $message): array
  {
    return [
      'success' => false,
      'message' => $message,
      'video' => null,
      'total' => 0,
    ];
  }

  public static function buildUserVideosError(string $message): array
  {
    return [
      'success' => false,
      'message' => $message,
      'videos' => [],
      'total' => 0,
      'channel_info' => null,
      'from_cache' => false,
    ];
  }

  public static function buildCommentsError(string $message): array
  {
    return [
      'success' => false,
      'message' => $message,
      'comments' => '',
      'total' => 0,
    ];
  }
}
