<?php

namespace App\Services\YouTube\Responses;

use App\Services\YouTube\Formatters\YoutubeFormatter;

class SuccessResponseBuilder
{
  protected $youtubeFormatter;

  public function __construct(
    YoutubeFormatter $youtubeFormatter,
  ) {
    $this->youtubeFormatter = $youtubeFormatter;
  }

  /**
   * Menghasilkan response success untuk 1 video.
   */
  public static function videoSuccessResponse(array $video): array
  {
    return [
      'success' => true,
      'message' => 'Data video berhasil diambil.',
      'video' => $video,
      'total' => 1,
    ];
  }

  /**
   * Menghasilkan response success untuk daftar video milik user.
   */
  public function userVideosSuccessResponse(array $allVideos, int $videoCount, array $channel, int $requestCount): array
  {
    return [
      'success' => true,
      'message' => 'Data video berhasil diambil',
      'videos' => $allVideos,
      'total' => $videoCount,
      'channel_info' => $this->youtubeFormatter->channelDetails($channel),
      'cached_at' => now()->toISOString(),
      'requests_made' => $requestCount,
      'from_cache' => false
    ];
  }

  /**
   * Menghasilkan response success untuk daftar komentar.
   */
  public static function commentsSuccessResponse(string $filename, int $commentCount, int $requestCount): array
  {
    return [
      'success' => true,
      'message' => 'Data komentar berhasil diambil',
      'comments' => $filename,
      'total' => $commentCount,
      'requests_made' => $requestCount,
    ];
  }
}
