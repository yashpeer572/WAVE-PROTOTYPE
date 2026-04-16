<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['slug' => 'program_manager', 'display_name' => 'Program Manager', 'description' => 'Full access to all modules, override controls, dashboard visibility'],
            ['slug' => 'workstream_lead', 'display_name' => 'Workstream Lead', 'description' => 'Manage assigned workstreams, update status and milestones'],
            ['slug' => 'team_member', 'display_name' => 'Team Member', 'description' => 'Update assigned actions, KT sessions, and dependencies'],
            ['slug' => 'viewer', 'display_name' => 'Stakeholder / Viewer', 'description' => 'Read-only access to dashboards and reports'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
