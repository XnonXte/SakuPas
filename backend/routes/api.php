<?php

use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BudgetController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ModeHematController;
use App\Http\Controllers\Api\V1\PayLaterController;
use App\Http\Controllers\Api\V1\TransactionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected API routes
    Route::middleware('auth:sanctum')->group(function () {
        // User profile & auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/user', [AuthController::class, 'updateProfile']);

        // Dashboard endpoints
        Route::prefix('dashboard')->group(function () {
            Route::get('/', [DashboardController::class, 'index']);
            Route::get('/cash-flow', [DashboardController::class, 'cashFlow']);
            Route::get('/expense-distribution', [DashboardController::class, 'expenseDistribution']);
            Route::get('/safe-to-spend', [DashboardController::class, 'safeToSpend']);
        });

        // Accounts
        Route::apiResource('accounts', AccountController::class);

        // Categories
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Transactions
        Route::apiResource('transactions', TransactionController::class);

        // PayLater Obligations
        Route::get('/paylater', [PayLaterController::class, 'index']);
        Route::post('/paylater', [PayLaterController::class, 'store']);
        Route::get('/paylater/{paylater}', [PayLaterController::class, 'show']);
        Route::put('/paylater/{paylater}', [PayLaterController::class, 'update']);
        Route::delete('/paylater/{paylater}', [PayLaterController::class, 'destroy']);
        Route::post('/paylater/{paylater}/toggle-paid', [PayLaterController::class, 'togglePaid']);
        Route::get('/paylater/{paylater}/repayments', [PayLaterController::class, 'repayments']);
        Route::post('/paylater/{paylater}/repayments', [PayLaterController::class, 'recordRepayment']);

        // Budgets
        Route::get('/budgets', [BudgetController::class, 'index']);
        Route::post('/budgets', [BudgetController::class, 'store']);
        Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy']);

        // Mode Hemat
        Route::prefix('mode-hemat')->group(function () {
            Route::get('/', [ModeHematController::class, 'index']);
            Route::post('/activate', [ModeHematController::class, 'activate']);
            Route::post('/deactivate', [ModeHematController::class, 'deactivate']);
        });
    });
});
