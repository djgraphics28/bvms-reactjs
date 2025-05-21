<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TwoFactorMiddleware
{
    /**
     * Handle an incoming request.
     * Check if user has 2FA enabled and verified.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user && $user->two_factor_enabled) {
            // Check if the user has passed 2FA verification in this session
            if (!$request->session()->get('two_factor_passed', false)) {
                // Redirect to 2FA verification page
                return redirect()->route('2fa.verify');
            }
        }

        return $next($request);
    }
}
