<?php

namespace App\Services\YouTube\Responses;

class ErrorResponseBuilder
{
  /**
   * Menghasilkan response error untuk 1 video.
   */
  public static function videoErrorResponse(string $message): array
  {
    return [
      'success' => false,
      'message' => $message,
      'video' => null,
      'total' => 0,
    ];
  }

  /**
   * Menghasilkan response error untuk daftar video milik user.
   */
  public static function userVideosErrorResponse(string $message): array
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

  /**
   * Menghasilkan response error untuk daftar komentar.
   */
  public static function commentsErrorResponse(string $message): array
  {
    return [
      'success' => false,
      'message' => $message,
      'comments' => '',
      'total' => 0,
    ];
  }
}
