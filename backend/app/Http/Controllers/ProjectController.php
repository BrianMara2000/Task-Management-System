<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->input('per_page', 10);
        $status = $request->input('status', '');
        $search = $request->input('search', '');

        $query = Project::query()->when($status, fn($query) => $query->where('status', $status))->orderBy('created_at', 'desc');
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $projects = $query->paginate($per_page)->onEachSide(1);

        return ProjectResource::collection($projects);
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
    public function store(StoreProjectRequest $request)
    {
        $projectData = $request->validated();
        $projectData['created_by'] = $request->user()->id;
        $projectData['updated_by'] = $request->user()->id;

        if ($request->hasFile('image_path')) {
            $image = $request->file('image_path');

            // Save new image in the 'public' disk
            $relativePath = $this->saveImage($image);
            $projectData['image_path'] = asset('storage/' . str_replace('public/', '', $relativePath));
        }

        $project = Project::create($projectData);

        return response()->json(['project' => $project, 'message' => 'Project created successfully']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        return new ProjectResource($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $projectData = $request->validated();
        $projectData['updated_by'] = $request->user()->id;

        if ($request->hasFile('image_path')) {
            $image = $request->file('image_path');

            // Save new image in the 'public' disk
            $relativePath = $this->saveImage($image);
            $projectData['image_path'] = asset('storage/' . str_replace('public/', '', $relativePath));


            if ($project->image_path) {
                // Convert full URL to relative storage path
                $oldImagePath = str_replace(url('/'), '', $project->image_path);
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
                } else {
                    Log::warning("Image not found after path adjustment: " . $storagePath);
                }

                Log::info("Final Image Path to be deleted: " . $storagePath);
            }
        }

        $project->update($projectData);

        return response()->json(['project' => $project, 'message' => 'Project updated successfully']);
    }

    private function saveImage(\Illuminate\Http\UploadedFile $image)
    {
        $path = 'images/projects/' . Str::random();

        // Store the image in the 'public' disk
        $filePath = Storage::disk('public')->putFileAs($path, $image, $image->getClientOriginalName());

        return $filePath;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        // Delete related tasks first
        Task::where('project_id', $project->id)->delete();

        // Delete the image if it exists
        if ($project->image_path) {
            // Convert full URL to relative storage path
            $oldImagePath = str_replace(url('/'), '', $project->image_path);
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
            //  else {
            //     Log::warning("Image not found after path adjustment: " . $storagePath);
            // }

            // Log::info("Final Image Path to be deleted: " . $storagePath);
        }

        // Delete the project
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }



    public function getLatestProjects()
    {
        $projects = Project::latest()->limit(5)->get();

        return response()->json($projects);
    }

    public function pinProject(Request $request, Project $project)
    {
        $project->pinned = $request->input('pinned');
        $project->save();

        return response()->json(['pinned' => $project->pinned, 'message' => 'Project pinned status updated successfully']);
    }

    public function getPinnedProjects()
    {
        $projects = Project::query()->where('pinned', 1)->get();

        return response()->json($projects);
    }
}
