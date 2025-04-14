import { useState } from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { Column } from "./Column";
import { useTasks } from "@/hooks/useTasks";
import { getTaskFilters } from "@/constants/constants";
import { useDispatch } from "react-redux";
import { setAllTasks } from "@/features/task/taskSlice";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { TaskCard } from "./TaskCard";

const Board = ({ projectId, users }) => {
  const { tasks, moveTask, updateStatus } = useTasks(projectId);
  const [activeId, setActiveId] = useState("");
  const columns = getTaskFilters(users);
  const { Status, Priority } = columns;
  const dispatch = useDispatch();
  const [activeTask, setActiveTask] = useState(null);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overColumnId = over.data.current?.columnId;

    // Same column (reorder)
    if (active.data.current?.columnId === overColumnId) {
      moveTask(active.id.toString(), over.id.toString());
    }
    // Different column (change status)
    else if (overColumnId) {
      // Optimistic update first
      const updatedTasks = tasks.map((task) =>
        task.id.toString() === active.id
          ? { ...task, status: overColumnId }
          : task
      );
      dispatch(setAllTasks(updatedTasks));

      // Then API call
      await updateStatus(active.id.toString(), overColumnId);
    }
    console.log("Dropped", active, "over", over);
  };

  return (
    <div className="flex h-screen bg-gray-50 p-4 overflow-x-auto select-none">
      <DndContext
        modifiers={[restrictToWindowEdges]}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => {
          setActiveId(active.id.toString());
          setActiveTask(tasks.find((t) => t.id.toString() === active.id)); // Optimize this later to avoid delay
        }}
      >
        <div className="flex gap-4">
          {Status?.map((column) => (
            <Column
              key={column.value}
              column={column}
              priority={Priority}
              tasks={tasks.filter((t) => t.status === column.value)}
              activeId={activeId}
            />
          ))}
        </div>
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
