<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ensures `rag` exists for RAG health (Green / Amber / Red) on transformation items.
     * New installs already get this from create_transformation_items; this is a no-op then.
     */
    public function up(): void
    {
        if (Schema::hasColumn('transformation_items', 'rag')) {
            return;
        }

        Schema::table('transformation_items', function (Blueprint $table) {
            $table->enum('rag', ['Green', 'Amber', 'Red'])->nullable()->after('status');
        });
    }

    public function down(): void
    {
        // No-op: do not drop `rag` here (would destroy data on rollback).
    }
};
