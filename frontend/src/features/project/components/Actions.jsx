import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EllipsisVerticalIcon,
  Folder,
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
import {
  deleteProject as deleteProjectAction,
  updateProject,
} from "../projectSlice";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { Link } from "react-router-dom";

export default function Actions({ project }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    image_path: project.image_path,
    due_date: project.due_date,
    pinned: project.pinned,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([null]);

  const deleteProject = async () => {
    setIsLoading(true);
    try {
      await axiosClient.delete(`/projects/${project.id}`);
      dispatch(deleteProjectAction(project.id));
      setIsDeleteOpen(false);
      toast("Project Deleted", {
        description: "The project has been removed successfully.",
        type: "success",
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to delete the project. Please try again.",
        type: "error",
      });
      console.error("Failed to delete project:", error);
    } finally {
      setIsLoading(false);
      setIsPopoverOpen(false);
    }
  };

  const handleUpload = (file) => {
    setSelectedProject((prevProject) => ({
      ...prevProject,
      image_path: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);
    try {
      const formData = new FormData();
      formData.append("name", selectedProject.name);
      formData.append("description", selectedProject.description || "");
      formData.append("status", selectedProject.status);
      formData.append("pinned", selectedProject.pinned ? "1" : "0");
      if (selectedProject.due_date) {
        formData.append(
          "due_date",
          format(new Date(selectedProject.due_date || ""), "yyyy-MM-dd")
        );
      }
      if (selectedProject.image_path instanceof File) {
        formData.append("image_path", selectedProject.image_path);
      }
      formData.append("_method", "PUT");

      const response = await axiosClient.post(
        `/projects/${project.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      dispatch(
        updateProject({
          ...response.data.project,
          created_at: format(
            new Date(response.data.project.created_at),
            "MMM dd, yyyy"
          ),
        })
      );
      setIsOpen(false);
      toast.success("Project Updated", {
        closeButton: true,
      });
    } catch (error) {
      setErrors(error.response?.data.errors);
    } finally {
      setIsPopoverOpen(false);
      setIsLoading(false);
    }
  };

  const togglePinned = async () => {
    setIsToggleLoading(true);
    try {
      const newPinnedStatus = !selectedProject.pinned;

      setSelectedProject((prev) => ({
        ...prev,
        pinned: newPinnedStatus,
      }));

      const response = await axiosClient.put(`projects/${project.id}/pin`, {
        pinned: newPinnedStatus,
      });
      dispatch(
        updateProject({ ...response.data, pinned: response.data.pinned })
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      setSelectedProject((prev) => ({
        ...prev,
        pinned: !prev.pinned,
      }));
    } finally {
      setIsToggleLoading(false);
    }
  };

  useEffect(() => {
    setSelectedProject((prev) => ({
      ...prev,
      pinned: project.pinned,
    }));
  }, [project.pinned]);

  useEffect(() => {
    if (project) {
      setSelectedProject({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "pending",
        image_path: project.image_path || "",
        due_date: project.due_date || null,
        pinned: project.pinned || false,
      });
    }
  }, [project]);

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
          {/* Pin Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={togglePinned}
                  disabled={isLoading}
                  className={`flex items-center gap-2 w-full px-4 py-2 rounded-md transition duration-200 ${
                    selectedProject?.pinned
                      ? "bg-yellow-400 text-white hover:bg-yellow-500"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  } ${isLoading ? "cursor-not-allowed" : " "}`}
                >
                  {isToggleLoading ? (
                    <Spinner className="ml-10" />
                  ) : selectedProject.pinned ? (
                    <PinOff className="h-5 w-5 text-white" />
                  ) : (
                    <Pin className="h-5 w-5 text-gray-600" />
                  )}
                  <span>
                    {isToggleLoading
                      ? "Please wait..."
                      : selectedProject.pinned
                      ? "Unpin"
                      : "Pin"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedProject.pinned
                  ? "Unpin from sidebar"
                  : "Pin to sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* View Project Button */}
          <Link
            to={`/app/projects/${project.id}`}
            className="flex items-center justify-center font-medium text-sm gap-2 w-full px-3 py-2 text-purple-700 bg-transparent rounded-md hover:bg-purple-500 hover:text-white transition duration-200"
          >
            <Folder className="h-5 w-5" />
            <span>View</span>
          </Link>

          {/* Edit Project Button */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 w-full px-3 py-2 text-purple-700 bg-transparent rounded-md hover:bg-purple-500 hover:text-white transition duration-200">
                <SquarePen className="h-5 w-5" />
                <span>Edit</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Make changes to your project details here. Click save when
                  you're done.
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
                      {selectedProject.image_path && (
                        <img
                          src={
                            selectedProject.image_path instanceof File
                              ? URL.createObjectURL(selectedProject.image_path)
                              : selectedProject.image_path?.startsWith(
                                  "/storage/"
                                )
                              ? `${import.meta.env.VITE_API_BASE_URL}${
                                  selectedProject.image_path
                                }`
                              : selectedProject.image_path
                          }
                          alt="Project"
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
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          value={selectedProject.name}
                          onChange={(e) =>
                            setSelectedProject((prevProject) => ({
                              ...prevProject,
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
                          value={selectedProject.description}
                          onChange={(e) =>
                            setSelectedProject((prevProject) => ({
                              ...prevProject,
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
                                !selectedProject.due_date &&
                                  "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedProject.due_date ? (
                                format(selectedProject.due_date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedProject.due_date}
                              onSelect={(date) => {
                                if (date >= new Date()) {
                                  // Prevent selecting past dates
                                  setSelectedProject((prevProject) => ({
                                    ...prevProject,
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
                          value={selectedProject.status}
                          onValueChange={(value) =>
                            setSelectedProject((prev) => ({
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

          {/* Delete Project Button */}
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
                  Are you sure you want to delete this project? This action
                  cannot be undone.
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
                  onClick={deleteProject}
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
