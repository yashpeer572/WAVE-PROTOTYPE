<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Polymorphic table for linking dependencies to any entity (Workstream, Initiative, Item, etc.)
        Schema::create('dependency_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dependency_id')->constrained()->onDelete('cascade');
            $table->morphs('linkable'); // linkable_id and linkable_type
            $table->string('metadata')->nullable(); // For "Others" or additional context
            $table->timestamps();
        });

        // Drop the old specific pivot table if it exists (or we can migrate data later)
        // Schema::dropIfExists('dependency_workstreams');
    }

    public function down(): void
    {
        Schema::dropIfExists('dependency_links');
    }
};
