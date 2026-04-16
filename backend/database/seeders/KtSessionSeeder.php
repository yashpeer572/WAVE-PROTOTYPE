<?php

namespace Database\Seeders;

use App\Models\KtSession;
use App\Models\Workstream;
use Illuminate\Database\Seeder;

class KtSessionSeeder extends Seeder
{
    public function run(): void
    {
        $sessions = [
            ['Wave', 'HubX', 'Functional and Technical Overview', 'Muthu / Anish', 'Muthu', '5Flow Team', '2026-04-07', '2026-04-08', 'Planned', 'Not Started'],
            ['Wave', 'Wave 2', 'Code Insights and Product Demo', 'Satish/Murugesan', 'Satish', 'Peer Team', '2026-04-07', '2026-04-10', 'Planned', 'Not Started'],
            ['Wave', 'Wave 3', 'Code Insights and Product Demo', 'Satish/Murugesan', 'Satish', 'Peer Team', '2026-04-13', '2026-04-17', 'Planned', 'Not Started'],
            ['MediaBox', 'MediaBox', 'Full KT', 'Murugesan', 'Murugesan', 'Peer Team', null, null, 'Planned', 'Not Started'],
            ['DragonFly', 'DragonFly', 'Full KT', 'Murugesan', 'Murugesan', 'Peer Team', null, null, 'Planned', 'Not Started'],
        ];

        foreach ($sessions as [$wsName, $product, $scope, $owner, $sme, $team, $start, $end, $stage, $status]) {
            $ws = Workstream::where('name', $wsName)->first();

            KtSession::create([
                'workstream_id' => $ws->id,
                'product_platform' => $product,
                'kt_scope' => $scope,
                'sme' => $sme,
                'receiving_team' => $team,
                'start_date' => $start,
                'end_date' => $end,
                'current_stage' => $stage,
                'overall_status' => $status,
            ]);
        }
    }
}
