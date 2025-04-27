import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "./Column";
import { useTasks } from "@/hooks/useTasks";
import { getTaskFilters } from "@/constants/constants";
import { TaskCard } from "./TaskCard";

const Board = ({ projectId, users }) => {
  const { tasks, moveTask, updateStatus } = useTasks(projectId);
  const [activeTask, setActiveTask] = useState(null);

  const columns = getTaskFilters(users);
  const { Status, Priority } = columns;

  // Derive itemsByColumn mapping from tasks, memoized to avoid unnecessary recalculation
  const initialMapping = useMemo(() => {
    const mapping = {};
    Status.forEach((col) => {
      mapping[col.value] = tasks
        .filter((t) => t.status === col.value)
        .map((t) => t.id.toString());
    });
    return mapping;
  }, [tasks, Status]);

  const [itemsByColumn, setItemsByColumn] = useState(initialMapping);

  // Sync itemsByColumn only when initialMapping changes
  useEffect(() => {
    // Compare keys and arrays shallowly to prevent infinite loop
    let changed = false;
    for (const key of Object.keys(initialMapping)) {
      const prev = itemsByColumn[key] || [];
      const next = initialMapping[key];
      if (prev.length !== next.length || prev.some((v, i) => v !== next[i])) {
        changed = true;
        break;
      }
    }
    if (changed) {
      setItemsByColumn(initialMapping);
    }
  }, [initialMapping, itemsByColumn]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Find container by item ID
  const findContainer = (id) =>
    Object.keys(itemsByColumn).find((key) => itemsByColumn[key]?.includes(id));

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const sourceCol = findContainer(activeId);
    const targetCol = findContainer(overId) || over.data.current?.columnId;
    if (!sourceCol || !targetCol || sourceCol === targetCol) return;

    setItemsByColumn((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const targetItems = [...prev[targetCol]];

      const activeIndex = sourceItems.indexOf(activeId);
      const overIndex = targetItems.indexOf(overId);

      const isBelowLast =
        overIndex === targetItems.length - 1 &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const insertIndex = overIndex + (isBelowLast ? 1 : 0);

      sourceItems.splice(activeIndex, 1);
      targetItems.splice(insertIndex, 0, activeId);

      return {
        ...prev,
        [sourceCol]: sourceItems,
        [targetCol]: targetItems,
      };
    });
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const sourceCol = findContainer(activeId);
    const targetCol = findContainer(overId) || over.data.current?.columnId;
    if (!sourceCol || !targetCol) return;

    if (sourceCol === targetCol) {
      moveTask(activeId, overId, sourceCol);
    } else {
      updateStatus(activeId, targetCol, overId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 p-4 overflow-x-auto select-none">
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => {
          const id = active.id.toString();
          const taskObj = tasks.find((t) => t.id.toString() === id);
          setActiveTask(taskObj);
        }}
      >
        {Status.map((column) => (
          <Column
            key={column.value}
            column={column}
            tasks={(itemsByColumn[column.value] || [])
              .map((id) => tasks.find((task) => task.id.toString() === id))
              .filter(Boolean)}
            priority={Priority}
            activeId={activeTask?.id.toString()}
          />
        ))}

        <DragOverlay dropAnimation={{ duration: 150 }}>
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
