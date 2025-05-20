<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CommentResource;

class CommentController extends Controller
{
    public function index(Task $task)
    {

        $comments = Comment::where('task_id', $task->id)
            ->with(['user'])
            ->get();

        return CommentResource::collection($comments);
    }

    public function store(Request $request, Task $task)
    {
        $request->validate([
            'content' => 'required|string|max:255',
        ]);

        $comment = Comment::create([
            'task_id' => $task->id,
            'created_by' => Auth::user()->id,
            'updated_by' => Auth::user()->id,
            'content' => $request->content,
        ]);

        return response()->json(['comment' => new CommentResource($comment)]);
    }
}
