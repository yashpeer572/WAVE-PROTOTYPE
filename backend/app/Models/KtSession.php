<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class KtSession extends Model
{
    use Auditable;
    protected $fillable = [
        'workstream_id',
        'product_platform',
        'kt_scope',
        'kt_owner_id',
        'sme',
        'receiving_team',
        'start_date',
        'end_date',
        'current_stage',
        'overall_status',
        'meet_link',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function workstream(): BelongsTo
    {
        return $this->belongsTo(Workstream::class);
    }

    public function ktOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kt_owner_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'kt_participants')
            ->withPivot('participant_role');
    }
}
