<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Dependency extends Model
{
    use Auditable;
    protected $fillable = [
        'dependency_id',
        'description',
        'type',
        'owner_id',
        'dependent_on',
        'target_date',
        'status',
        'risk',
        'mitigation',
        'escalation',
    ];

    protected function casts(): array
    {
        return [
            'target_date' => 'date',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function workstreams(): BelongsToMany
    {
        return $this->belongsToMany(Workstream::class, 'dependency_workstreams');
    }

    public function transformationItems(): BelongsToMany
    {
        return $this->belongsToMany(TransformationItem::class, 'item_dependencies');
    }
}
