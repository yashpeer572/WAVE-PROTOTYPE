<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dependencies', function (Blueprint $table) {
            $table->id();
            $table->string('dependency_id')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['Technical', 'Access', 'Resource', 'Process'])->default('Technical');
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('dependent_on')->nullable();
            $table->date('target_date')->nullable();
            $table->enum('status', ['Open', 'In Progress', 'Resolved', 'Blocked'])->default('Open');
            $table->enum('risk', ['Low', 'Medium', 'High'])->default('Medium');
            $table->text('mitigation')->nullable();
            $table->text('escalation')->nullable();
            $table->timestamps();
        });

        Schema::create('dependency_workstreams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dependency_id')->constrained()->cascadeOnDelete();
            $table->foreignId('workstream_id')->constrained()->cascadeOnDelete();
            $table->unique(['dependency_id', 'workstream_id']);
        });

        Schema::create('item_dependencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transformation_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('dependency_id')->constrained()->cascadeOnDelete();
            $table->unique(['transformation_item_id', 'dependency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_dependencies');
        Schema::dropIfExists('dependency_workstreams');
        Schema::dropIfExists('dependencies');
    }
};
