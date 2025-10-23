<?php

namespace App\Http\Requests\Youtube;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PostModerationCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data.comment_id' => 'required|string|max:255',
            'data.moderation_status' => 'required|in:heldForReview,reject',
            'data.ban_author' => 'boolean',
            'data.analysis_id' => 'required|integer|exists:analyses,id',
        ];
    }

    public function messages(): array
    {
        return [
            'data.comment_id.required' => 'ID komentar harus diisi.',
            'data.comment_id.max' => 'ID komentar terlalu panjang.',
            'data.moderation_status.required' => 'Status moderasi harus diisi.',
            'data.moderation_status.in' => 'Status moderasi harus "heldForReview" atau "rejected".',
            'data.ban_author.boolean' => 'Ban author harus berupa true atau false.',
            'data.analysis_id.required' => 'ID analysis harus diisi.',
            'data.analysis_id.integer' => 'ID analysis harus berupa angka.',
            'data.analysis_id.exists' => 'Analysis tidak ditemukan dalam sistem.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Data yang dikirim tidak valid.',
                'errors' => $validator->errors(),
                'comment_id' => '',
            ], 422)
        );
    }
}
