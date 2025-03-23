<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPage = request('per_page', 10);
        $users = User::paginate($perPage);

        return response()->json(['users' => $users]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        $userData = $request->validated();
        $userData['updated_by'] = $request->user()->id;

        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');

            // Save new image in the 'public' disk
            $relativePath = $this->saveImage($image);
            $userData['profile_image'] = asset('storage/' . str_replace('public/', '', $relativePath));


            // Delete old image if it exists
            if ($user->profile_image) {
                $oldImagePath = str_replace(Storage::url(''), '', $user->profile_image);
                Storage::disk('public')->delete($oldImagePath);
            }
        }

        $user->update($userData);

        return new UserResource($user);
    }

    private function saveImage(\Illuminate\Http\UploadedFile $image)
    {
        $path = 'images/' . Str::random();

        // Store the image in the 'public' disk
        $filePath = Storage::disk('public')->putFileAs($path, $image, $image->getClientOriginalName());

        return $filePath; // This returns 'images/randomString/image.jpg'
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }
}
