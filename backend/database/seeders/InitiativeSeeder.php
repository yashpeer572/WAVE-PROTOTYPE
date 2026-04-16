<?php

namespace Database\Seeders;

use App\Models\Initiative;
use App\Models\Workstream;
use Illuminate\Database\Seeder;

class InitiativeSeeder extends Seeder
{
    public function run(): void
    {
        $initiatives = [
            'Governance' => ['Reporting', 'Info Gathering', 'Operating Model'],
            'Contracts and Financial' => ['SOW'],
            '5Flow AI Studio' => ['Deployment'],
            'New Ways of Working' => ['Enablement'],
            'TMO' => ['Onboarding', 'Governance', 'Execution'],
            'Wave' => ['KT'],
            'MediaBox' => ['KT'],
            'DragonFly' => ['KT'],
            'Resource' => ['Onboarding'],
        ];

        foreach ($initiatives as $wsName => $items) {
            $ws = Workstream::where('name', $wsName)->first();
            foreach ($items as $name) {
                Initiative::create([
                    'workstream_id' => $ws->id,
                    'name' => $name,
                ]);
            }
        }
    }
}
