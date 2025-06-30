<?php

namespace App\Services\YouTube\Handlers;

use App\Models\User;
use App\Services\GoogleService;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;

class TokenHandler
{
  protected $googleService;

  public function __construct(GoogleService $googleService)
  {
    $this->googleService = $googleService;
  }

  public function tokenRefresh(User $user, Response $initialResponse, callable $retryCallback): array
  {
    if ($initialResponse->status() !== 401) {
      return $this->buildResponse(
        $initialResponse->successful(),
        $initialResponse,
        $initialResponse->successful() ? 'Request berhasil.' : 'Request gagal.'
      );
    }

    Log::warning("Google token expired or unauthorized. Attempting to refresh token for user ID {$user->id}.");

    if (empty($user->google_refresh_token)) {
      Log::error("No refresh token available for user ID {$user->id}.");
      return $this->buildResponse(false, null, 'Refresh token tidak tersedia, silakan login ulang.');
    }

    $refreshResult = $this->googleService->refreshGoogleToken($user->google_refresh_token, $user);

    if (!$refreshResult['success']) {
      Log::error("Failed to refresh google token for user ID {$user->id}.");
      return $this->buildResponse(false, null, 'Token sudah tidak valid, silakan login ulang.');
    }

    $user->google_token = $refreshResult['google_token'];
    Log::info("Successfully refreshed google token for user ID {$user->id}. Retrying request.");

    $retryResponse = $retryCallback($user->google_token);

    if (!$retryResponse->successful()) {
      Log::error("Failed to fetch data after token refresh for user ID {$user->id}.");
      return $this->buildResponse(false, null, 'Gagal mengambil data setelah refresh token, silahkan login ulang.');
    }

    return $this->buildResponse(true, $retryResponse, 'Request berhasil setelah refresh token.');
  }

  private function buildResponse(bool $success, ?Response $response, string $message): array
  {
    return [
      'success' => $success,
      'response' => $response,
      'message' => $message
    ];
  }
}
