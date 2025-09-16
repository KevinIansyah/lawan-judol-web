<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfDeletionScheduled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->delete_account && $user->scheduled_deletion_at) {
                if ($user->scheduled_deletion_at <= now()) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect('/')->with('error', 'Akun Anda telah dihapus.');
                }

                return redirect()->route('cancel-deletion');
            }
        }

        return $next($request);
    }
}
