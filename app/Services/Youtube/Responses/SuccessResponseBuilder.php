<?php

namespace App\Services\YouTube\Responses;

use App\Services\YouTube\Formatters\YoutubeFormatter;

class SuccessResponseBuilder
{
  public static function buildVideoSuccess(array $video): array
  {
    return [
      'success' => true,
      'message' => 'Data video berhasil diambil.',
      'video' => $video,
      'total' => 1,
    ];
  }

  public static function buildUserVideosSuccess(array $allVideos, int $videoCount, array $channel, int $requestCount): array
  {
    return [
      'success' => true,
      'message' => 'Data video berhasil diambil',
      'videos' => $allVideos,
      'total' => $videoCount,
      'channel_info' => YoutubeFormatter::formatChannelDetails($channel),
      'cached_at' => now()->toISOString(),
      'requests_made' => $requestCount,
      'from_cache' => false
    ];
  }

  public static function buildCommentsSuccess(string $filename, int $commentCount, int $requestCount): array
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
