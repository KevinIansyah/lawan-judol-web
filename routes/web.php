<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\DatasetController;
use App\Http\Controllers\KeywordController;
use App\Http\Controllers\KeywordImportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicVideoController;
use App\Http\Controllers\YourVideoController;
use App\Http\Controllers\YoutubeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('home'))->name('home');

Route::resource('keywords', KeywordController::class)->only(['index']);
Route::get('/guides', fn() => Inertia::render('guide'))->name('guides');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() =>  Inertia::render('dashboard'))->name('dashboard');

    Route::prefix('analysis')->group(function () {
        Route::resource('public-videos', PublicVideoController::class);
        Route::resource('your-videos', YourVideoController::class);
    });
    Route::resource('analyses', AnalysisController::class);

    Route::prefix('youtube')->group(function () {
        Route::get('/video', [YoutubeController::class, 'getVideo'])->name('video');
        Route::get('/videos', [YoutubeController::class, 'getVideos'])->name('videos');
        Route::get('/comments', [YoutubeController::class, 'getComments'])->name('comments');
        Route::post('/moderation', [YoutubeController::class, 'postModerationComment'])->name('moderation');
    });

    Route::prefix('dataset')->middleware('is_admin')->group(function () {
        Route::get('/download', [DatasetController::class, 'download'])->name('download');
    });
    Route::resource('datasets', DatasetController::class)->middleware('is_admin');

    Route::prefix('keyword')->group(function () {
        Route::put('/update-json-file', [KeywordController::class, 'updateJsonFile'])->name('update-json-file');
    });
    Route::resource('keywords', KeywordController::class)->except(['index']);

    Route::prefix('notification')->name('notification.')->group(function () {
        Route::get('/{id}/redirect', [NotificationController::class, 'redirect'])->name('redirect');
        // Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        // Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
    });

    Route::prefix('import')->name('import.')->middleware('is_admin')->group(function () {
        Route::get('/keyword', [KeywordImportController::class, 'index']);
        Route::post('/keyword', [KeywordImportController::class, 'store']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
