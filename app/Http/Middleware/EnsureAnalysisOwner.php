<?php

namespace App\Http\Middleware;

use App\Models\Analysis;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAnalysisOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $analysis = Analysis::findOrFail($request->route('id'));

        if ($analysis->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
