<?php

namespace App\Services\YouTube\Responses;

class ErrorResponseBuilder
{
  public static function buildVideoError(string $message, bool $quotaExceeded = false): array
  {
    $response = [
      'success' => false,
      'message' => $message,
      'video' => null,
      'total' => 0,
    ];

    if ($quotaExceeded) {
      $response['quota_exceeded'] = true;
    }

    return $response;
  }

  public static function buildUserVideosError(string $message, bool $quotaExceeded = false): array
  {
    $response = [
      'success' => false,
      'message' => $message,
      'videos' => [],
      'total' => 0,
      'channel_info' => null,
      'from_cache' => false,
    ];

    if ($quotaExceeded) {
      $response['quota_exceeded'] = true;
    }

    return $response;
  }

  public static function buildCommentsError(string $message, bool $quotaExceeded = false): array
  {
    $response = [
      'success' => false,
      'message' => $message,
      'comments' => '',
      'total' => 0,
    ];

    if ($quotaExceeded) {
      $response['quota_exceeded'] = true;
    }

    return $response;
  }

  public static function buildModerationCommentError(string $message, string $commentId, bool $quotaExceeded = false): array
  {
    $response = [
      'success' => false,
      'message' => $message,
      'comment_id' => $commentId,
    ];

    if ($quotaExceeded) {
      $response['quota_exceeded'] = true;
    }

    return $response;
  }
}
