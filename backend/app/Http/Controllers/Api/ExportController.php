<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\Dependency;
use App\Models\KtSession;
use App\Models\TransformationItem;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function export(Request $request, string $type): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$type}_export.csv",
        ];

        return response()->stream(function () use ($type) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            match ($type) {
                'transformation' => $this->exportTransformation($handle),
                'dependencies' => $this->exportDependencies($handle),
                'actions' => $this->exportActions($handle),
                'kt_sessions' => $this->exportKtSessions($handle),
                default => fputcsv($handle, ['Invalid export type']),
            };

            fclose($handle);
        }, 200, $headers);
    }

    private function exportTransformation($handle): void
    {
        fputcsv($handle, ['Workstream', 'Initiative', 'Objective', 'Owner', 'Start Date', 'End Date', 'Status', 'RAG', 'Success Metrics', 'Risks']);

        TransformationItem::with(['initiative.workstream', 'owner'])->chunk(100, function ($items) use ($handle) {
            foreach ($items as $item) {
                $ownerLabel = $item->owner?->name
                    ?? ($item->owner_org === 'Peer'
                        ? ($item->peer_contact ?: $item->five_flow_contact)
                        : ($item->five_flow_contact ?: $item->peer_contact))
                    ?? '';
                fputcsv($handle, [
                    $item->initiative->workstream->name ?? '',
                    $item->initiative->name ?? '',
                    $item->objective,
                    $ownerLabel,
                    $item->start_date?->toDateString(),
                    $item->end_date?->toDateString(),
                    $item->status,
                    $item->rag,
                    $item->success_metrics,
                    $item->risks,
                ]);
            }
        });
    }

    private function exportDependencies($handle): void
    {
        fputcsv($handle, ['Dependency ID', 'Description', 'Type', 'Dependent On', 'Target Date', 'Status', 'Risk', 'Mitigation', 'Escalation']);

        Dependency::all()->each(function ($dep) use ($handle) {
            fputcsv($handle, [
                $dep->dependency_id,
                $dep->description,
                $dep->type,
                $dep->dependent_on,
                $dep->target_date?->toDateString(),
                $dep->status,
                $dep->risk,
                $dep->mitigation,
                $dep->escalation,
            ]);
        });
    }

    private function exportActions($handle): void
    {
        fputcsv($handle, ['Action ID', 'Description', 'Source', 'Priority', 'Due Date', 'Status', 'Closure Criteria', 'Notes']);

        Action::all()->each(function ($action) use ($handle) {
            fputcsv($handle, [
                $action->action_id,
                $action->description,
                $action->source,
                $action->priority,
                $action->due_date?->toDateString(),
                $action->status,
                $action->closure_criteria,
                $action->notes,
            ]);
        });
    }

    private function exportKtSessions($handle): void
    {
        fputcsv($handle, ['Workstream', 'Product/Platform', 'KT Scope', 'SME', 'Receiving Team', 'Start Date', 'End Date', 'Stage', 'Status']);

        KtSession::with('workstream')->get()->each(function ($kt) use ($handle) {
            fputcsv($handle, [
                $kt->workstream->name ?? '',
                $kt->product_platform,
                $kt->kt_scope,
                $kt->sme,
                $kt->receiving_team,
                $kt->start_date?->toDateString(),
                $kt->end_date?->toDateString(),
                $kt->current_stage,
                $kt->overall_status,
            ]);
        });
    }
}
