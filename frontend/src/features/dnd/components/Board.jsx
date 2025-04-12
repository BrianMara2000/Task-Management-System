import { useState } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { Column } from "./Column";
import { useTasks } from "@/hooks/useTasks";
import { getTaskFilters } from "@/constants/constants";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Board = ({ projectId, users }) => {
  const { tasks, moveTask, updateStatus } = useTasks(projectId);
  const [activeId, setActiveId] = useState("");
  const columns = getTaskFilters(users);
  const { Status, Priority } = columns;

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Same column (reorder)
    if (
      active.data.current?.sortable.containerId ===
      over.data.current?.sortable.containerId
    ) {
      moveTask(active.id.toString(), over.id.toString());
    }
    // Different column (change status)
    else {
      console.log("Dropped", active, "over", over);
      await updateStatus(active.id.toString(), over.data.current?.columnId);
    }
    console.log("Dropped", active, "over", over);
  };

  return (
    <div className="flex h-screen bg-gray-50 p-4 overflow-x-auto select-none">
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => {
          console.log("Dragging", active.id);
          setActiveId(active.id.toString());
        }}
      >
        <div className="flex gap-4">
          <SortableContext
            items={Status}
            strategy={verticalListSortingStrategy}
          >
            {Status?.map((column) => (
              <Column
                key={column.value}
                column={column}
                priority={Priority}
                tasks={tasks.filter((t) => t.status === column.value)}
                activeId={activeId}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};

export default Board;
