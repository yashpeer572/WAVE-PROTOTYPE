<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KtSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KtSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = KtSession::with(['workstream', 'ktOwner', 'participants']);

        if ($request->has('workstream_id')) {
            $query->where('workstream_id', $request->workstream_id);
        }
        if ($request->has('current_stage')) {
            $query->where('current_stage', $request->current_stage);
        }
        if ($request->has('kt_owner_id')) {
            $query->where('kt_owner_id', $request->kt_owner_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'workstream_id' => 'required|exists:workstreams,id',
            'product_platform' => 'nullable|string',
            'kt_scope' => 'nullable|string',
            'kt_owner_id' => 'nullable|exists:users,id',
            'sme' => 'nullable|string',
            'receiving_team' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'current_stage' => 'nullable|in:Planned,In Progress,Completed',
            'overall_status' => 'nullable|string',
            'meet_link' => 'nullable|url',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $participantIds = $data['participant_ids'] ?? [];
        unset($data['participant_ids']);

        $session = KtSession::create($data);

        if (! empty($participantIds)) {
            foreach ($participantIds as $pid) {
                $session->participants()->attach($pid, ['participant_role' => 'Attendee']);
            }
        }

        return response()->json($session->load(['workstream', 'ktOwner', 'participants']), 201);
    }

    public function show(KtSession $ktSession): JsonResponse
    {
        return response()->json(
            $ktSession->load(['workstream', 'ktOwner', 'participants'])
        );
    }

    public function update(Request $request, KtSession $ktSession): JsonResponse
    {
        $data = $request->validate([
            'workstream_id' => 'sometimes|exists:workstreams,id',
            'product_platform' => 'nullable|string',
            'kt_scope' => 'nullable|string',
            'kt_owner_id' => 'nullable|exists:users,id',
            'sme' => 'nullable|string',
            'receiving_team' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'current_stage' => 'sometimes|in:Planned,In Progress,Completed',
            'overall_status' => 'nullable|string',
            'meet_link' => 'nullable|url',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        if (isset($data['participant_ids'])) {
            $syncData = [];
            foreach ($data['participant_ids'] as $pid) {
                $syncData[$pid] = ['participant_role' => 'Attendee'];
            }
            $ktSession->participants()->sync($syncData);
            unset($data['participant_ids']);
        }

        $ktSession->update($data);

        return response()->json($ktSession->fresh(['workstream', 'ktOwner', 'participants']));
    }

    public function destroy(KtSession $ktSession): JsonResponse
    {
        $ktSession->delete();

        return response()->json(['message' => 'KT session deleted']);
    }
}
