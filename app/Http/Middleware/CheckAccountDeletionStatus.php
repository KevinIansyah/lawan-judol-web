<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountDeletionStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->delete_account && $user->scheduled_deletion_at) {
                if ($user->scheduled_deletion_at <= now()) {
                    Log::info("User logged out - deletion schedule passed", [
                        'user_id' => $user->id,
                        'scheduled_deletion_at' => $user->scheduled_deletion_at->toDateTimeString()
                    ]);

                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect('/')->with('error', 'Akun Anda telah dihapus.');
                }

                $isAllowedRoute = $request->is('cancel-deletion') ||
                    $request->is('cancel-deletion/*') ||
                    $request->routeIs('logout');

                if (!$isAllowedRoute) {
                    $daysRemaining = now()->diffInDays($user->scheduled_deletion_at, false);

                    session(['url.intended' => $request->url()]);

                    return redirect()->route('cancel-deletion')->with([
                        'warning' => "Akun Anda akan dihapus dalam {$daysRemaining} hari. Batalkan sekarang untuk melanjutkan menggunakan akun ini.",
                        'days_remaining' => $daysRemaining,
                    ]);
                }

                if ($request->is('cancel-deletion') || $request->is('cancel-deletion/*')) {
                    $daysRemaining = now()->diffInDays($user->scheduled_deletion_at, false);

                    session()->flash('deletion_info', [
                        'days_remaining' => $daysRemaining,
                        'scheduled_deletion_at' => $user->scheduled_deletion_at->toDateTimeString()
                    ]);
                }
            }
        }

        return $next($request);
    }
}
