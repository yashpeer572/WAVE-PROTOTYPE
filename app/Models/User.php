<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot('assigned_at');
    }

    public function ownedWorkstreams(): HasMany
    {
        return $this->hasMany(Workstream::class, 'owner_id');
    }

    public function workstreams(): BelongsToMany
    {
        return $this->belongsToMany(Workstream::class, 'workstream_members')
            ->withPivot('role_id', 'assigned_at');
    }

    public function transformationItems(): HasMany
    {
        return $this->hasMany(TransformationItem::class, 'owner_id');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(Action::class, 'owner_id');
    }

    public function hasRole(string $slug): bool
    {
        return $this->roles()->where('slug', $slug)->exists();
    }

    public function hasAnyRole(array $slugs): bool
    {
        return $this->roles()->whereIn('slug', $slugs)->exists();
    }

    public function canEdit(): bool
    {
        return $this->hasAnyRole(['program_manager', 'workstream_lead', 'team_member']);
    }

    public function canDelete(): bool
    {
        return $this->hasRole('program_manager');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('program_manager');
    }
}
