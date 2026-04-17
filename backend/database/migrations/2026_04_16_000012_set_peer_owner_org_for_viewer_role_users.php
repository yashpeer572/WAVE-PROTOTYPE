<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'owner_org')) {
            return;
        }

        $viewerRole = Role::query()->where('slug', 'viewer')->first();
        if (! $viewerRole) {
            return;
        }

        $ids = DB::table('user_roles')->where('role_id', $viewerRole->id)->pluck('user_id');
        if ($ids->isNotEmpty()) {
            DB::table('users')->whereIn('id', $ids)->update(['owner_org' => 'Peer']);
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'owner_org')) {
            return;
        }

        $viewerRole = Role::query()->where('slug', 'viewer')->first();
        if (! $viewerRole) {
            return;
        }

        $ids = DB::table('user_roles')->where('role_id', $viewerRole->id)->pluck('user_id');
        if ($ids->isNotEmpty()) {
            DB::table('users')->whereIn('id', $ids)->update(['owner_org' => '5Flow']);
        }
    }
};
