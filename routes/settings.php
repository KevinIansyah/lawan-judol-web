<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\SocialiteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth', 'check_account_deletion_status')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/youtube-access', function () {
        return Inertia::render('settings/youtube-access');
    })->name('youtube-access');

    Route::get('settings/youtube-access/grant', [SocialiteController::class, 'grant'])->name('youtube-access.grant');
    Route::delete('settings/youtube-access/revoke', [SocialiteController::class, 'revoke'])->name('youtube-access.revoke');
});
