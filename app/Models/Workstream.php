<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workstream extends Model
{
    protected $fillable = ['name', 'description', 'rag_status', 'owner_id'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workstream_members')
            ->withPivot('role_id', 'assigned_at');
    }

    public function initiatives(): HasMany
    {
        return $this->hasMany(Initiative::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class);
    }

    public function dependencies(): BelongsToMany
    {
        return $this->belongsToMany(Dependency::class, 'dependency_workstreams');
    }

    public function actions(): HasMany
    {
        return $this->hasMany(Action::class);
    }

    public function ktSessions(): HasMany
    {
        return $this->hasMany(KtSession::class);
    }
}
