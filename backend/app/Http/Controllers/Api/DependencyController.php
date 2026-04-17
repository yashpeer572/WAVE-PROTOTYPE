<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dependency;
use App\Models\Workstream;
use App\Models\Initiative;
use App\Models\TransformationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DependencyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dependency::with(['owner', 'workstreams', 'initiatives', 'transformationItems']);

        if ($request->has('risk')) {
            $query->where('risk', $request->risk);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $items = $query->get()->map(function ($dep) {
            $dep->other_links = DB::table('dependency_links')
                ->where('dependency_id', $dep->id)
                ->where('linkable_type', 'Other')
                ->get();
            return $dep;
        });

        return response()->json($items);
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
            'links' => 'nullable|array',
            'links.*.type' => 'required|in:Workstream,Initiative,Task,Other',
            'links.*.id' => 'required_if:links.*.type,Workstream,Initiative,Task',
            'links.*.metadata' => 'nullable|string',
        ]);

        $links = $data['links'] ?? [];
        unset($data['links']);

        return DB::transaction(function() use ($data, $links) {
            $dep = Dependency::create($data);
            $this->syncLinks($dep, $links);
            $dep->load(['owner', 'workstreams', 'initiatives', 'transformationItems']);
            $dep->other_links = DB::table('dependency_links')
                ->where('dependency_id', $dep->id)
                ->where('linkable_type', 'Other')
                ->get();
            return response()->json($dep, 201);
        });
    }

    public function show(Dependency $dependency): JsonResponse
    {
        return response()->json(
            $dependency->load(['owner', 'workstreams', 'initiatives', 'transformationItems'])
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
            'links' => 'nullable|array',
            'links.*.type' => 'required|in:Workstream,Initiative,Task,Other',
            'links.*.id' => 'required_if:links.*.type,Workstream,Initiative,Task',
            'links.*.metadata' => 'nullable|string',
        ]);

        $links = $data['links'] ?? null;
        unset($data['links']);

        return DB::transaction(function() use ($data, $links, $dependency) {
            $dependency->update($data);
            if ($links !== null) {
                $this->syncLinks($dependency, $links);
            }
            $dependency->refresh()->load(['owner', 'workstreams', 'initiatives', 'transformationItems']);
            $dependency->other_links = DB::table('dependency_links')
                ->where('dependency_id', $dependency->id)
                ->where('linkable_type', 'Other')
                ->get();
            return response()->json($dependency);
        });
    }

    private function syncLinks(Dependency $dependency, array $links): void
    {
        // Clear existing links
        DB::table('dependency_links')->where('dependency_id', $dependency->id)->delete();

        foreach ($links as $link) {
            $type = $link['type'];
            $id = $link['id'] ?? 0;
            $metadata = $link['metadata'] ?? null;

            $modelType = match($type) {
                'Workstream' => Workstream::class,
                'Initiative' => Initiative::class,
                'Task' => TransformationItem::class,
                'Other' => 'Other',
                default => null
            };

            if ($modelType) {
                DB::table('dependency_links')->insert([
                    'dependency_id' => $dependency->id,
                    'linkable_type' => $modelType,
                    'linkable_id' => $id,
                    'metadata' => $metadata,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
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
