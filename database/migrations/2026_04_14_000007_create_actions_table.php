<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('action_id')->unique();
            $table->text('description')->nullable();
            $table->string('source')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->date('due_date')->nullable();
            $table->enum('status', ['Open', 'In Progress', 'Closed'])->default('Open');
            $table->text('closure_criteria')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('workstream_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actions');
    }
};
