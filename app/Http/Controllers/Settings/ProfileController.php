<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Jobs\DeleteUserPermanently;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'confirmation' => ['required', 'string', function ($attribute, $value, $fail) {
                if ($value !== 'HAPUS AKUN') {
                    $fail('Konfirmasi penghapusan tidak sesuai.');
                }
            }],
        ]);

        $user = $request->user();

        $user->update([
            'delete_account' => true,
            'scheduled_deletion_at' => now()->addDays(7),
        ]);

        DeleteUserPermanently::dispatch($user->id)->delay(now()->addDays(7))->onQueue('delete_account');

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Akun Anda telah dijadwalkan untuk dihapus dalam 7 hari. Anda dapat login kembali untuk membatalkan penghapusan.');
    }


    public function showCancelDeletion(Request $request)
    {
        $user = $request->user();

        if (!$user->delete_account || !$user->scheduled_deletion_at) {
            return redirect()->route('dashboard');
        }

        $daysRemaining = now()->diffInDays($user->scheduled_deletion_at, false);
        $hoursRemaining = now()->diffInHours($user->scheduled_deletion_at, false) % 24;

        return Inertia::render('cancel-deletion', [
            'deletion_info' => [
                'days_remaining' => max(0, (int) $daysRemaining),
                'hours_remaining' => max(0, (int) $hoursRemaining),
                'scheduled_deletion_at' => $user->scheduled_deletion_at->toISOString(),
                'can_cancel' => $user->scheduled_deletion_at > now(),
            ]
        ]);
    }

    public function cancelDeletion(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->delete_account && $user->scheduled_deletion_at > now()) {
            $user->update([
                'delete_account' => false,
                'scheduled_deletion_at' => null,
            ]);

            $intendedUrl = session('url.intended', route('dashboard'));
            session()->forget('url.intended');

            return redirect($intendedUrl)->with('success', 'Penghapusan akun berhasil dibatalkan.');
        }

        return redirect('/')->with('error', 'Tidak ada penghapusan akun yang dapat dibatalkan.');
    }
}
