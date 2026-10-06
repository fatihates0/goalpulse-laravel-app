<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\ApiController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/apikullanimi', [ApiController::class, 'documentation'])->name('api.docs');
