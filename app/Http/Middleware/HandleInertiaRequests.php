<?php

namespace App\Http\Middleware;

use App\Support\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()
                    ? $request->user()->only(['id', 'name', 'email', 'avatar', 'role', 'youtube_permission_granted'])
                    : null,
                'notifications' => $request->user()
                    ? $request->user()
                    ->notifications()
                    ->latest()
                    ->take(25)
                    ->get()
                    ->toArray()
                    : [],
            ],
            'error' => fn() => $request->session()->get('error'),
            'success' => fn() => $request->session()->get('success'),
            'info' => fn() => $request->session()->get('info'),
        ];
    }
}
