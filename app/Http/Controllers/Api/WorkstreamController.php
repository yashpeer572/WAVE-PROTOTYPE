<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workstream;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkstreamController extends Controller
{
    public function index(): JsonResponse
    {
        $workstreams = Workstream::with(['owner', 'initiatives'])
            ->withCount(['initiatives', 'actions', 'ktSessions'])
            ->get();

        return response()->json($workstreams);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|unique:workstreams,name',
            'description' => 'nullable|string',
            'rag_status' => 'nullable|in:Green,Amber,Red',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $workstream = Workstream::create($data);

        return response()->json($workstream->load('owner'), 201);
    }

    public function show(Workstream $workstream): JsonResponse
    {
        return response()->json(
            $workstream->load(['owner', 'initiatives.transformationItems', 'members', 'milestones'])
        );
    }

    public function update(Request $request, Workstream $workstream): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|unique:workstreams,name,' . $workstream->id,
            'description' => 'nullable|string',
            'rag_status' => 'nullable|in:Green,Amber,Red',
            'owner_id' => 'nullable|exists:users,id',
        ]);

        $workstream->update($data);

        return response()->json($workstream->fresh('owner'));
    }

    public function destroy(Workstream $workstream): JsonResponse
    {
        $workstream->delete();

        return response()->json(['message' => 'Workstream deleted']);
    }

    public function initiatives(Workstream $workstream): JsonResponse
    {
        return response()->json(
            $workstream->initiatives()->with('transformationItems')->get()
        );
    }
}
