import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  Trash2Icon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { getColorFromName } from "@/constants/constants";
import { useState } from "react";
import { axiosClient } from "@/axios";
import { useDispatch } from "react-redux";
import {
  deleteProject as deleteProjectAction,
  setProject,
} from "@/features/project/projectSlice";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function NavPinnedProjects({ pinnedProjects }) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const dispatch = useDispatch();

  const deleteProject = async (id) => {
    setIsLoading(true);
    setIsDeleteOpen(true);
    try {
      await axiosClient.delete(`/projects/${id}`);
      dispatch(deleteProjectAction(id));
      dispatch(setProject(null));
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

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Pinned Projects</SidebarGroupLabel>
      <SidebarMenu>
        {pinnedProjects.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link to={`/app/projects/${item.id}`}>
                <Avatar className="rounded w-14 h-10">
                  <AvatarImage
                    className="rounded w-14 h-10"
                    src={item.image_path}
                    alt="Project Image"
                  />
                  <AvatarFallback
                    className={`rounded w-14 h-10 ${getColorFromName(
                      item.name
                    )} text-white font-bold`}
                  >
                    {item.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Link
                    to={`/app/projects/${item.id}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Folder className="text-muted-foreground" />
                    <span>View Project</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link className="flex items-center justify-center gap-2">
                    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                      <DialogTrigger asChild>
                        <button className="flex items-center justify-center gap-2">
                          <Trash2Icon className="text-muted-foreground" />
                          <span>Delete Project</span>
                        </button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this project? This
                            action cannot be undone.
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
                            onClick={() => deleteProject(item.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => navigate("/app/projects")}
            className="text-sidebar-foreground/70 cursor-pointer"
          >
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>All Projects</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
