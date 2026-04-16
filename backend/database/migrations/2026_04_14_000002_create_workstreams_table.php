<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workstreams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->enum('rag_status', ['Green', 'Amber', 'Red'])->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('workstream_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workstream_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->unique(['workstream_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workstream_members');
        Schema::dropIfExists('workstreams');
    }
};
