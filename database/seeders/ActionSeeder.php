<?php

namespace Database\Seeders;

use App\Models\Action;
use App\Models\Workstream;
use Illuminate\Database\Seeder;

class ActionSeeder extends Seeder
{
    public function run(): void
    {
        $actions = [
            [
                'action_id' => 'A-01',
                'description' => 'Set up cloud environments for 5Flow AI Studio',
                'source' => 'SteerCo Meeting',
                'priority' => 'High',
                'due_date' => '2026-03-27',
                'status' => 'Closed',
                'closure_criteria' => 'Environments provisioned and verified',
                'notes' => 'Completed on time',
                'workstream' => '5Flow AI Studio',
            ],
            [
                'action_id' => 'A-02',
                'description' => 'Share Propelis codebase access with Peer team',
                'source' => 'KT Planning',
                'priority' => 'High',
                'due_date' => '2026-04-06',
                'status' => 'In Progress',
                'closure_criteria' => '',
                'notes' => 'Pending approval',
                'workstream' => 'Wave',
            ],
            [
                'action_id' => 'A-03',
                'description' => 'Draft initial SOW document',
                'source' => 'Contract Review',
                'priority' => 'Medium',
                'due_date' => '2026-04-10',
                'status' => 'Open',
                'closure_criteria' => '',
                'notes' => '',
                'workstream' => 'Contracts and Financial',
            ],
            [
                'action_id' => 'A-04',
                'description' => 'Schedule PHP Boot Camp sessions',
                'source' => 'Wave KT',
                'priority' => 'Medium',
                'due_date' => '2026-04-06',
                'status' => 'Open',
                'closure_criteria' => '',
                'notes' => 'Rooms booked',
                'workstream' => 'Wave',
            ],
        ];

        foreach ($actions as $data) {
            $wsName = $data['workstream'];
            unset($data['workstream']);

            $ws = Workstream::where('name', $wsName)->first();
            $data['workstream_id'] = $ws?->id;

            Action::create($data);
        }
    }
}
