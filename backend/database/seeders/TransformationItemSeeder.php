<?php

namespace Database\Seeders;

use App\Models\Initiative;
use App\Models\TransformationItem;
use App\Models\Workstream;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransformationItemSeeder extends Seeder
{
    public function run(): void
    {
        $t = Carbon::today();

        $rows = [
            ['Governance','Reporting','Board and Executive updates - every 2 weeks (Updates shared on email)','Peer','','Jagan','','','',''],
            ['Governance','Info Gathering','Block calendars for interim and final reviews','5Flow','','Jagan','','','',''],
            ['Governance','Operating Model','Setup the operating model','5Flow','','Jagan','','','',''],
            ['Contracts and Financial','SOW','Engaging Legal Core Team','5Flow','','Sriram','','','',''],
            ['Contracts and Financial','SOW','Create legal / compliance checklist','5Flow','','Jagan','','','',''],
            ['Contracts and Financial','SOW','Legal review of people plan','5Flow','Vijai','Jagan','','','',''],
            ['Contracts and Financial','SOW','Heads up to Legal on SOW review starting from March 16','5Flow','Vijai','Jagan','','','',''],
            ['Contracts and Financial','SOW','Draft Contract, SoW','Peer','Vijai','Jagan','','','',''],
            ['Contracts and Financial','SOW','Refine financial structure - Pricing and terms','Peer','Vijai','Jagan','','','',''],
            ['Contracts and Financial','SOW','Review Contract / SOW','5Flow','','Jagan','','','',''],
            ['Contracts and Financial','SOW','Finalize Pricing and Financials','Peer','Sriram','Rajesh','','','',''],
            ['Contracts and Financial','SOW','Submit SOW for Legal review','Peer','Vijai','Jagan','','','',''],
            ['Contracts and Financial','SOW','Legal review of SOW (Including Iterations)','5Flow','','Jagan','','','',''],
            ['Contracts and Financial','SOW','Final SOW','Peer','Vijai','Jagan','','','',''],
            ['5Flow AI Studio','Deployment','Pre-requisites - Readiness','Peer','Kishore','Sriram',$t->copy()->subWeeks(5)->toDateString(),$t->copy()->subWeeks(4)->addDays(2)->toDateString(),'Completed','Red'],
            ['5Flow AI Studio','Deployment','Introduction Session to Pilot users','Peer','','Subbiah',$t->copy()->subWeeks(4)->toDateString(),$t->copy()->subWeeks(4)->addDay()->toDateString(),'Completed','Green'],
            ['5Flow AI Studio','Deployment','Studio Rollout for Pilot users (Code Insight and Spec agents)','Peer','','Sriram',$t->copy()->subDays(18)->toDateString(),$t->copy()->addDays(4)->toDateString(),'In Progress','Amber'],
            ['5Flow AI Studio','Deployment','Support and Clarification session','Peer','','Subbiah',$t->copy()->subDays(12)->toDateString(),$t->copy()->addDays(2)->addDays(5)->toDateString(),'In Progress',''],
            ['5Flow AI Studio','Deployment','Workshop on Pilot Usecases','Peer','','Sriram',$t->copy()->subDays(10)->toDateString(),$t->copy()->addDays(1)->addDays(6)->toDateString(),'Not Started',''],
            ['5Flow AI Studio','Deployment','Pilot Period','Peer','','Subbiah',$t->copy()->subDays(20)->toDateString(),$t->copy()->addDays(10)->addDays(4)->toDateString(),'In Progress',''],
            ['5Flow AI Studio','Deployment','Pilot feedback','Peer','','Sriram',$t->copy()->subDays(8)->toDateString(),$t->copy()->subDays(1)->toDateString(),'In Progress',''],
            ['5Flow AI Studio','Deployment','Introduction Session to Users','Peer','','Subbiah',$t->copy()->subDays(6)->toDateString(),$t->copy()->addDays(3)->toDateString(),'Not Started',''],
            ['5Flow AI Studio','Deployment','Phase 1 Rollout (Beyond pilot users)','Peer','','Sriram',$t->copy()->subDays(14)->toDateString(),$t->copy()->addDays(7)->addDays(2)->toDateString(),'In Progress',''],
            ['5Flow AI Studio','Deployment','Release of Product, Ask AI and UI Copilot agents','Peer','','Subbiah',$t->copy()->addDays(5)->toDateString(),$t->copy()->addWeeks(3)->addDays(4)->toDateString(),'Not Started',''],
            ['5Flow AI Studio','Deployment','Release of ADR, Coder','Peer','','Subbiah',$t->copy()->addWeeks(2)->toDateString(),$t->copy()->addWeeks(10)->addDays(3)->toDateString(),'Not Started',''],
            ['5Flow AI Studio','Deployment','Release of Testing and OPS related agent','Peer','','Subbiah','','','',''],
            ['5Flow AI Studio','Deployment','Release of Agent Development environment and Orchestration','Peer','','Subbiah','','','',''],
            ['New Ways of Working','Enablement','Training and Certification on Spec Driven Development and New ways','Peer','','Mathangi','','','',''],
            ['TMO','Onboarding','Identify core team members, key Product Leadership and set up TMO','Peer','Vijai','Jagan','','','',''],
            ['TMO','Onboarding','Onboard key people into the TMO - 5Flow','5Flow','Vijai','Jagan','','','',''],
            ['TMO','Onboarding','Onboard key people into the TMO - Peer','Peer','Vijai','Jagan','','','',''],
            ['TMO','Governance','Target Operating Model - Refined and Updated','Peer','Vijai','Jagan','','','',''],
            ['TMO','Governance','Set-up governance model - communication, tracking, risk management','Peer','Vijai','Jagan','','','',''],
            ['TMO','Governance','Transformation Pillar (Right Shoring) : Review, Socialize with Key Members','5Flow','Vijai','Jagan','','','',''],
            ['TMO','Governance','Transformation Pillar (Role Redundancy) : Review, Socialize','5Flow','Vijai','Jagan','','','',''],
            ['TMO','Execution','Build the first 30, 60, 90 day post signing execution plan','Peer','Vijai','Jagan','','','',''],
            ['Wave','KT','Propelis business overview (Video)','Peer','','Satish',$t->copy()->subDays(16)->toDateString(),$t->copy()->subDays(9)->addDay()->toDateString(),'In Progress',''],
            ['Wave','KT','PHP Boot Camp','Peer','','Satish',$t->copy()->subDays(14)->toDateString(),$t->copy()->addDays(2)->toDateString(),'In Progress',''],
            ['Wave','KT','Peer AI - New Ways of Working - Hands on Sessions','Peer','','Mathangi','','','',''],
            ['Wave','KT','HubX Functional and Technical Overview','5Flow','','Muthu / Anish',$t->copy()->subDays(11)->toDateString(),$t->copy()->subDays(6)->addDay()->toDateString(),'In Progress',''],
            ['Wave','KT','Code Insights for Wave 2','Peer','','Satish/Murugesan',$t->copy()->subDays(9)->toDateString(),$t->copy()->addDays(1)->addDays(4)->toDateString(),'In Progress',''],
            ['Wave','KT','Code Insights for Wave 3','Peer','','Satish/Murugesan',$t->copy()->subDays(5)->toDateString(),$t->copy()->addDays(6)->toDateString(),'Not Started',''],
            ['Wave','KT','Peer AI Studio / 5Flow Studio Setup & Proficiency','Peer','','Murugesan',$t->copy()->subDays(8)->toDateString(),$t->copy()->subDay()->addDays(5)->toDateString(),'In Progress',''],
            ['Wave','KT','Wave 2 - Product Demo','5Flow','','Jagan',$t->copy()->subDays(12)->toDateString(),$t->copy()->addDays(3)->toDateString(),'In Progress',''],
            ['Wave','KT','Wave 3 - Product Demo','5Flow','','Jagan','','','',''],
            ['Wave','KT','Wave Client Configurations','5Flow','','Jagan',$t->copy()->subDays(7)->toDateString(),$t->copy()->addDays(5)->addDays(2)->toDateString(),'Not Started',''],
            ['Wave','KT','Wave - SDLC Process (Sprint Management, Review Steps)','5Flow','','Jagan',$t->copy()->subDays(6)->toDateString(),$t->copy()->addDays(4)->addDays(3)->toDateString(),'In Progress',''],
            ['Wave','KT','Wave - Solution Consultant - Process','5Flow','','Jagan',$t->copy()->subDays(5)->toDateString(),$t->copy()->addWeek()->toDateString(),'In Progress',''],
            ['Wave','KT','Wave - Support Model - KT','5Flow','','Jagan',$t->copy()->subDays(4)->toDateString(),$t->copy()->addDays(8)->toDateString(),'Not Started',''],
            ['Wave','KT','R&R for the Team','Peer','','Satish','','','',''],
            ['MediaBox','KT','MediaBox KT','Peer','','Murugesan','','','',''],
            ['DragonFly','KT','DragonFly KT','Peer','','Murugesan','','','',''],
            ['Resource','Onboarding','Identifying resources, allocation on Runn','Peer','','Satish/Retheesh',$t->copy()->subDays(13)->toDateString(),$t->copy()->addDays(2)->toDateString(),'In Progress',''],
            ['Resource','Onboarding','Propelis Onboarding','Peer','','Satish/Retheesh',$t->copy()->subDays(11)->toDateString(),$t->copy()->addDays(4)->addDay()->toDateString(),'In Progress',''],
            ['Resource','Onboarding','Code Base Access / Setup','Peer','','Murugesan',$t->copy()->subDays(9)->toDateString(),$t->copy()->addDays(6)->toDateString(),'Not Started',''],
            ['Resource','Onboarding','Cloud Access / Devops','Peer','','Murugesan',$t->copy()->subDays(8)->toDateString(),$t->copy()->addWeek()->addDays(2)->toDateString(),'In Progress',''],
        ];

        $wsCache = [];
        $initCache = [];

        foreach ($rows as $index => $row) {
            [$wsName, $initName, $objective, $ownerOrg, $fiveFlow, $peer, $start, $end, $status, $rag] = $row;

            if ($start === '' && $end === '') {
                $sOff = 8 + ($index % 17);
                $span = 6 + ($index % 9);
                $delay = ($index % 4);
                $start = $t->copy()->subDays($sOff)->toDateString();
                $end = $t->copy()->subDays($sOff)->addDays($span + $delay)->toDateString();
            } elseif ($start !== '' && $end === '') {
                $end = Carbon::parse($start)->addDays(5 + ($index % 8) + ($index % 3))->toDateString();
            } elseif ($start === '' && $end !== '') {
                $start = Carbon::parse($end)->subDays(7 + ($index % 6))->toDateString();
            }

            if (!isset($wsCache[$wsName])) {
                $wsCache[$wsName] = Workstream::where('name', $wsName)->first()->id;
            }

            $cacheKey = $wsName . '|' . $initName;
            if (!isset($initCache[$cacheKey])) {
                $initCache[$cacheKey] = Initiative::where('workstream_id', $wsCache[$wsName])
                    ->where('name', $initName)
                    ->first()->id;
            }

            TransformationItem::create([
                'initiative_id' => $initCache[$cacheKey],
                'objective' => $objective,
                'owner_org' => $ownerOrg ?: 'Peer',
                'five_flow_contact' => $fiveFlow ?: null,
                'peer_contact' => $peer ?: null,
                'start_date' => $start ?: null,
                'end_date' => $end ?: null,
                'status' => $status ?: 'Not Started',
                'rag' => $rag ?: null,
            ]);
        }
    }
}
