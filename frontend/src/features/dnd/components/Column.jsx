import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { statusColors } from "@/constants/constants";
import { PlusCircle } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

export function Column({ column, tasks, activeId, priority }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: String(column.value), data: { columnId: column.value } });
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.value,
    data: { accepts: ["pending", "in_progress", "completed"] },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setDroppableRef}
      style={style}
      className="flex flex-col w-full rounded-lg p-3"
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex justify-between items-center mb-3 cursor-grab"
      >
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
      </div>

      <SortableContext
        items={tasks.map((t) => t.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 overflow-y-auto flex-grow">
          {tasks.map((task) => (
            <TaskCard
              priority={priority}
              columnId={column.value}
              key={task.id}
              task={task}
              isDragging={activeId === task.id.toString()}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
