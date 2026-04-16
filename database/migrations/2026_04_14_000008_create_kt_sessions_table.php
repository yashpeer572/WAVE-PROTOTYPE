<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kt_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workstream_id')->constrained()->cascadeOnDelete();
            $table->string('product_platform')->nullable();
            $table->text('kt_scope')->nullable();
            $table->foreignId('kt_owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sme')->nullable();
            $table->string('receiving_team')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('current_stage', ['Planned', 'In Progress', 'Completed'])->default('Planned');
            $table->string('overall_status')->default('Not Started');
            $table->timestamps();
        });

        Schema::create('kt_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kt_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('participant_role', ['Owner', 'SME', 'Attendee'])->default('Attendee');
            $table->unique(['kt_session_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kt_participants');
        Schema::dropIfExists('kt_sessions');
    }
};
