<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\Dependency;
use App\Models\KtSession;
use App\Models\TransformationItem;
use App\Models\Workstream;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $items = TransformationItem::all();
        $actions = Action::all();
        $dependencies = Dependency::with('workstreams')->get();
        $ktSessions = KtSession::all();

        $totalInitiatives = $items->count();
        $greenCount = $items->where('rag', 'Green')->count();
        $amberCount = $items->where('rag', 'Amber')->count();
        $redCount = $items->where('rag', 'Red')->count();
        $completedCount = $items->where('status', 'Completed')->count();

        $statusBreakdown = [
            'Not Started' => $items->where('status', 'Not Started')->count(),
            'In Progress' => $items->where('status', 'In Progress')->count(),
            'Completed' => $completedCount,
            'Blocked' => $items->where('status', 'Blocked')->count(),
        ];

        $ragByWorkstream = Workstream::with(['initiatives.transformationItems'])->get()->map(function ($ws) {
            $allItems = $ws->initiatives->flatMap->transformationItems;

            return [
                'workstream' => $ws->name,
                'green' => $allItems->where('rag', 'Green')->count(),
                'amber' => $allItems->where('rag', 'Amber')->count(),
                'red' => $allItems->where('rag', 'Red')->count(),
                'total' => $allItems->count(),
            ];
        });

        $openActions = $actions->where('status', '!=', 'Closed')->count();
        $overdueActions = $actions->filter(fn ($a) => $a->isOverdue())->values()->map(fn ($a) => [
            'id' => $a->id,
            'action_id' => $a->action_id,
            'description' => $a->description,
            'owner_id' => $a->owner_id,
            'due_date' => $a->due_date?->toDateString(),
            'status' => $a->status,
        ]);

        $highRiskDeps = $dependencies->where('risk', 'High')
            ->where('status', '!=', 'Resolved')
            ->values()
            ->map(fn ($d) => [
                'id' => $d->id,
                'dependency_id' => $d->dependency_id,
                'description' => $d->description,
                'risk' => $d->risk,
                'status' => $d->status,
                'workstreams' => $d->workstreams->pluck('name'),
            ]);

        $ktProgress = [
            'total' => $ktSessions->count(),
            'planned' => $ktSessions->where('current_stage', 'Planned')->count(),
            'in_progress' => $ktSessions->where('current_stage', 'In Progress')->count(),
            'completed' => $ktSessions->where('current_stage', 'Completed')->count(),
        ];

        return response()->json([
            'total_initiatives' => $totalInitiatives,
            'rag' => [
                'green' => $greenCount,
                'amber' => $amberCount,
                'red' => $redCount,
            ],
            'completed' => $completedCount,
            'status_breakdown' => $statusBreakdown,
            'rag_by_workstream' => $ragByWorkstream,
            'actions' => [
                'total' => $actions->count(),
                'open' => $openActions,
                'overdue' => $overdueActions,
            ],
            'high_risk_dependencies' => $highRiskDeps,
            'dependencies_count' => $dependencies->count(),
            'kt_progress' => $ktProgress,
        ]);
    }
}
