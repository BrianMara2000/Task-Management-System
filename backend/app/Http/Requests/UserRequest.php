<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }



    public function rules(): array
    {
        return [

            'name' => ['required', 'max:255'],
            'email' => [
                'required',
                'email' => ['required', 'email',  Rule::unique('users', 'email')->ignore($this->user)]

            ],
            'profile_image' => ['nullable', 'image', 'max:2048'],
            'role' => ['nullable', 'string', 'in:admin,user'],
        ];
    }
}
