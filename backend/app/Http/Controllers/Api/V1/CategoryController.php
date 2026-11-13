<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends BaseApiController
{
    /**
     * List all categories available to user (system + custom).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $categories = Category::where(function (Builder $q) use ($user) {
            $q->whereNull('user_id')
                ->orWhere('user_id', $user->id);
        })
            ->orderBy('is_system', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        return $this->successResponse($categories, 'Daftar kategori berhasil diambil.');
    }

    /**
     * Create custom category.
     */
    public function store(CategoryRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $category = Category::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'type' => $data['type'],
            'sublabel' => $data['sublabel'] ?? null,
            'icon' => $data['icon'] ?? 'CircleDot',
            'color' => $data['color'] ?? '#343F56',
            'is_system' => false,
        ]);

        return $this->successResponse($category, 'Kategori baru berhasil ditambahkan.', 201);
    }

    /**
     * Delete custom category.
     */
    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->is_system || $category->user_id !== $request->user()->id) {
            return $this->errorResponse('Kategori sistem tidak dapat dihapus.', null, 403);
        }

        if ($category->transactions()->count() > 0) {
            return $this->errorResponse(
                'Kategori tidak dapat dihapus karena masih digunakan dalam riwayat transaksi.',
                null,
                422
            );
        }

        $category->delete();

        return $this->successResponse(null, 'Kategori berhasil dihapus.');
    }
}
