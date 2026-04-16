<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransformationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransformationItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TransformationItem::with(['initiative.workstream', 'owner']);

        if ($request->has('workstream_id')) {
            $query->whereHas('initiative', fn ($q) => $q->where('workstream_id', $request->workstream_id));
        }
        if ($request->has('initiative_id')) {
            $query->where('initiative_id', $request->initiative_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('rag')) {
            $query->where('rag', $request->rag);
        }
        if ($request->has('owner_org')) {
            $query->where('owner_org', $request->owner_org);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'initiative_id' => 'required|exists:initiatives,id',
            'objective' => 'nullable|string',
            'owner_id' => 'nullable|exists:users,id',
            'owner_org' => 'required|in:5Flow,Peer',
            'five_flow_contact' => 'nullable|string',
            'peer_contact' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:Not Started,In Progress,Completed,Blocked',
            'rag' => 'nullable|in:Green,Amber,Red',
            'success_metrics' => 'nullable|string',
            'risks' => 'nullable|string',
            'percent_complete' => 'nullable|integer|min:0|max:100',
        ]);

        $item = TransformationItem::create($data);

        return response()->json($item->load(['initiative.workstream', 'owner']), 201);
    }

    public function show(TransformationItem $transformationItem): JsonResponse
    {
        return response()->json(
            $transformationItem->load(['initiative.workstream', 'owner', 'dependencies'])
        );
    }

    public function update(Request $request, TransformationItem $transformationItem): JsonResponse
    {
        $data = $request->validate([
            'initiative_id' => 'sometimes|exists:initiatives,id',
            'objective' => 'nullable|string',
            'owner_id' => 'nullable|exists:users,id',
            'owner_org' => 'sometimes|in:5Flow,Peer',
            'five_flow_contact' => 'nullable|string',
            'peer_contact' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:Not Started,In Progress,Completed,Blocked',
            'rag' => 'nullable|in:Green,Amber,Red',
            'success_metrics' => 'nullable|string',
            'risks' => 'nullable|string',
            'percent_complete' => 'nullable|integer|min:0|max:100',
        ]);

        $transformationItem->update($data);

        return response()->json($transformationItem->fresh(['initiative.workstream', 'owner']));
    }

    public function updateStatus(Request $request, TransformationItem $transformationItem): JsonResponse
    {
        $data = $request->validate([
            'status' => 'sometimes|in:Not Started,In Progress,Completed,Blocked',
            'rag' => 'sometimes|nullable|in:Green,Amber,Red',
        ]);

        $transformationItem->update($data);

        return response()->json($transformationItem->fresh());
    }

    public function destroy(TransformationItem $transformationItem): JsonResponse
    {
        $transformationItem->delete();

        return response()->json(['message' => 'Transformation item deleted']);
    }
}
