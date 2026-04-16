<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Action extends Model
{
    use Auditable;
    protected $fillable = [
        'action_id',
        'description',
        'source',
        'owner_id',
        'priority',
        'due_date',
        'status',
        'closure_criteria',
        'notes',
        'workstream_id',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function workstream(): BelongsTo
    {
        return $this->belongsTo(Workstream::class);
    }

    public function isOverdue(): bool
    {
        return $this->status !== 'Closed'
            && $this->due_date
            && $this->due_date->isPast();
    }
}
