<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayLaterBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'provider_name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:255'],
            'total_amount' => ['required', 'integer', 'min:1'],
            'due_date' => ['required', 'date'],
            'installment_info' => ['nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'provider_name.required' => 'Nama penyedia PayLater wajib diisi.',
            'total_amount.required' => 'Total tagihan wajib diisi.',
            'total_amount.min' => 'Total tagihan harus lebih besar dari 0.',
            'due_date.required' => 'Tanggal jatuh tempo wajib diisi.',
        ];
    }
}
