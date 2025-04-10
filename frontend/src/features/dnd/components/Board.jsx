import { useState } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column } from "./Column";
import { useTasks } from "@/hooks/useTasks";

const Board = ({ projectId }) => {
  const { columns, tasks, moveTask, updateStatus } = useTasks(projectId);
  const [activeId, setActiveId] = useState("");

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Same column (reorder)
    if (active.data.current?.columnId === over.data.current?.columnId) {
      moveTask(active.id.toString(), over.id.toString());
    }
    // Different column (change status)
    else {
      await updateStatus(active.id.toString(), over.data.current?.columnId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 p-4 overflow-x-auto">
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => setActiveId(active.id.toString())}
      >
        <div className="flex gap-4">
          <SortableContext
            items={columns}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks.filter((t) => t.status === column.id)}
                activeId={activeId}
              />
            ))}
          </SortableContext>
          {/* <AddColumnButton /> */}
        </div>
      </DndContext>
    </div>
  );
};

export default Board;
