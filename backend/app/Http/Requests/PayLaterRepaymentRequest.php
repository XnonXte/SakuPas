<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayLaterRepaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1'],
            'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'repayment_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Nominal pembayaran wajib diisi.',
            'amount.min' => 'Nominal pembayaran harus lebih besar dari 0.',
        ];
    }
}
