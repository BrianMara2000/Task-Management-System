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

export function Column({ column, tasks, activeId, indicator, priority }) {
  // Set droppable zone to the column key
  const { setNodeRef } = useDroppable({
    id: column.value,
    data: { accepts: ["task"], columnId: column.value },
  });

  const showPlaceholder =
    indicator?.show && indicator.columnId === column.value;

  const taskIds = tasks.map((t) => t.id.toString());

  return (
    <div className="flex gap-4">
      {/* Column header stays outside SortableContext */}
      <div className="relative flex flex-col w-full transition-all rounded-lg p-3">
        <div
          className={`flex ${
            statusColors[column.name]
          } w-full p-4 rounded-lg justify-between items-center gap-2`}
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
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className="flex flex-col gap-3 overflow-y-auto flex-grow"
          >
            {tasks.map((task) => {
              const id = task.id.toString();
              return (
                <React.Fragment key={id}>
                  {/* Placeholder BEFORE */}
                  {showPlaceholder &&
                    indicator.position === "before" &&
                    indicator.targetId === id && (
                      <div className="h-2 bg-blue-400 rounded my-1" />
                    )}

                  {/* The actual task card */}
                  <TaskCard
                    task={task}
                    priority={priority}
                    columnId={column.value}
                    isDragging={activeId === id}
                  />

                  {/* Placeholder AFTER */}
                  {showPlaceholder &&
                    indicator.position === "after" &&
                    indicator.targetId === id && (
                      <div className="h-2 bg-blue-400 rounded my-1" />
                    )}
                </React.Fragment>
              );
            })}

            {/* Placeholder at end of column */}
            {showPlaceholder && indicator.position === "end" && (
              <div className="h-2 bg-blue-400 rounded my-1" />
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
