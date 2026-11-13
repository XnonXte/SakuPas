<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'account_type' => ['required', 'string', 'in:bank,ewallet,cash,other'],
            'balance' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
