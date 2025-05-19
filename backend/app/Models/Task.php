<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    protected $fillable = [
        "name",
        "description",
        "image_path",
        "status",
        "priority",
        "due_date",
        "assigned_user_id",
        "created_by",
        "updated_by",
        "project_id"
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
