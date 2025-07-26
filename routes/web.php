<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\DatasetController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicVideoController;
use App\Http\Controllers\YourVideoController;
use App\Http\Controllers\YoutubeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('home'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() =>  Inertia::render('dashboard'))->name('dashboard');

    Route::prefix('analysis')->group(function () {
        Route::resource('public-videos', PublicVideoController::class);
        Route::resource('your-videos', YourVideoController::class);
    });

    Route::prefix('youtube')->group(function () {
        Route::get('/video', [YoutubeController::class, 'getVideo'])->name('video');
        Route::get('/videos', [YoutubeController::class, 'getVideos'])->name('videos');
        Route::get('/comments', [YoutubeController::class, 'getComments'])->name('comments');
        Route::post('/clear-cache', [YoutubeController::class, 'clearCache'])->name('clear-cache');
    });

    Route::resource('analyses', AnalysisController::class);
    Route::resource('datasets', DatasetController::class);

    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/{id}/redirect', [NotificationController::class, 'redirect'])->name('redirect');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
    });
});

Route::get('/keywords', fn() => Inertia::render('keyword'))->name('keywords');
Route::get('/guides', fn() => Inertia::render('guide'))->name('guides');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
