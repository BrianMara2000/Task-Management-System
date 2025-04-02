<?php

namespace App\Http\Resources;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public static $wrap = false;
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'created_at' => (new Carbon($this->created_at))->format('Y-m-d'),
            'due_date' => $this->due_date ? (new Carbon($this->due_date))->format('Y-m-d') : null,
            'status' => $this->status,
            "priority" => $this->priority,
            'image_path' => $this->image_path,
            'createdBy' => new UserResource(User::find($this->created_by)),
            'updatedBy' => new UserResource(User::find($this->updated_by)),
            "assigned_user_id" => $this->assigned_user_id,
        ];
    }
}
