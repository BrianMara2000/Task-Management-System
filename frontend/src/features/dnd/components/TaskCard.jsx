import {
  formatPriority,
  formatStatus,
  getColorFromName,
  statusBorderColors,
} from "@/constants/constants";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Ellipsis } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import Actions from "@/features/task/components/Actions";

export function TaskCard({ task, isDragging, priority, columnId }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id.toString(),
      data: {
        type: "task",
        status: task.status,
        columnId: columnId,
        task: task,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 0 : 1,
  };

  const matchedPriority = priority.find((item) => item.value === task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab 
               hover:shadow-md transition-shadow active:cursor-grabbing  ${
                 isDragging
                   ? "border-gray-500"
                   : statusBorderColors[formatStatus(columnId)]
               } border-l-4 border-solid`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`inline-flex items-center gap-2 mb-2 rounded-lg ${matchedPriority.color} px-2 py-1`}
        >
          {matchedPriority && (
            <span
              className={` flex font-bold items-center gap-2`}
              fill={matchedPriority.fill}
            >
              {React.createElement(matchedPriority.icon, {
                fill: matchedPriority.fill || "none",
                className: matchedPriority.className,
              })}
            </span>
          )}
          <span className="text-xs font-bold ">
            {formatPriority(task.priority)} Priority
          </span>
        </div>

        <Actions task={task} />
        {/* <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // ⬅️ This is critical!
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-white transition duration-200 ease-in-out"
          >
            <Ellipsis className="h-5 w-5 text-purple-500 transition duration-200 group-hover:text-purple-800" />
          </PopoverTrigger>

          <PopoverContent
            open={isOpen}
            className="flex flex-col w-40 p-1 gap-2 bg-white shadow-lg rounded-md"
          >
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
                    Make changes to your task details here. Click save when
                    you're done.
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[500px] w-full">
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
                        <div className="flex flex-col justify-center items-center gap-4">
                          <ImageUpload onUpload={handleUpload} />
                          {selectedTask.image_path && (
                            <img
                              src={
                                selectedTask.image_path instanceof File
                                  ? URL.createObjectURL(selectedTask.image_path)
                                  : selectedTask.image_path?.startsWith(
                                      "/storage/"
                                    )
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
                          <p className="text-sm text-red-600">
                            {errors.name[0]}
                          </p>
                        )}

                        <div className="flex flex-col col-span-2 gap-4">
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
                            <p className="text-sm text-red-600">
                              {errors?.name[0]}
                            </p>
                          )}

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

                          <div className="flex flex-col gap-2 w-full">
                            <Label htmlFor="dueDate">Assign to</Label>
                            <Select
                              className="w-full p-2"
                              value={selectedTask.assignee}
                              onValueChange={(value) => {
                                console.log(value);
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
                            <p className="text-sm text-red-600">
                              {errors?.due_date[0]}
                            </p>
                          )}

                          <div className="flex justify-between items-center gap-x-10">
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
                                  <SelectItem value="in_progress">
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {errors?.status && (
                              <p className="text-sm text-red-600">
                                {errors?.status[0]}
                              </p>
                            )}

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
                              <p className="text-sm text-red-600">
                                {errors?.status[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

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
            </Dialog>

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
                    Are you sure you want to delete this task? This action
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
                    onClick={deleteTask}
                    disabled={isLoading}
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PopoverContent>
        </Popover> */}
      </div>

      <h4 className="font-medium line-clamp-2 mb-4">{task.name}</h4>
      <p className="text-gray-500 text-sm mb-4">{task.description}</p>
      {/* <p>Debugging purposes</p>
      <div className="flex items-center justify-between border-2">
        <p className=" text-xs text-gray-500 font-bold">Task Id: {task.id}</p>
        <p className=" text-xs  font-bold text-red-500">
          Task Postion: {task.position}
        </p>
      </div> */}
      <div className="flex items-center justify-between">
        <p className=" text-xs text-gray-500">Due: {task.due_date}</p>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="rounded h-10 flex items-center">
                <AvatarImage
                  src={task.assigned_user.profile_image}
                  alt={task.assigned_user.name}
                  className="rounded-full w-8 h-8 object-cover"
                />

                <AvatarFallback
                  className={`rounded-full w-8 h-8 ${getColorFromName(
                    task.assigned_user.name
                  )} text-white font-bold`}
                >
                  {task.assigned_user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <span>{task.assigned_user.name}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
