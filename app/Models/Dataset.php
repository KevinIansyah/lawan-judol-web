<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dataset extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'comment',
        'true_label',
    ];

    protected $casts = [
        'comment' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
