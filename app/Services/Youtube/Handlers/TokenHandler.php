<?php

namespace App\Services\Youtube\Handlers;

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
        $initialResponse->successful() ? 'Berhasil mengambil data dari YouTube Data API' : 'Gagal mengambil data dari YouTube Data API.'
      );
    }

    if (empty($user->google_refresh_token)) {
      Log::error("No refresh token available", ['user_id' => $user->id]);

      return $this->buildResponse(false, null, 'Refresh token tidak tersedia, silakan login ulang.');
    }

    $refreshResult = $this->googleService->refreshGoogleToken($user->google_refresh_token, $user);

    if (!$refreshResult['success']) {
      Log::error("Token refresh failed", ['user_id' => $user->id]);

      return $this->buildResponse(false, null, 'Token sudah tidak valid, silakan login ulang.');
    }

    $user->google_token = $refreshResult['google_token'];
    $user->save();

    $retryResponse = $retryCallback($user->google_token);

    if (!$retryResponse->successful()) {
      Log::error("Request failed after token refresh", ['user_id' => $user->id, 'status' => $retryResponse->status()]);

      return $this->buildResponse(false, null, 'Gagal mengambil data setelah refresh token, silahkan login ulang.');
    }

    Log::info("Token refreshed and request succeeded", ['user_id' => $user->id]);

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
