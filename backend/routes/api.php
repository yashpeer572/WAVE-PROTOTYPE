<?php

use App\Http\Controllers\Api\ActionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DependencyController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\InitiativeController;
use App\Http\Controllers\Api\KtSessionController;
use App\Http\Controllers\Api\TransformationItemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkstreamController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/users', [UserController::class, 'index']);

    Route::apiResource('workstreams', WorkstreamController::class);
    Route::get('workstreams/{workstream}/initiatives', [WorkstreamController::class, 'initiatives']);

    Route::apiResource('initiatives', InitiativeController::class);

    Route::apiResource('transformation-items', TransformationItemController::class);
    Route::patch('transformation-items/{transformation_item}/status', [TransformationItemController::class, 'updateStatus']);

    Route::apiResource('dependencies', DependencyController::class);
    Route::get('dependencies-next-id', [DependencyController::class, 'nextId']);

    Route::apiResource('actions', ActionController::class);
    Route::get('actions-next-id', [ActionController::class, 'nextId']);

    Route::apiResource('kt-sessions', KtSessionController::class);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/export/{type}', [ExportController::class, 'export']);
});
