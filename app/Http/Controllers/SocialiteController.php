<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\GoogleService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        return Socialite::driver('google')
            ->setScopes([
                'email',
                'profile',
                'https://www.googleapis.com/auth/youtube.force-ssl'
            ])->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        if ($request->has('error')) {
            return redirect('/')
                ->with('error', 'Login dibatalkan. Silakan coba lagi jika ingin melanjutkan.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();

            $user = $this->googleService->findOrCreateUser($googleUser);

            Auth::login($user);

            return redirect('/dashboard');
        } catch (\Exception $e) {
            Log::error('Google login error: ' . $e->getMessage());

            return redirect('/')
                ->with('error', 'Terjadi kesalahan saat login dengan Google.');
        }
    }
}
