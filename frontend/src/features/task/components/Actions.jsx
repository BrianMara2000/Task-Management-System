import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  EllipsisVerticalIcon,
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

import { useDispatch } from "react-redux";
import { axiosClient } from "@/axios";
import { deleteTask as deleteTaskAction } from "../taskSlice";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import TaskForm from "@/components/form/TaskForm";

export default function Actions({ task, type }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex items-center gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-white transition duration-200 ease-in-out hover:bg-indigo-100 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-400">
          {type === "list" ? (
            <EllipsisVerticalIcon className="h-5 w-5 text-purple-500 transition duration-200 group-hover:text-purple-800" />
          ) : (
            <Ellipsis className="h-5 w-5 text-purple-500 transition duration-200 group-hover:text-purple-800" />
          )}
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

            <TaskForm task={task} />
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
