<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transformation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('initiative_id')->constrained()->cascadeOnDelete();
            $table->text('objective')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('owner_org', ['5Flow', 'Peer'])->default('Peer');
            $table->string('five_flow_contact')->nullable();
            $table->string('peer_contact')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['Not Started', 'In Progress', 'Completed', 'Blocked'])->default('Not Started');
            $table->enum('rag', ['Green', 'Amber', 'Red'])->nullable();
            $table->text('success_metrics')->nullable();
            $table->text('risks')->nullable();
            $table->unsignedTinyInteger('percent_complete')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transformation_items');
    }
};
