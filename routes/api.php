<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MatchController;

Route::prefix('v1')->group(function () {
    Route::get('/matches/live', [MatchController::class, 'liveMatches']);
    Route::get('/matches/date/{date?}', [MatchController::class, 'matchesByDate']);
    Route::get('/matches/{id}/details', [MatchController::class, 'matchDetails']);
    Route::get('/leagues', [MatchController::class, 'leagues']);
    Route::post('/subscribe', [MatchController::class, 'subscribe']);
    Route::post('/unsubscribe', [MatchController::class, 'unsubscribe']);
    Route::get('/vendor-type', [MatchController::class, 'vendorType']);
    Route::post('/sync', [MatchController::class, 'triggerSync']);
});
