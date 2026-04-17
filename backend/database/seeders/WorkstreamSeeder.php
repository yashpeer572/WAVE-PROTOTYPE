<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workstream;
use Illuminate\Database\Seeder;

class WorkstreamSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('username', 'yash')->first();

        $workstreams = [
            'Governance',
            'Contracts and Financial',
            '5Flow AI Studio',
            'New Ways of Working',
            'TMO',
            'Wave',
            'MediaBox',
            'DragonFly',
            'Resource',
        ];

        foreach ($workstreams as $name) {
            Workstream::create([
                'name' => $name,
                'owner_id' => $admin->id,
            ]);
        }
    }
}
