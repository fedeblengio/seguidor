<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WhatsappController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('clients', ClientController::class);
    Route::patch('clients/{client}/status', [ClientController::class, 'updateStatus']);

    Route::post('clients/{client}/notes', [NoteController::class, 'store']);
    Route::delete('notes/{note}', [NoteController::class, 'destroy']);

    Route::get('reminders', [ReminderController::class, 'index']);
    Route::post('clients/{client}/reminders', [ReminderController::class, 'store']);
    Route::patch('reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy']);

    Route::apiResource('templates', TemplateController::class);

    Route::get('dashboard', DashboardController::class);
    Route::get('whatsapp-link/{client}', [WhatsappController::class, 'link']);

    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
});
