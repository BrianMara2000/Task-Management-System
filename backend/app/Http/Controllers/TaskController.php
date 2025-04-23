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
use Illuminate\Support\Facades\DB;

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
        $assignee = $request->input('assignee', '');
        $priority = $request->input('priority', '');

        $tasks = Task::query()->with(['project', 'user'])
            ->where('project_id', $project->id)
            ->when($status, fn($query) => $query->whereIn('status', (array) $status))
            ->when($assignee, fn($query) => $query->whereIn('assigned_user_id', (array) $assignee))
            ->when($priority, fn($query) => $query->whereIn('priority', (array) $priority))
            ->when($search, fn($query) => $query->where('name', 'like', "%{$search}%"))->orderBy('created_at', 'desc')
            ->paginate($per_page)->onEachSide(1);


        return TaskResource::collection($tasks);
    }

    public function getAllTasks(Request $request, Project $project)
    {
        $tasks = Task::query()->with(['project', 'user'])
            ->where('project_id', $project->id)
            ->orderBy('position')
            ->get();

        return TaskResource::collection($tasks);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request, Project $project)
    {
        $taskData = $request->validated();
        $taskData['created_by'] = $request->user()->id;
        $taskData['updated_by'] = $request->user()->id;

        if ($request->hasFile('image_path')) {
            $image = $request->file('image_path');

            // Save new image in the 'public' disk
            $relativePath = $this->saveImage($image);
            $taskData['image_path'] = asset('storage/' . str_replace('public/', '', $relativePath));
        }
        // $task->assigned_user_id = $taskData['assignee'];
        $taskData['project_id'] = $project->id;
        $taskData['assigned_user_id'] = $taskData['assignee'];
        $task = Task::create($taskData);

        return response()->json(['task' => new TaskResource($task), 'message' => 'task created successfully']);
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
        // Delete the image if it exists
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

            // Uncomment the following lines if you want to log the image deletion process

            // else {
            //     Log::warning("Image not found after path adjustment: " . $storagePath);
            // }

            // Log::info("Final Image Path to be deleted: " . $storagePath);
        }

        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function statusUpdate(Task $task, Request $request)
    {
        request()->validate([
            'status' => 'required|string|in:pending,in_progress,completed',
        ]);

        $task->update(['status' => request('status')]);

        if ($request->has('targetId')) {
            $targetTask = Task::findOrFail($request->targetId);
            $this->reorderTask($task, $targetTask);
        }

        return response()->json([
            'message' => 'Task status updated and reordered.',
            'task' => new TaskResource($task),
        ]);
    }


    public function positionUpdate(Task $task, Request $request)
    {
        $validated = $request->validate([
            'targetId' => 'required|exists:tasks,id',
            'status' => 'sometimes|required',
            'checksum' => 'sometimes|string',
            'clientPosition' => 'sometimes|numeric'
        ]);

        $serverTasks = Task::where('project_id', $task->project_id)->where('status', $validated['status'])
            ->orderBy('position')
            ->get();

        $serverChecksum = $serverTasks->map(fn($t) => "{$t->id}:{$t->position}")
            ->join('|');

        if ($request->has('checksum')) {
            if ($serverChecksum !== $request->checksum) {
                return response()->json([
                    'message' => 'Position conflict detected',
                    'serverState' => $serverTasks->map(fn($t) => ['id' => $t->id, 'position' => $t->position])
                ], 409);
            }
        }

        $targetTask = Task::findOrFail($validated['targetId']);
        $this->reorderTask($task, $targetTask);

        $updatedTasks = Task::where('project_id', $task->project_id)
            ->orderByDesc('position')
            ->get();

        return response()->json([
            'message' => 'Task position updated',
            'updatedTasks' => TaskResource::collection($updatedTasks),
            'serverChecksum' => $serverChecksum,
            'clientChecksum' => $request->checksum,
            'task' => new TaskResource($task->fresh())

        ]);
    }

    private function reorderTask(Task $task, Task $targetTask)
    {
        $project = Project::findOrFail($task->project_id);
        $project->reorder_count += 1;

        $task = Task::lockForUpdate()->find($task->id);
        $targetTask = Task::lockForUpdate()->find($targetTask->id);

        if ($project->reorder_count >= 20) {
            $this->normalizeTaskPositions($project->id, $targetTask->status);
            $project->reorder_count = 0;
        }

        $project->save();

        if ($task->project_id !== $targetTask->project_id) {
            return response()->json(['error' => 'Tasks must be in same project'], 422);
        }

        $targetPosition = (float) $targetTask->position;

        $previousTask = Task::query()
            ->where('project_id', $targetTask->project_id)
            ->where('status', $targetTask->status)
            ->where('position', '<', $targetPosition)
            ->where('id', '!=', $targetTask->id)
            ->orderByDesc('position')
            ->first();

        $nextTask = Task::query()
            ->where('project_id', $targetTask->project_id)
            ->where('status', $targetTask->status)
            ->where('position', '>', $targetPosition)
            ->where('id', '!=', $targetTask->id)
            ->orderBy('position')
            ->first();


        if (!$previousTask && !$nextTask) {
            $newPosition = 100;
        } elseif (!$previousTask && $nextTask) {
            $newPosition = $targetPosition - 100;
        } elseif (!$nextTask && $previousTask) {
            $newPosition = $targetPosition + 100;
        } elseif ($previousTask->id === $task->id) {
            $newPosition = ($nextTask->position + $targetPosition) / 2;
        } elseif ($nextTask && $nextTask->id === $task->id) {
            $newPosition = ($previousTask->position + $targetPosition) / 2;
        } elseif ($previousTask && $nextTask) {
            $newPosition = ($previousTask->position + $targetPosition) / 2;
        } else {
            $newPosition = $targetPosition + 100;
        }

        $task->position = $newPosition;
        $task->update();
    }

    private function normalizeTaskPositions($projectId, $status)
    {
        $tasks = Task::where('project_id', $projectId)
            ->where('status', $status)
            ->orderBy('position')
            ->get();

        $position = 100;
        foreach ($tasks as $task) {
            $task->position = $position;
            $task->save();
            $position += 100;
        }
    }
}
