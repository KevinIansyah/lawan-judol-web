<?php

namespace App\Services\YouTube\Helpers;

use Illuminate\Http\Client\Response;

class YouTubeErrorHelper
{
  public static function checkQuotaError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    if ($reason === 'quotaExceeded') {
      return [
        'reason' => true,
        'message' => 'Kuota YouTube API telah habis. Silakan coba lagi besok.'
      ];
    }

    return [
      'reason' => false,
      'message' => 'Terjadi kesalahan tidak terduga saat memeriksa kuota API.'
    ];
  }

  public static function checkChannelError(Response $response): array
  {
    if ($response->successful()) {
      return ['reason' => false, 'message' => null];
    }

    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'channelNotFound' => [
        'reason' => true,
        'message' => 'Akun Google Anda belum memiliki channel YouTube. Silakan buat channel terlebih dahulu.',
      ],
      'channelForbidden' => [
        'reason' => true,
        'message' => 'Channel tidak dapat diakses. Periksa apakah Anda memiliki izin yang cukup.',
      ],
      'invalidCriteria' => [
        'reason' => true,
        'message' => 'Permintaan tidak valid. Pastikan parameter yang dikirim sudah benar.',
      ],
      default => [
        'reason' => false,
        'message' => 'Terjadi kesalahan saat memeriksa data channel.'
      ],
    };
  }

  public static function checkVideoError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'videoNotFound' => [
        'reason' => true,
        'message' => 'Video tidak ditemukan. Pastikan ID video yang Anda berikan benar atau video belum dihapus.'
      ],
      'forbidden' => [
        'reason' => true,
        'message' => 'Anda tidak memiliki izin untuk mengakses video ini. Video mungkin bersifat privat atau dibatasi aksesnya.'
      ],
      default => [
        'reason' => false,
        'message' => 'Terjadi kesalahan saat memeriksa data video.'
      ],
    };
  }

  public static function checkCommentsError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'forbidden' => [
        'reason' => true,
        'message' => 'Komentar tidak dapat diakses. Video mungkin bersifat privat atau aksesnya dibatasi.',
      ],
      'commentsDisabled' => [
        'reason' => true,
        'message' => 'Komentar telah dinonaktifkan pada video ini.',
      ],
      'commentThreadNotFound' => [
        'reason' => true,
        'message' => 'Thread komentar tidak ditemukan. Periksa apakah ID komentar valid.',
      ],
      'commentNotFound' => [
        'reason' => true,
        'message' => 'Komentar tidak ditemukan. Mungkin komentar telah dihapus atau ID-nya tidak valid.',
      ],
      default => [
        'reason' => false,
        'message' => 'Terjadi kesalahan saat memeriksa komentar video.'
      ],
    };
  }
}
