<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'video',
        'status',
        'type',
        'gambling_file_path',
        'nongambling_file_path',
        'keyword_file_path',
    ];

    protected $casts = [
        'video' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
