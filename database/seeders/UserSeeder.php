<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['username' => 'admin',  'name' => 'Admin User',      'email' => 'admin@wave.local',  'password' => 'admin123',  'role' => 'program_manager'],
            ['username' => 'lead',   'name' => 'Workstream Lead', 'email' => 'lead@wave.local',   'password' => 'lead123',   'role' => 'workstream_lead'],
            ['username' => 'member', 'name' => 'Team Member',     'email' => 'member@wave.local', 'password' => 'member123', 'role' => 'team_member'],
            ['username' => 'viewer', 'name' => 'Stakeholder',     'email' => 'viewer@wave.local', 'password' => 'viewer123', 'role' => 'viewer'],
        ];

        foreach ($users as $data) {
            $roleName = $data['role'];
            unset($data['role']);

            $user = User::create($data);
            $role = Role::where('slug', $roleName)->first();
            $user->roles()->attach($role->id);
        }
    }
}
