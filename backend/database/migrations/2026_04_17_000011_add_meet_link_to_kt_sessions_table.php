<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kt_sessions', function (Blueprint $table) {
            $table->string('meet_link')->nullable()->after('overall_status');
        });
    }

    public function down(): void
    {
        Schema::table('kt_sessions', function (Blueprint $table) {
            $table->dropColumn('meet_link');
        });
    }
};
