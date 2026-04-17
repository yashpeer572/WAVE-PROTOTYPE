<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** Transformation plan row; `rag` is RAG health (Green, Amber, or Red), nullable. */
class TransformationItem extends Model
{
    use Auditable;

    protected $fillable = [
        'initiative_id',
        'objective',
        'owner_id',
        'owner_org',
        'five_flow_contact',
        'peer_contact',
        'start_date',
        'end_date',
        'status',
        'rag',
        'success_metrics',
        'risks',
        'percent_complete',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'percent_complete' => 'integer',
        ];
    }

    public function initiative(): BelongsTo
    {
        return $this->belongsTo(Initiative::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function dependencies(): BelongsToMany
    {
        return $this->morphToMany(Dependency::class, 'linkable', 'dependency_links');
    }
}
