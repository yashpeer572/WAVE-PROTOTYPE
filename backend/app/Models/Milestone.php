<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Milestone extends Model
{
    protected $fillable = ['workstream_id', 'name', 'target_date', 'status'];

    protected function casts(): array
    {
        return [
            'target_date' => 'date',
        ];
    }

    public function workstream(): BelongsTo
    {
        return $this->belongsTo(Workstream::class);
    }
}
