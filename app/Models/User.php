<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'google_id',
        'google_token',
        'google_refresh_token',
        'youtube_permission_granted',
        'delete_account',
        'scheduled_deletion_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'scheduled_deletion_at' => 'datetime',
            'password' => 'hashed',
            'google_token' => 'encrypted',
            'google_refresh_token' => 'encrypted',
        ];
    }

    public function analyses()
    {
        return $this->hasMany(Analysis::class);
    }

    public function datasets()
    {
        return $this->hasMany(Dataset::class);
    }

    public function keywords()
    {
        return $this->hasMany(Keyword::class);
    }

    public function isScheduledForDeletion(): bool
    {
        return $this->delete_account &&
            $this->scheduled_deletion_at &&
            $this->scheduled_deletion_at > now();
    }

    public function getDaysUntilDeletion(): ?int
    {
        if (!$this->isScheduledForDeletion()) {
            return null;
        }

        return now()->diffInDays($this->scheduled_deletion_at);
    }
}
