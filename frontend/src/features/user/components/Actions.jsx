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
import ProfileImageUpload from "./ProfileImageUpload";
import { useDispatch } from "react-redux";
import { axiosClient } from "@/axios";
import { deleteUser as deleteUserAction, updateUser } from "../userSlice";
import { toast } from "sonner";

export default function Actions({ user }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    name: "",
    email: "",
    profile_image: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const showUser = async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/users/${user.id}`);
      setSelectedUser({
        name: response.data.name,
        email: response.data.email,
        profile_image: response.data.profile_image,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      await axiosClient.delete(`/users/${user.id}`);
      dispatch(deleteUserAction(user.id));
      setIsDeleteOpen(false);
      toast("User Deleted", {
        description: "The user has been removed successfully.",
        type: "success",
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to delete the user. Please try again.",
        type: "error",
      });
      console.error("Failed to delete user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = (file) => {
    setSelectedUser((prevUser) => ({ ...prevUser, profile_image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", selectedUser.name);
      formData.append("email", selectedUser.email);
      if (selectedUser.profile_image instanceof File) {
        formData.append("profile_image", selectedUser.profile_image);
      }
      formData.append("_method", "PUT");

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axiosClient.post(`/users/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(updateUser(response.data));
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center w-10 gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={showUser} className="cursor-pointer bg-purple-500">
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
                <div className="flex justify-center">
                  <ProfileImageUpload onUpload={handleUpload} />
                </div>
                {selectedUser.profile_image && (
                  <div className="flex justify-center">
                    <img
                      src={
                        selectedUser.profile_image instanceof File
                          ? URL.createObjectURL(selectedUser.profile_image)
                          : selectedUser.profile_image?.startsWith("/storage/")
                          ? `http://localhost:8000${selectedUser.profile_image}`
                          : selectedUser.profile_image
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={selectedUser.name}
                    onChange={(e) =>
                      setSelectedUser((prevUser) => ({
                        ...prevUser,
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
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser((prevUser) => ({
                        ...prevUser,
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
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500"
              onClick={deleteUser}
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
