import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "@/axios";
import { updateTask } from "@/features/task/taskSlice";
import { toast } from "sonner";
import { getColorFromName } from "@/constants/constants";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "../core/ImageUpload";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const TaskForm = ({ task }) => {
  const dispatch = useDispatch();

  const [selectedTask, setSelectedTask] = useState({
    name: task.name,
    description: task.description,
    image_path: task.image_path,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    assignee: task.assigned_user.id,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([null]);

  const users = useSelector((state) => state.user.users);

  const handleUpload = (file) => {
    setSelectedTask((prevtask) => ({
      ...prevtask,
      image_path: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);
    try {
      const formData = new FormData();
      formData.append("name", selectedTask.name);
      formData.append("description", selectedTask.description || "");
      formData.append("status", selectedTask.status);
      formData.append("priority", selectedTask.priority);
      formData.append("assignee", selectedTask.assignee);

      if (selectedTask.due_date) {
        formData.append(
          "due_date",
          format(new Date(selectedTask.due_date || ""), "yyyy-MM-dd")
        );
      }
      if (selectedTask.image_path instanceof File) {
        formData.append("image_path", selectedTask.image_path);
      }
      formData.append("_method", "PUT");

      const response = await axiosClient.post(`/tasks/${task.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(
        updateTask({
          ...response.data.task,
          created_at: format(
            new Date(response.data.task.created_at),
            "MMM dd, yyyy"
          ),
        })
      );
      toast.success("Task Updated", {
        closeButton: true,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update the task. Please try again.",
      });
      setErrors(error.response?.data.errors);
      console.error("Failed to update task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (task) {
      setSelectedTask({
        name: task.name || "",
        description: task.description || "",
        status: task.status || "pending",
        image_path: task.image_path || "",
        due_date: task.due_date || null,
        priority: task.priority || null,
        assignee: task.assigned_user.id || null,
      });
    }
  }, [task]);
  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>Edit task</DialogTitle>
        <DialogDescription>
          Make changes to your task details here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-[500px] w-full">
        {/* Form Content */}
        {isLoading ? (
          <div className="grid gap-4 py-4">
            <Skeleton className="w-24 h-24 rounded-full mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* Left: Image Upload */}
              <div className="flex flex-col justify-center items-center gap-4">
                <ImageUpload onUpload={handleUpload} />
                {selectedTask.image_path && (
                  <img
                    src={
                      selectedTask.image_path instanceof File
                        ? URL.createObjectURL(selectedTask.image_path)
                        : selectedTask.image_path?.startsWith("/storage/")
                        ? `${import.meta.env.VITE_API_BASE_URL}${
                            selectedTask.image_path
                          }`
                        : selectedTask.image_path
                    }
                    alt="task"
                    className="w-full rounded object-cover border"
                  />
                )}
              </div>
              {errors?.image_path && (
                <p className="text-sm text-red-600">{errors.name[0]}</p>
              )}

              {/* Right: Form Fields */}
              <div className="flex flex-col col-span-2 gap-4">
                {/* Name Field */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Task Name</Label>
                  <Input
                    id="name"
                    value={selectedTask.name}
                    onChange={(e) =>
                      setSelectedTask((prevtask) => ({
                        ...prevtask,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                {errors?.name && (
                  <p className="text-sm text-red-600">{errors?.name[0]}</p>
                )}

                {/* Description Field */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={selectedTask.description}
                    onChange={(e) =>
                      setSelectedTask((prevtask) => ({
                        ...prevtask,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                {errors?.description && (
                  <p className="text-sm text-red-600">
                    {errors?.description[0]}
                  </p>
                )}

                {/* Due Date Field */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedTask.due_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedTask.due_date ? (
                          format(selectedTask.due_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedTask.due_date}
                        onSelect={(date) => {
                          if (date >= new Date()) {
                            // Prevent selecting past dates
                            setSelectedTask((prevtask) => ({
                              ...prevtask,
                              due_date: date,
                            }));
                          }
                        }}
                        fromDate={new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors?.due_date && (
                  <p className="text-sm text-red-600">{errors?.due_date[0]}</p>
                )}

                {/* Assignee Field */}
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="dueDate">Assign to</Label>
                  <Select
                    className="w-full p-2"
                    value={selectedTask.assignee}
                    onValueChange={(value) => {
                      setSelectedTask((prev) => ({
                        ...prev,
                        assignee: Number(value),
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full py-5">
                      <SelectValue placeholder="Select Assignee" />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start">
                      {users.map((user) => (
                        <SelectItem
                          value={user.id}
                          className="flex items-center gap-10 border-b border-gray-200 p-2"
                          key={user.id}
                        >
                          <Avatar>
                            <AvatarImage
                              src={user.profile_image}
                              alt={user.name}
                              className="rounded-full w-full h-full object-cover"
                            />
                            <AvatarFallback
                              className={`w-full h-full flex items-center justify-center rounded-full ${getColorFromName(
                                user.name
                              )} text-white font-bold`}
                            >
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {errors?.due_date && (
                  <p className="text-sm text-red-600">{errors?.due_date[0]}</p>
                )}

                <div className="flex justify-between items-center gap-x-10">
                  {/* Status Field */}
                  <div className="w-full flex flex-col gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) =>
                        setSelectedTask((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors?.status && (
                    <p className="text-sm text-red-600">{errors?.status[0]}</p>
                  )}

                  {/* Priority Field */}
                  <div className=" w-full flex flex-col gap-2">
                    <Label htmlFor="status">Priority</Label>
                    <Select
                      value={selectedTask.priority}
                      onValueChange={(value) =>
                        setSelectedTask((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {errors?.status && (
                    <p className="text-sm text-red-600">{errors?.status[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <DialogFooter>
              <Button
                className="bg-purple-500 w-full md:w-auto rounded-md shadow-md"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </ScrollArea>
    </DialogContent>
  );
};

export default TaskForm;
