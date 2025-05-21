<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    public function show()
    {
        return Inertia::render('auth/verify-2fa', [
            'user' => Auth::user(),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'two_factor_code' => 'required|string',
        ]);

        $user = Auth::user();

        if (
            $user->two_factor_code === $request->two_factor_code
        ) {
            $user->resetTwoFactorCode();

            $request->session()->put('two_factor_passed', true);

            return redirect()->intended('/dashboard');
        }

        return back()->withErrors(['two_factor_code' => 'The code is invalid or expired.']);
    }
}
