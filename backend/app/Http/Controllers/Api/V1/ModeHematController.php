<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\ModeHematService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModeHematController extends BaseApiController
{
    public function __construct(
        protected ModeHematService $modeHematService
    ) {}

    /**
     * Get current Mode Hemat status & restrictions.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $setting = $this->modeHematService->getSettings($user);
        $payload = $this->modeHematService->getRestrictionsPayload($setting);

        return $this->successResponse($payload, 'Status Mode Hemat berhasil diambil.');
    }

    /**
     * Activate Self-Lock.
     */
    public function activate(Request $request): JsonResponse
    {
        $user = $request->user();
        $setting = $this->modeHematService->activate($user);
        $payload = $this->modeHematService->getRestrictionsPayload($setting);

        return $this->successResponse($payload, 'Penguncian Mandiri (Mode Hemat) berhasil diaktifkan.');
    }

    /**
     * Deactivate Self-Lock.
     */
    public function deactivate(Request $request): JsonResponse
    {
        $user = $request->user();
        $setting = $this->modeHematService->deactivate($user);
        $payload = $this->modeHematService->getRestrictionsPayload($setting);

        return $this->successResponse($payload, 'Penguncian Mandiri (Mode Hemat) berhasil dinonaktifkan.');
    }
}
