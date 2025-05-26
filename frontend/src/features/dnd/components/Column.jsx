import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { statusColors } from "@/constants/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle } from "lucide-react";

export function Column({ column, tasks, activeId, priority }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.value,
    data: { type: "column", accepts: ["task"], columnId: column.value },
  });

  const taskIds = tasks.map((t) => t.id.toString());

  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col w-full transition-all rounded-lg p-3">
        <div
          className={`flex ${
            statusColors[column.name]
          } w-full px-4 py-3 rounded-lg justify-between items-center gap-2`}
        >
          <div className="flex items-center gap-2">
            <span className="bg-white text-gray-500 px-2 py-1 font-bold rounded-full text-xs">
              {tasks.length}
            </span>
            <h3 className="font-semibold">{column.name}</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <PlusCircle />
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new task</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Tasks list with sortable context */}
        <div
          ref={setNodeRef}
          data-droppable-id={column.value}
          className={`flex flex-col py-4 gap-3 overflow-y-auto  flex-grow ${
            isOver ? "bg-red-200" : ""
          }`}
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                priority={priority}
                columnId={column.value}
                isDragging={activeId == task.id}
              />
            ))}
            {tasks.length === 0 && (
              <div className="p-4 text-center text-gray-400 border-2 border-dashed border-blue-400 rounded">
                Drop a task here
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
