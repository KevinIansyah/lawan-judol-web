<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\GoogleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    protected $googleService;

    public function __construct(GoogleService $googleService)
    {
        $this->googleService = $googleService;
    }

    public function redirect()
    {
        // return Socialite::driver('google')
        //     ->scopes([
        //         'email',
        //         'profile',
        //         'https://www.googleapis.com/auth/youtube.force-ssl'
        //     ])->with([
        //         'access_type' => 'offline',
        //     ])
        //     ->redirect();
        return Socialite::driver('google')
            ->scopes(['email', 'profile'])
            ->with([
                'access_type' => 'offline',
                'include_granted_scopes' => 'true',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        if ($request->has('error')) {
            if (Auth::check()) {
                return redirect('settings/youtube-access')->with('error', 'Pemberian akses YouTube dibatalkan. Silakan coba lagi jika ingin melanjutkan.');
            } else {
                return redirect('/')->with('error', 'Login dibatalkan. Silakan coba lagi jika ingin melanjutkan.');
            }
        }

        try {
            $googleUser = Socialite::driver('google')->user();

            if (Auth::check()) {
                return $this->handleGrantCallback($googleUser);
            } else {
                return $this->handleLoginCallback($googleUser);
            }
        } catch (\Exception $e) {
            if (Auth::check()) {
                return redirect('settings/youtube-access')->with('error', 'Terjadi kesalahan saat mencoba memberikan akses. Silakan coba lagi.');
            } else {
                return redirect('/')->with('error', 'Terjadi kesalahan saat login dengan Google.');
            }
        }
    }

    private function handleLoginCallback($googleUser)
    {
        $user = $this->googleService->findOrCreateUser($googleUser);
        Auth::login($user);
        return redirect('/dashboard');
    }

    private function handleGrantCallback($googleUser)
    {
        $user = User::find(Auth::id());

        if (!$user) {
            Log::warning('Grant callback attempt failed: user not found.');
            return redirect('settings/youtube-access')->with('error', 'Terjadi kesalahan saat mencoba memberikan akses. Silakan coba lagi.');
        }

        $data = [
            'google_token' => $googleUser->token,
            'youtube_permission_granted' => true,
        ];

        if ($googleUser->refreshToken) {
            $data['google_refresh_token'] = $googleUser->refreshToken;
        }

        $user->update($data);

        return redirect('settings/youtube-access')->with('success', 'Akses ke akun YouTube Anda telah berhasil diberikan.');
    }

    public function revoke()
    {
        $user = User::find(Auth::id());
        if (!$user || !$user->google_token) {
            Log::warning('Revoke attempt failed: user not found or token missing.');
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mencoba mencabut akses. Silakan coba lagi.');
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/revoke', [
            'token' => $user->google_refresh_token,
        ]);

        if ($response->successful()) {
            $user->update([
                'google_token' => null,
                'google_refresh_token' => null,
                'youtube_permission_granted' => false,
            ]);

            return redirect()->back()->with('success', 'Akses ke akun YouTube Anda telah berhasil dicabut.');
        } else {
            Log::error('Failed to revoke token: ' . $response->body());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mencoba mencabut akses. Silakan coba lagi.');
        }
    }

    public function grant()
    {
        $user = User::find(Auth::id());

        if (!$user) {
            Log::warning('Grant attempt failed: user not found.');
            return redirect()->back()->with('error', 'Terjadi kesalahan saat mencoba memberikan akses. Silakan coba lagi.');
        }

        if ($user->youtube_permission_granted && $user->google_token && $user->google_refresh_token) {
            return redirect()->back()->with('info', 'Akses ke akun YouTube Anda sudah aktif.');
        }

        return Socialite::driver('google')
            ->scopes([
                'email',
                'profile',
                'https://www.googleapis.com/auth/youtube.force-ssl'
            ])->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
                'login_hint' => $user->email,
            ])
            ->redirect();
    }
}
