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
import { useEffect } from "react";

export function TaskCard({ task, isDragging, priority, columnId }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  useEffect(() => {
    let timer;
    if (isSyncing) {
      timer = setTimeout(() => setIsSyncing(false), 1000);
    }
    return () => clearTimeout(timer);
  }, [isSyncing]);

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
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // ⬅️ This is critical!
            className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-white transition duration-200 ease-in-out"
          >
            <Ellipsis className="h-5 w-5 text-purple-500 transition duration-200 group-hover:text-purple-800" />
          </PopoverTrigger>

          <PopoverContent className="flex flex-col w-40 p-1 gap-2 bg-white shadow-lg rounded-md">
            <Edit className="h-5 w-5" />
            <span>View</span>
          </PopoverContent>
        </Popover>
      </div>

      <h4 className="font-medium line-clamp-2 mb-4">{task.name}</h4>
      <p className="text-gray-500 text-sm mb-4">{task.description}</p>
      <p>Debugging purposes</p>
      <div className="flex items-center justify-between border-2">
        <p className=" text-xs text-gray-500 font-bold">Task Id: {task.id}</p>
        <p className=" text-xs  font-bold text-red-500">
          Task Postion: {task.position}
        </p>
      </div>
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
