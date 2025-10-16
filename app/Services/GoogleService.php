<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleService
{
  public function findOrCreateUser($googleUser)
  {
    $user = User::where('google_id', $googleUser->id)
      ->orWhere('email', $googleUser->email)
      ->first();

    $data = [
      'google_id' => $googleUser->id,
      'google_token' => $googleUser->token,
      'avatar' => $googleUser->avatar,
    ];

    if ($googleUser->refreshToken) {
      $data['google_refresh_token'] = $googleUser->refreshToken;
      $data['youtube_permission_granted'] = false;
      // $data['youtube_permission_granted'] = true;
    }

    if ($user) {
      $user->update($data);

      Log::info("User updated from Google OAuth", [
        'user_id' => $user->id,
        'google_id' => $googleUser->id,
        'has_refresh_token' => !empty($googleUser->refreshToken)
      ]);
    } else {
      $user = User::create(array_merge($data, [
        'name' => $googleUser->name,
        'email' => $googleUser->email,
        'role' => 'user',
      ]));

      Log::info("New user created from Google OAuth", [
        'user_id' => $user->id,
        'google_id' => $googleUser->id,
        'email' => $googleUser->email
      ]);
    }

    return $user;
  }

  public function refreshGoogleToken(string $refreshToken, User $user)
  {
    $clientId = config('services.google.client_id');
    $clientSecret = config('services.google.client_secret');

    try {
      $response = Http::timeout(60)->asForm()->post('https://oauth2.googleapis.com/token', [
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

        Log::info("Google token refreshed successfully", [
          'user_id' => $user->id
        ]);

        return [
          'success' => true,
          'google_token' => $googleToken,
        ];
      }

      Log::error("Google token refresh failed", [
        'user_id' => $user->id,
        'status' => $response->status(),
        'error' => $response->json()['error'] ?? 'Unknown error'
      ]);

      return [
        'success' => false,
        'message' => 'Gagal refresh google token',
        'response' => $response->json(),
      ];
    } catch (\Exception $e) {
      Log::error("Exception during Google token refresh", [
        'user_id' => $user->id,
        'error' => $e->getMessage()
      ]);

      return [
        'success' => false,
        'message' => 'Gagal refresh google token',
        'response' => null,
      ];
    }
  }
}
