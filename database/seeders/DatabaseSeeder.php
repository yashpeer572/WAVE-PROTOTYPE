<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            WorkstreamSeeder::class,
            InitiativeSeeder::class,
            TransformationItemSeeder::class,
            DependencySeeder::class,
            ActionSeeder::class,
            KtSessionSeeder::class,
        ]);
    }
}
