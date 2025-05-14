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
import Actions from "@/features/task/components/Actions";

export function TaskCard({ task, isDragging, priority, columnId }) {
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

        <Actions task={task} type="board" />
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
