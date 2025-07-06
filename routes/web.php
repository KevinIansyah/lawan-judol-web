<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicVideoController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\YourVideoController;
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
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('analysis')->group(function () {
        Route::resource('public-video', PublicVideoController::class);
        Route::resource('your-video', YourVideoController::class);
    });

    Route::prefix('video')->group(function () {
        Route::get('/', [VideoController::class, 'getVideo'])->name('video');
        Route::get('/all', [VideoController::class, 'getVideos'])->name('video.all');
        Route::get('/comment', [VideoController::class, 'getComments'])->name('video.comment');
        Route::post('/clear-cache', [VideoController::class, 'clearCache'])->name('video.clear-cache');
    });

    Route::resource('analysis', AnalysisController::class);
});


Route::get('/keyword', function () {
    return Inertia::render('keyword');
})->name('keyword');

Route::get('/guide', function () {
    return Inertia::render('guide');
})->name('guide');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
