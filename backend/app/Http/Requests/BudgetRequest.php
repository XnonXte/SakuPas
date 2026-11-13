<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'amount' => ['required', 'integer', 'min:0'],
            'month' => ['nullable', 'integer', 'between:1,12'],
            'year' => ['nullable', 'integer', 'min:2020'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori budget wajib dipilih.',
            'amount.required' => 'Nominal alokasi wajib diisi.',
            'amount.min' => 'Nominal alokasi tidak boleh negatif.',
        ];
    }
}
