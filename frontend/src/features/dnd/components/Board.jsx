import { useState } from "react";
import {
  DndContext,
  MouseSensor,
  closestCorners,
  useSensor,
} from "@dnd-kit/core";
import { Column } from "./Column";
import { useTasks } from "@/hooks/useTasks";
import { getTaskFilters } from "@/constants/constants";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { TaskCard } from "./TaskCard";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Board = ({ projectId, users }) => {
  const { tasks, moveTask, updateStatus } = useTasks(projectId);
  const [activeId, setActiveId] = useState("");
  const columns = getTaskFilters(users);
  const { Status, Priority } = columns;
  const [activeTask, setActiveTask] = useState(null);

  const mouseSensor = useSensor(MouseSensor);
  const [indicator, setIndicator] = useState({
    show: false,
    position: null,
    targetId: null,
  });

  const handleDragOver = (event) => {
    const { over, activatorEvent } = event;
    if (!over || !activatorEvent) return;

    const overRect = over.rect;
    const mouseY = activatorEvent.clientY;
    const isBefore = mouseY < overRect.top + overRect.height / 2;

    setIndicator({
      show: true,
      position: isBefore ? "before" : "after",
      targetId: over.id,
    });

    if (isBefore) {
      console.log("Insert BEFORE the target");
    } else {
      console.log("Insert AFTER the target");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setIndicator({ show: false, position: null, targetId: null });
    setActiveId(null);

    const activeTask = tasks.find(
      (t) => t.id.toString() === active.id.toString()
    );
    const overColumnId =
      over.data.current?.columnId ||
      (over.data.current?.accepts ? over.id : activeTask.status);

    if (activeTask.status === overColumnId) {
      moveTask(active.id.toString(), over.id.toString(), overColumnId);
    } else {
      updateStatus(
        active.id.toString(),
        overColumnId,
        over.data.current?.accepts ? null : over.id.toString()
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 p-4 overflow-x-auto select-none">
      <DndContext
        sensors={[mouseSensor]}
        modifiers={[restrictToWindowEdges]}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={({ active }) => {
          setActiveId(active.id.toString());
          setActiveTask(tasks.find((t) => t.id.toString() === active.id)); // Consider optimizing this lookup to avoid rendering delay.
        }}
      >
        <SortableContext
          items={tasks.map((t) => t.id.toString())} // All task IDs across columns
          strategy={verticalListSortingStrategy} // <-- Add this
        >
          <div className="flex gap-4">
            {Status?.map((column) => (
              <Column
                key={column.value}
                indicator={indicator}
                column={column}
                priority={Priority}
                tasks={tasks.filter((t) => t.status === column.value)}
                activeId={activeId}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              isDragging
              priority={Priority}
              columnId={activeTask.status}
              style={{
                transform: "scale(1.02)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;
