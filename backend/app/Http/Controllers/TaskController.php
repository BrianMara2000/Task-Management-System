<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Http\Requests\StoreTaskRequest;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\UpdateTaskRequest;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Project $project)
    {
        $per_page = $request->input('per_page', 10);
        $status = $request->input('status', '');
        $search = $request->input('search', '');

        $tasks = Task::query()->with(['project'])
            ->where('project_id', $project->id)
            ->when($status, fn($query) => $query->where('status', $status))
            ->when($search, fn($query) => $query->where('name', 'like', "%{$search}%"))->orderBy('created_at', 'desc')
            ->paginate($per_page)->onEachSide(1);


        return TaskResource::collection($tasks);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $taskData = $request->validated();
        $taskData['updated_by'] = $request->user()->id;

        if ($request->hasFile('image_path')) {
            $image = $request->file('image_path');

            // Save new image in the 'public' disk
            $relativePath = $this->saveImage($image);
            $taskData['image_path'] = asset('storage/' . str_replace('public/', '', $relativePath));


            if ($task->image_path) {
                // Convert full URL to relative storage path
                $oldImagePath = str_replace(url('/'), '', $task->image_path);
                $oldImagePath = ltrim($oldImagePath, '/'); // Remove leading slash

                // Ensure correct path for deletion
                $storagePath = str_replace('storage/', '', $oldImagePath); // Remove 'storage/' prefix

                if (Storage::disk('public')->exists($storagePath)) {
                    Storage::disk('public')->delete($storagePath); // Delete the image file

                    // Extract directory path
                    $directoryPath = dirname($storagePath);

                    // Check if directory is empty before deleting
                    if (count(Storage::disk('public')->files($directoryPath)) === 0) {
                        Storage::disk('public')->deleteDirectory($directoryPath);
                    }
                }
            }
        }
        $task->assigned_user_id = $taskData['assignee'];
        $task->update($taskData);

        return response()->json(['task' => new TaskResource($task), 'message' => 'Project updated successfully']);
    }

    private function saveImage(\Illuminate\Http\UploadedFile $image)
    {
        $path = 'images/tasks/' . Str::random();

        // Store the image in the 'public' disk
        $filePath = Storage::disk('public')->putFileAs($path, $image, $image->getClientOriginalName());

        return $filePath;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        //
    }

    public function statusUpdate(Task $task)
    {
        request()->validate([
            'status' => 'required|string|in:pending,in_progress,completed',
        ]);

        $task->update(['status' => request('status')]);

        return response()->json([
            'message' => 'Task status updated successfully.',
            'task' => new TaskResource($task),
        ]);
    }
}
