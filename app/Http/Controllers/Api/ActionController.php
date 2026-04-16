<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ActionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Action::with(['owner', 'workstream']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->has('owner_id')) {
            $query->where('owner_id', $request->owner_id);
        }
        if ($request->has('workstream_id')) {
            $query->where('workstream_id', $request->workstream_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'action_id' => 'required|string|unique:actions,action_id',
            'description' => 'nullable|string',
            'source' => 'nullable|string',
            'owner_id' => 'nullable|exists:users,id',
            'priority' => 'required|in:Low,Medium,High',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:Open,In Progress,Closed',
            'closure_criteria' => 'nullable|string',
            'notes' => 'nullable|string',
            'workstream_id' => 'nullable|exists:workstreams,id',
        ]);

        $action = Action::create($data);

        return response()->json($action->load(['owner', 'workstream']), 201);
    }

    public function show(Action $action): JsonResponse
    {
        return response()->json($action->load(['owner', 'workstream']));
    }

    public function update(Request $request, Action $action): JsonResponse
    {
        $data = $request->validate([
            'description' => 'nullable|string',
            'source' => 'nullable|string',
            'owner_id' => 'nullable|exists:users,id',
            'priority' => 'sometimes|in:Low,Medium,High',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|in:Open,In Progress,Closed',
            'closure_criteria' => 'nullable|string',
            'notes' => 'nullable|string',
            'workstream_id' => 'nullable|exists:workstreams,id',
        ]);

        if (isset($data['status']) && $data['status'] === 'Closed') {
            $closureCriteria = $data['closure_criteria'] ?? $action->closure_criteria;
            if (empty($closureCriteria)) {
                throw ValidationException::withMessages([
                    'closure_criteria' => ['Closure criteria is required when closing an action.'],
                ]);
            }
        }

        $allowedTransitions = [
            'Open' => ['Open', 'In Progress'],
            'In Progress' => ['In Progress', 'Closed'],
            'Closed' => ['Closed'],
        ];

        if (isset($data['status'])) {
            $currentStatus = $action->status;
            $newStatus = $data['status'];
            $user = $request->user();

            if (! in_array($newStatus, $allowedTransitions[$currentStatus] ?? []) && ! $user->isAdmin()) {
                throw ValidationException::withMessages([
                    'status' => ["Cannot transition from {$currentStatus} to {$newStatus}."],
                ]);
            }
        }

        $action->update($data);

        return response()->json($action->fresh(['owner', 'workstream']));
    }

    public function destroy(Action $action): JsonResponse
    {
        $action->delete();

        return response()->json(['message' => 'Action deleted']);
    }

    public function nextId(): JsonResponse
    {
        $last = Action::orderByRaw("CAST(SUBSTRING(action_id, 3) AS UNSIGNED) DESC")->first();
        $nextNum = $last ? ((int) substr($last->action_id, 2)) + 1 : 1;

        return response()->json(['next_id' => 'A-' . str_pad($nextNum, 2, '0', STR_PAD_LEFT)]);
    }
}
