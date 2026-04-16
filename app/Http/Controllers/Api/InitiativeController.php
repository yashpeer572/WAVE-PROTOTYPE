<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Initiative;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InitiativeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Initiative::with(['workstream', 'transformationItems']);

        if ($request->has('workstream_id')) {
            $query->where('workstream_id', $request->workstream_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'workstream_id' => 'required|exists:workstreams,id',
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $initiative = Initiative::create($data);

        return response()->json($initiative->load('workstream'), 201);
    }

    public function show(Initiative $initiative): JsonResponse
    {
        return response()->json(
            $initiative->load(['workstream', 'transformationItems.owner'])
        );
    }

    public function update(Request $request, Initiative $initiative): JsonResponse
    {
        $data = $request->validate([
            'workstream_id' => 'sometimes|exists:workstreams,id',
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
        ]);

        $initiative->update($data);

        return response()->json($initiative->fresh('workstream'));
    }

    public function destroy(Initiative $initiative): JsonResponse
    {
        $initiative->delete();

        return response()->json(['message' => 'Initiative deleted']);
    }
}
