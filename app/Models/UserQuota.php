<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserQuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'daily_video_analysis_limit',
        'daily_comment_moderation_limit',
    ];

    protected $casts = [
        'daily_video_analysis_limit' => 'integer',
        'daily_comment_moderation_limit' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
