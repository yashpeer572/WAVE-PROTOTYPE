<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Initiative extends Model
{
    protected $fillable = ['workstream_id', 'name', 'description'];

    public function workstream(): BelongsTo
    {
        return $this->belongsTo(Workstream::class);
    }

    public function transformationItems(): HasMany
    {
        return $this->hasMany(TransformationItem::class);
    }
}
