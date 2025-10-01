<?php

namespace App\Http\Middleware;

use App\Services\QuotaService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckQuota
{
    protected $quotaService;

    public function __construct(QuotaService $quotaService)
    {
        $this->quotaService = $quotaService;
    }

    public function handle(Request $request, Closure $next, string $type): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $quotaCheck = match($type) {
            'video' => $this->quotaService->canAnalyzeVideo($user),
            'comment' => $this->quotaService->canModerateComment($user),
            default => ['allowed' => false, 'message' => 'Invalid quota type']
        };

        if (!$quotaCheck['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $quotaCheck['message'],
                'quota_info' => [
                    'limit' => $quotaCheck['limit'],
                    'used' => $quotaCheck['used'],
                    'remaining' => $quotaCheck['remaining']
                ]
            ], 429);
        }

        return $next($request);
    }
}