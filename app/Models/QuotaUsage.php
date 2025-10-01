<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotaUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'videos_analyzed_count',
        'comments_moderated_count',
        'youtube_quota_used',
    ];

    protected $casts = [
        'date' => 'date',
        'videos_analyzed_count' => 'integer',
        'comments_moderated_count' => 'integer',
        'youtube_quota_used' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
