import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EllipsisVerticalIcon,
  Pin,
  PinOff,
  SquarePen,
  Trash2Icon,
  View,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch } from "react-redux";
import { axiosClient } from "@/axios";
import { deleteTask as deleteTaskAction, updateTask } from "../taskSlice";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "./ImageUpload";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Actions({ task }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState({
    name: task.name,
    description: task.description,
    status: task.status,
    image_path: task.image_path,
    due_date: task.due_date,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([null]);

  const deleteTask = async () => {
    setIsLoading(true);
    try {
      await axiosClient.delete(`/tasks/${task.id}`);
      dispatch(deleteTaskAction(task.id));
      setIsDeleteOpen(false);
      toast("task Deleted", {
        description: "The task has been removed successfully.",
        type: "success",
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to delete the task. Please try again.",
        type: "error",
      });
      console.error("Failed to delete task:", error);
    } finally {
      setIsLoading(false);
      setIsPopoverOpen(false);
    }
  };

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
      setIsOpen(false);
      toast.success("task Updated", {
        closeButton: true,
      });
    } catch (error) {
      setErrors(error.response?.data.errors);
    } finally {
      setIsPopoverOpen(false);
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
      });
    }
  }, [task]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-white transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-400">
          <EllipsisVerticalIcon className="h-5 w-5 text-purple-500 transition duration-200 group-hover:text-purple-800" />
        </PopoverTrigger>

        <PopoverContent
          open={isOpen}
          className="flex flex-col w-40 p-1 gap-2 bg-white shadow-lg rounded-md"
        >
          {/* Edit task Button */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full px-3 py-2 text-purple-700 bg-transparent rounded-md hover:bg-purple-500 hover:text-white transition duration-200">
                <SquarePen className="h-5 w-5" />
                <span>Edit</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Edit task</DialogTitle>
                <DialogDescription>
                  Make changes to your task details here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>

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
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left: Image Upload */}
                    <div className="flex flex-col justify-center items-center gap-4">
                      <ImageUpload onUpload={handleUpload} />
                      {selectedTask.image_path && (
                        <img
                          src={
                            selectedTask.image_path instanceof File
                              ? URL.createObjectURL(selectedTask.image_path)
                              : selectedTask.image_path?.startsWith("/storage/")
                              ? `http://localhost:8000${selectedTask.image_path}`
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
                    <div className="flex flex-col gap-4">
                      {/* Name Field */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name">task Name</Label>
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
                        <p className="text-sm text-red-600">
                          {errors?.name[0]}
                        </p>
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
                                !selectedTask.due_date &&
                                  "text-muted-foreground"
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
                        <p className="text-sm text-red-600">
                          {errors?.due_date[0]}
                        </p>
                      )}

                      {/* Status Field */}
                      <div className="flex flex-col gap-2">
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
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {errors?.status && (
                        <p className="text-sm text-red-600">
                          {errors?.status[0]}
                        </p>
                      )}
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
            </DialogContent>
          </Dialog>

          {/* Delete task Button */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full px-3 py-2 text-red-700 bg-transparent rounded-md hover:bg-red-500 hover:text-white transition duration-200">
                <Trash2Icon className="h-5 w-5" />
                <span>Delete</span>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 rounded-md shadow-md"
                  onClick={deleteTask}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PopoverContent>
      </Popover>
    </div>
  );
}
