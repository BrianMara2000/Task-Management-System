<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\InviteUserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/accept-invite', [InviteUserController::class, 'acceptInvite']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {
  Route::get('/getUser', [UserController::class, 'getUser']);
  Route::post('/logout', [AuthController::class, 'logout']);

  Route::apiResource('/users', UserController::class);

  Route::get('/projects/latest-projects', [ProjectController::class, 'getLatestProjects']);
  Route::get('/projects/pinned-projects', [ProjectController::class, 'getPinnedProjects']);
  Route::apiResource('/projects', ProjectController::class);
  Route::put('/projects/{project}/pin', [ProjectController::class, 'pinProject']);

  Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
  Route::get('/projects/{project}/tasks/board', [TaskController::class, 'getAllTasks']);
  Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
  Route::put('/tasks/{task}', [TaskController::class, 'update']);
  Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
  Route::patch('/tasks/{task}', [TaskController::class, 'statusUpdate']);
  Route::patch('/tasks/{task}/position', [TaskController::class, 'positionUpdate']);

  Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
  Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);

  Route::post('users/invite-user', [InviteUserController::class, 'inviteUser']);
});
