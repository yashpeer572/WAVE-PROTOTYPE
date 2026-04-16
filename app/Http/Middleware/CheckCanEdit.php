<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCanEdit
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->canEdit()) {
            return response()->json([
                'message' => 'You do not have permission to edit.',
            ], 403);
        }

        return $next($request);
    }
}
