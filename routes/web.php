<?php

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/clear', function () {
//     Artisan::call('optimize');
//     return "Success Optimize";
// });

// Route::get('/notifications/read/{id}', [NotificationController::class, 'markAsRead'])->name('notifications.read');


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $name = 'a';
        return Inertia::render('dashboard', compact('name'));
    })->name('dashboard');

    Route::prefix('analysis')->group(function () {
        Route::get('/public-video', function () {
            return Inertia::render('analysis/public-video');
        })->name('public-video');

        Route::get('/public-video/detail', function () {
            return Inertia::render('analysis/detail');
        })->name('public-video.detail');

        Route::get('/your-video', function () {
            return Inertia::render('analysis/your-video');
        })->name('your-video');

        Route::get('/your-video/detail', function () {
            return Inertia::render('analysis/detail');
        })->name('your-video.detail');
    });

    // API endpoint untuk video
    Route::get('/api/videos/all', [VideoController::class, 'getAllVideos'])->name('api.videos.all');
    Route::post('/api/videos/clear-cache', [VideoController::class, 'clearCache'])->name('api.videos.clear-cache');

    // Route untuk halaman analisis (setelah pilih video)
    Route::get('/analysis/{videoId}', [AnalysisController::class, 'show'])->name('analysis.show');
});


Route::get('/keyword', function () {
    return Inertia::render('keyword');
})->name('keyword');

Route::get('/guide', function () {
    return Inertia::render('guide');
})->name('guide');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
