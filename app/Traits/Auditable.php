<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            self::logAudit($model, 'create', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $changed = $model->getChanges();
            unset($changed['updated_at']);

            if (! empty($changed)) {
                $old = array_intersect_key($model->getOriginal(), $changed);
                self::logAudit($model, 'update', $old, $changed);
            }
        });

        static::deleted(function ($model) {
            self::logAudit($model, 'delete', $model->getOriginal(), null);
        });
    }

    private static function logAudit($model, string $action, ?array $old, ?array $new): void
    {
        $userId = null;
        try {
            $userId = auth()->id();
        } catch (\Throwable) {
        }

        AuditLog::create([
            'user_id' => $userId,
            'table_name' => $model->getTable(),
            'record_id' => $model->getKey(),
            'action' => $action,
            'old_values' => $old,
            'new_values' => $new,
        ]);
    }
}
