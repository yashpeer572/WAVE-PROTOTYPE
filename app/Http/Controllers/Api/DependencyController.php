<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dependency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DependencyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dependency::with(['owner', 'workstreams']);

        if ($request->has('risk')) {
            $query->where('risk', $request->risk);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'dependency_id' => 'required|string|unique:dependencies,dependency_id',
            'description' => 'nullable|string',
            'type' => 'required|in:Technical,Access,Resource,Process',
            'owner_id' => 'nullable|exists:users,id',
            'dependent_on' => 'nullable|string',
            'target_date' => 'nullable|date',
            'status' => 'nullable|in:Open,In Progress,Resolved,Blocked',
            'risk' => 'required|in:Low,Medium,High',
            'mitigation' => 'nullable|string',
            'escalation' => 'nullable|string',
            'workstream_ids' => 'nullable|array',
            'workstream_ids.*' => 'exists:workstreams,id',
        ]);

        $wsIds = $data['workstream_ids'] ?? [];
        unset($data['workstream_ids']);

        $dep = Dependency::create($data);

        if (! empty($wsIds)) {
            $dep->workstreams()->attach($wsIds);
        }

        return response()->json($dep->load(['owner', 'workstreams']), 201);
    }

    public function show(Dependency $dependency): JsonResponse
    {
        return response()->json(
            $dependency->load(['owner', 'workstreams', 'transformationItems'])
        );
    }

    public function update(Request $request, Dependency $dependency): JsonResponse
    {
        $data = $request->validate([
            'description' => 'nullable|string',
            'type' => 'sometimes|in:Technical,Access,Resource,Process',
            'owner_id' => 'nullable|exists:users,id',
            'dependent_on' => 'nullable|string',
            'target_date' => 'nullable|date',
            'status' => 'nullable|in:Open,In Progress,Resolved,Blocked',
            'risk' => 'sometimes|in:Low,Medium,High',
            'mitigation' => 'nullable|string',
            'escalation' => 'nullable|string',
            'workstream_ids' => 'nullable|array',
            'workstream_ids.*' => 'exists:workstreams,id',
        ]);

        if (isset($data['workstream_ids'])) {
            $dependency->workstreams()->sync($data['workstream_ids']);
            unset($data['workstream_ids']);
        }

        $dependency->update($data);

        return response()->json($dependency->fresh(['owner', 'workstreams']));
    }

    public function destroy(Dependency $dependency): JsonResponse
    {
        $dependency->delete();

        return response()->json(['message' => 'Dependency deleted']);
    }

    public function nextId(): JsonResponse
    {
        $last = Dependency::orderByRaw("CAST(SUBSTRING(dependency_id, 3) AS UNSIGNED) DESC")->first();
        $nextNum = $last ? ((int) substr($last->dependency_id, 2)) + 1 : 1;

        return response()->json(['next_id' => 'D-' . str_pad($nextNum, 2, '0', STR_PAD_LEFT)]);
    }
}
