<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Serve SakuPas Vanilla Frontend seamlessly from Laravel or standalone.
*/

Route::get('/', function () {
    $frontendIndex = base_path('../frontend/index.html');
    if (File::exists($frontendIndex)) {
        return File::get($frontendIndex);
    }
    return view('welcome');
});

Route::get('/css/{file}', function ($file) {
    $path = base_path("../frontend/css/{$file}");
    if (File::exists($path)) {
        return Response::make(File::get($path), 200, ['Content-Type' => 'text/css']);
    }
    abort(404);
});

Route::get('/js/{file}', function ($file) {
    $path = base_path("../frontend/js/{$file}");
    if (File::exists($path)) {
        return Response::make(File::get($path), 200, ['Content-Type' => 'application/javascript']);
    }
    abort(404);
});

Route::get('/assets/{path}', function ($path) {
    $fullPath = base_path("../frontend/assets/{$path}");
    if (File::exists($fullPath)) {
        $mime = File::mimeType($fullPath);
        return Response::make(File::get($fullPath), 200, ['Content-Type' => $mime]);
    }
    abort(404);
})->where('path', '.*');
