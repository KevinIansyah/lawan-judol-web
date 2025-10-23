<?php

namespace App\Http\Requests\Youtube;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class GetCommentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'video_id' => 'required|string|regex:/^[a-zA-Z0-9_-]{11}$/',
        ];
    }

    public function messages(): array
    {
        return [
            'video_id.required' => 'ID video harus diisi.',
            'video_id.regex' => 'Format ID video YouTube tidak valid.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'ID video tidak valid.',
                'errors' => $validator->errors(),
                'comments' => '',
                'total' => 0,
            ], 400)
        );
    }
}
