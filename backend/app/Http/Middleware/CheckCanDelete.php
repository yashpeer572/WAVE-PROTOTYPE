<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCanDelete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->canDelete()) {
            return response()->json([
                'message' => 'Only Program Managers can delete records.',
            ], 403);
        }

        return $next($request);
    }
}
