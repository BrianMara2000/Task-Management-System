import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2Icon } from "lucide-react";
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

export default function Actions({ project }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({
    name: "",
    email: "",
    profile_image: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const showProject = async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/projects/${project.id}`);
      setSelectedProject({
        name: response.data.name,
        email: response.data.email,
        profile_image: response.data.profile_image,
      });
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async () => {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", selectedProject.name);
      formData.append("email", selectedProject.email);
      if (selectedProject.profile_image instanceof File) {
        formData.append("profile_image", selectedProject.profile_image);
      }
      formData.append("_method", "PUT");

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axiosClient.post(
        `/projects/${project.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(updateProject(response.data));
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center w-10 gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={showProject}
            className="cursor-pointer bg-purple-500"
          >
            <SquarePen />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="grid gap-4 py-4">
              <Skeleton className="w-24 h-24 rounded-full mx-auto" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    className="col-span-3"
                    value={selectedProject.email}
                    onChange={(e) =>
                      setSelectedProject((prevProject) => ({
                        ...prevProject,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="bg-purple-500"
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

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button className="cursor-pointer bg-red-500">
            <Trash2Icon />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500"
              onClick={deleteProject}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
