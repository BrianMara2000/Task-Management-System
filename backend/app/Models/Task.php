<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
