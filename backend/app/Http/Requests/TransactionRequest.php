<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
            'payment_method' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'account_id.required' => 'Pilih rekening atau sumber dana.',
            'category_id.required' => 'Pilih kategori transaksi.',
            'type.required' => 'Tentukan jenis transaksi (income / expense).',
            'amount.required' => 'Nominal transaksi wajib diisi.',
            'amount.min' => 'Nominal transaksi harus lebih besar dari 0.',
            'description.required' => 'Deskripsi transaksi wajib diisi.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
        ];
    }
}
