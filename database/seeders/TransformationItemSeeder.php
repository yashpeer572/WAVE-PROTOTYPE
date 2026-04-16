<?php

namespace Database\Seeders;

use App\Models\Initiative;
use App\Models\TransformationItem;
use App\Models\Workstream;
use Illuminate\Database\Seeder;

class TransformationItemSeeder extends Seeder
{
    public function run(): void
    {
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
            ['5Flow AI Studio','Deployment','Pre-requisites - Readiness','Peer','Kishore','Sriram','2026-03-23','2026-03-27','Completed','Red'],
            ['5Flow AI Studio','Deployment','Introduction Session to Pilot users','Peer','','Subbiah','2026-03-30','2026-03-30','Completed','Green'],
            ['5Flow AI Studio','Deployment','Studio Rollout for Pilot users (Code Insight and Spec agents)','Peer','','Sriram','2026-04-01','2026-04-06','',''],
            ['5Flow AI Studio','Deployment','Support and Clarification session','Peer','','Subbiah','2026-04-06','2026-04-10','',''],
            ['5Flow AI Studio','Deployment','Workshop on Pilot Usecases','Peer','','Sriram','2026-04-06','2026-04-10','',''],
            ['5Flow AI Studio','Deployment','Pilot Period','Peer','','Subbiah','2026-04-01','2026-04-24','',''],
            ['5Flow AI Studio','Deployment','Pilot feedback','Peer','','Sriram','2026-04-13','2026-04-17','',''],
            ['5Flow AI Studio','Deployment','Introduction Session to Users','Peer','','Subbiah','2026-04-24','2026-04-24','',''],
            ['5Flow AI Studio','Deployment','Phase 1 Rollout (Beyond pilot users)','Peer','','Sriram','2026-04-27','2026-04-27','',''],
            ['5Flow AI Studio','Deployment','Release of Product, Ask AI and UI Copilot agents','Peer','','Subbiah','2026-05-11','2026-05-11','',''],
            ['5Flow AI Studio','Deployment','Release of ADR, Coder','Peer','','Subbiah','2026-06-08','2026-06-08','',''],
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
            ['Wave','KT','Propelis business overview (Video)','Peer','','Satish','2026-04-06','2026-04-07','',''],
            ['Wave','KT','PHP Boot Camp','Peer','','Satish','2026-04-06','2026-04-10','',''],
            ['Wave','KT','Peer AI - New Ways of Working - Hands on Sessions','Peer','','Mathangi','','','',''],
            ['Wave','KT','HubX Functional and Technical Overview','5Flow','','Muthu / Anish','2026-04-07','2026-04-08','',''],
            ['Wave','KT','Code Insights for Wave 2','Peer','','Satish/Murugesan','2026-04-07','2026-04-10','',''],
            ['Wave','KT','Code Insights for Wave 3','Peer','','Satish/Murugesan','2026-04-13','2026-04-17','',''],
            ['Wave','KT','Peer AI Studio / 5Flow Studio Setup & Proficiency','Peer','','Murugesan','2026-04-08','2026-04-10','',''],
            ['Wave','KT','Wave 2 - Product Demo','5Flow','','Jagan','2026-04-06','2026-04-10','',''],
            ['Wave','KT','Wave 3 - Product Demo','5Flow','','Jagan','','','',''],
            ['Wave','KT','Wave Client Configurations','5Flow','','Jagan','2026-04-07','2026-04-10','',''],
            ['Wave','KT','Wave - SDLC Process (Sprint Management, Review Steps)','5Flow','','Jagan','2026-04-07','2026-04-10','',''],
            ['Wave','KT','Wave - Solution Consultant - Process','5Flow','','Jagan','2026-04-07','2026-04-10','',''],
            ['Wave','KT','Wave - Support Model - KT','5Flow','','Jagan','2026-04-07','2026-04-10','',''],
            ['Wave','KT','R&R for the Team','Peer','','Satish','','','',''],
            ['MediaBox','KT','MediaBox KT','Peer','','Murugesan','','','',''],
            ['DragonFly','KT','DragonFly KT','Peer','','Murugesan','','','',''],
            ['Resource','Onboarding','Identifying resources, allocation on Runn','Peer','','Satish/Retheesh','2026-04-06','2026-04-10','',''],
            ['Resource','Onboarding','Propelis Onboarding','Peer','','Satish/Retheesh','2026-04-06','2026-04-10','',''],
            ['Resource','Onboarding','Code Base Access / Setup','Peer','','Murugesan','2026-04-06','2026-04-10','',''],
            ['Resource','Onboarding','Cloud Access / Devops','Peer','','Murugesan','2026-04-06','2026-04-10','',''],
        ];

        $wsCache = [];
        $initCache = [];

        foreach ($rows as $row) {
            [$wsName, $initName, $objective, $ownerOrg, $fiveFlow, $peer, $start, $end, $status, $rag] = $row;

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
