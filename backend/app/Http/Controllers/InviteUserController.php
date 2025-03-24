<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Str;
use App\Mail\InviteUserMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class InviteUserController extends Controller
{
    public function inviteUser(Request $request)
    {
        $request->validate(['email' => 'required|email|unique:users,email']);

        $token = Str::random(32);
        $frontendUrl = env('FRONTEND_URL');
        $inviteLink = $frontendUrl . '/register?token=' . $token . '&email=' . urlencode($request->email);

        // Save token to DB (optional)
        if (DB::table('user_invitations')->where('email', $request->email)->exists()) {
            DB::table('user_invitations')->where('email', $request->email)->delete();
        }

        DB::table('user_invitations')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        Mail::to($request->email)->send(new InviteUserMail($inviteLink));

        return response()->json(['message' => 'Invitation sent successfully']);
    }

    public function acceptInvite(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'token' => 'required|exists:user_invitations,token',
            'name' => 'required|string',
            'password' => 'required|min:8|confirmed',
        ]);

        // Find the invitation
        $invitation = DB::table('user_invitations')->where('token', $request->token)->first();

        if (!$invitation) {
            return response()->json(['message' => 'Invalid or expired token'], 400);
        }

        // Create the user with the invited email
        $user = User::create([
            'name' => $request->name,
            'email' => $invitation->email,
            'password' => Hash::make($request->password),
        ]);

        // Delete the used invitation
        DB::table('user_invitations')->where('token', $request->token)->delete();

        return response()->json(['message' => 'User registered successfully via invitation', 'user' => $user, "token" => $user->createToken('API Token')->plainTextToken]);
    }
}
