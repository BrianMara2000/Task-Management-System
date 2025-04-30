import { useState, useEffect, useMemo, useRef } from "react";
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

  const columns = useMemo(() => getTaskFilters(users), [users]);
  const { Status, Priority } = columns;

  const isBelowRef = useRef(false);

  const [itemsByColumn, setItemsByColumn] = useState(() => {
    const mapping = {};
    Status.forEach((col) => {
      mapping[col.value] = tasks
        .filter((t) => t.status === col.value)
        .map((t) => t.id.toString());
    });
    return mapping;
  });

  useEffect(() => {
    const newMapping = {};
    Status.forEach((col) => {
      newMapping[col.value] = tasks
        .filter((t) => t.status === col.value)
        .map((t) => t.id.toString());
    });

    if (JSON.stringify(newMapping) !== JSON.stringify(itemsByColumn)) {
      setItemsByColumn(newMapping);
    }
  }, [tasks, Status]);

  // useEffect(() => {
  //   console.log(itemsByColumn);
  // }, [itemsByColumn, tasks, Status]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id) => {
    Object.keys(itemsByColumn).find((key) => itemsByColumn[key]?.includes(id));
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id.toString();
    // console.log("Over: ", over);
    // console.log("active: ", active);
    const overId = over.id.toString();
    const sourceCol = findContainer(activeId);
    const targetCol = findContainer(overId) || over.data.current?.columnId;
    if (!sourceCol || !targetCol || sourceCol === targetCol) return;

    setItemsByColumn((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const targetItems = [...prev[targetCol]];

      const activeIndex = sourceItems.indexOf(activeId);
      const overIndex = targetItems.indexOf(overId);

      isBelowRef.current =
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const insertIndex = overIndex + (isBelowRef.current ? 1 : 0);

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
    console.log(isBelowRef.current);
    if (!over || active.id === over.id) return;
    const activeId = active.id.toString();
    const overId = over.id.toString();
    const sourceCol = findContainer(activeId);
    const targetCol = findContainer(overId) || over.data.current?.columnId;
    if (!sourceCol || !targetCol) return;

    if (sourceCol === targetCol) {
      console.log(isBelowRef.current);
      moveTask(activeId, overId, sourceCol, isBelowRef.current);
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
