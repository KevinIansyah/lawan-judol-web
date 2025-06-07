<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GoogleService
{
  /**
   * Find an existing user by Google ID or email, or create a new one.
   */
  public function findOrCreateUser($googleUser)
  {
    $user = User::where('google_id', $googleUser->id)
      ->orWhere('email', $googleUser->email)
      ->first();

    $data = [
      'google_id' => $googleUser->id,
      'google_token' => $googleUser->token,
      'google_refresh_token' => $googleUser->refreshToken,
      'avatar' => $googleUser->avatar,
    ];

    if ($user) {
      $user->update($data);
    } else {
      $user = User::create(array_merge($data, [
        'name' => $googleUser->name,
        'email' => $googleUser->email,
        'role' => 'user',
        // 'password' => Hash::make(Str::random(16)),
      ]));
    }

    return $user;
  }

  /**
   * Refresh the Google API access token using the refresh token.
   */
  public function refreshAccessToken(string $refreshToken, User $user)
  {
    $clientId = config('services.google.client_id');
    $clientSecret = config('services.google.client_secret');

    $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
      'grant_type' => 'refresh_token',
      'refresh_token' => $refreshToken,
      'client_id' => $clientId,
      'client_secret' => $clientSecret,
    ]);

    if ($response->successful()) {
      $googleToken = $response->json()['access_token'];

      $user->update([
        'google_token' => $googleToken,
      ]);

      return [
        'success' => true,
        'google_token' => $googleToken,
      ];
    }

    return [
      'success' => false,
      'message' => 'Gagal refresh google token',
      'response' => $response->json(),
    ];
  }
}
