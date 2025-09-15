<?php

namespace App\Services\Youtube\Helpers;

use Illuminate\Http\Client\Response;

class YouTubeErrorHelper
{
  public static function checkQuotaError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    if ($reason === 'quotaExceeded') {
      return [
        'success' => true,
        'message' => 'Kuota YouTube API telah habis. Silakan coba lagi besok.'
      ];
    }

    return [
      'success' => false,
      'message' => 'Terjadi kesalahan tidak terduga saat memeriksa kuota API.'
    ];
  }

  public static function checkChannelError(Response $response): array
  {
    if ($response->successful()) {
      return ['success' => false, 'message' => null];
    }

    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'channelNotFound' => [
        'success' => true,
        'message' => 'Akun Google Anda belum memiliki channel YouTube. Silakan buat channel terlebih dahulu.',
      ],
      'channelForbidden' => [
        'success' => true,
        'message' => 'Channel tidak dapat diakses. Periksa apakah Anda memiliki izin yang cukup.',
      ],
      'invalidCriteria' => [
        'success' => true,
        'message' => 'Permintaan tidak valid. Pastikan parameter yang dikirim sudah benar.',
      ],
      default => [
        'success' => false,
        'message' => 'Terjadi kesalahan saat memeriksa data channel.'
      ],
    };
  }

  public static function checkVideoError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'videoNotFound' => [
        'success' => true,
        'message' => 'Video tidak ditemukan. Pastikan ID video yang Anda berikan benar atau video belum dihapus.'
      ],
      'forbidden' => [
        'success' => true,
        'message' => 'Anda tidak memiliki izin untuk mengakses video ini. Video mungkin bersifat privat atau dibatasi aksesnya.'
      ],
      default => [
        'success' => false,
        'message' => 'Terjadi kesalahan saat memeriksa data video.'
      ],
    };
  }

  public static function checkCommentsError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'forbidden' => [
        'success' => true,
        'message' => 'Komentar tidak dapat diakses. Video mungkin bersifat privat atau aksesnya dibatasi.',
      ],
      'commentsDisabled' => [
        'success' => true,
        'message' => 'Komentar telah dinonaktifkan pada video ini.',
      ],
      'commentThreadNotFound' => [
        'success' => true,
        'message' => 'Thread komentar tidak ditemukan. Periksa apakah ID komentar valid.',
      ],
      'commentNotFound' => [
        'success' => true,
        'message' => 'Komentar tidak ditemukan. Mungkin komentar telah dihapus atau ID-nya tidak valid.',
      ],
      default => [
        'success' => false,
        'message' => 'Terjadi kesalahan saat memeriksa komentar video.'
      ],
    };
  }

  public static function checkModerationCommentError(Response $response): array
  {
    $reason = $response->json('error.errors.0.reason') ?? null;

    return match ($reason) {
      'banWithoutReject' => [
        'success' => true,
        'message' => 'Parameter banAuthor hanya dapat digunakan jika status moderasi diatur ke "rejected".',
      ],
      'operationNotSupported' => [
        'success' => true,
        'message' => 'Komentar ini tidak mendukung operasi moderasi penuh. Mungkin komentar tidak berbasis Google+.',
      ],
      'processingFailure' => [
        'success' => true,
        'message' => 'Server gagal memproses permintaan. Periksa kembali parameter yang dikirimkan.',
      ],
      'forbidden' => [
        'success' => true,
        'message' => 'Status moderasi komentar tidak dapat diubah. Periksa apakah Anda memiliki izin yang cukup.',
      ],
      'commentNotFound' => [
        'success' => true,
        'message' => 'Komentar tidak ditemukan. Pastikan ID komentar benar dan komentar belum dihapus.',
      ],
      default => [
        'success' => false,
        'message' => 'Terjadi kesalahan saat memproses moderasi komentar.',
      ],
    };
  }
}
