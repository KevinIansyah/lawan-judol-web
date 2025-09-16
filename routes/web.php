<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatasetController;
use App\Http\Controllers\KeywordController;
use App\Http\Controllers\KeywordImportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PublicVideoController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\YourVideoController;
use App\Http\Controllers\YoutubeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['redirect_if_deletion_scheduled'])->group(function () {
    Route::get('/', fn() => Inertia::render('home'))->name('home');
    Route::get('/keywords', [KeywordController::class, 'index'])->name('keywords.index');
    Route::get('/guides', fn() => Inertia::render('guide'))->name('guides');
    Route::get('/privacy-policy', fn() => Inertia::render('privacy-policy'))->name('privacy-policy');
    Route::get('/terms-of-service', fn() => Inertia::render('terms-of-service'))->name('terms-of-service');
});
Route::middleware(['auth', 'verified', 'check_account_deletion_status'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('analysis')->group(function () {
        Route::get('public-videos/{id}', [PublicVideoController::class, 'show'])->name('public-videos.show')->middleware('ensure_analysis_owner');
        Route::get('your-videos/{id}', [YourVideoController::class, 'show'])->name('your-videos.show')->middleware('ensure_analysis_owner');
        Route::resource('public-videos', PublicVideoController::class)->except('show');
        Route::resource('your-videos', YourVideoController::class)->except('show');
    });
    Route::post('/analyses/{analysis}/retry', [AnalysisController::class, 'retry'])->name('analyses.retry');
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
    Route::post('/datasets', [DatasetController::class, 'store'])->name('datasets.store');
    Route::resource('datasets', DatasetController::class)->middleware('is_admin')->except('store');

    Route::prefix('keyword')->group(function () {
        Route::put('/update-json-file', [KeywordController::class, 'updateJsonFile'])->name('update-json-file');
    });
    Route::resource('keywords', KeywordController::class)->except(['index']);

    Route::prefix('notification')->name('notification.')->group(function () {
        Route::get('/{id}/redirect', [NotificationController::class, 'redirect'])->name('redirect');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
    });

    Route::prefix('import')->name('import.')->middleware('is_admin')->group(function () {
        Route::get('/keyword', [KeywordImportController::class, 'index']);
        Route::post('/keyword', [KeywordImportController::class, 'store']);
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/cancel-deletion', [ProfileController::class, 'showCancelDeletion'])->name('cancel-deletion');
    Route::post('/cancel-deletion', [ProfileController::class, 'cancelDeletion'])->name('cancel-deletion.confirm');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
