<?php

namespace Database\Seeders;

use App\Models\Dependency;
use App\Models\Workstream;
use Illuminate\Database\Seeder;

class DependencySeeder extends Seeder
{
    public function run(): void
    {
        $deps = [
            [
                'dependency_id' => 'D-01',
                'workstream' => '5Flow AI Studio',
                'description' => 'Cloud infrastructure readiness for Studio deployment',
                'type' => 'Technical',
                'dependent_on' => 'Cloud Team',
                'target_date' => '2026-03-27',
                'status' => 'Resolved',
                'risk' => 'High',
                'mitigation' => 'Pre-provisioned environments',
                'escalation' => 'Escalated to CTO',
            ],
            [
                'dependency_id' => 'D-02',
                'workstream' => 'Wave',
                'description' => 'Access to Propelis codebase for KT sessions',
                'type' => 'Access',
                'dependent_on' => 'Propelis Team',
                'target_date' => '2026-04-06',
                'status' => 'Open',
                'risk' => 'Medium',
                'mitigation' => 'Requested access via ticket',
                'escalation' => '',
            ],
            [
                'dependency_id' => 'D-03',
                'workstream' => 'Contracts and Financial',
                'description' => 'Legal team availability for SOW review',
                'type' => 'Resource',
                'dependent_on' => 'Legal Team',
                'target_date' => '2026-04-15',
                'status' => 'Open',
                'risk' => 'Low',
                'mitigation' => 'Scheduled bi-weekly slots',
                'escalation' => '',
            ],
        ];

        foreach ($deps as $data) {
            $wsName = $data['workstream'];
            unset($data['workstream']);

            $dep = Dependency::create($data);

            $ws = Workstream::where('name', $wsName)->first();
            if ($ws) {
                $dep->workstreams()->attach($ws->id);
            }
        }
    }
}
