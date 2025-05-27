import { useState, useEffect, useMemo, useRef } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  rectIntersection,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
// import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "./Column";
import { getTaskFilters } from "@/constants/constants";
import { TaskCard } from "./TaskCard";

const Board = ({ users, tasks, moveTask }) => {
  const [activeTask, setActiveTask] = useState(null);

  const columns = useMemo(() => getTaskFilters(users), [users]);
  const { Status, Priority } = columns;

  const isBelowRef = useRef(false);
  const pointerYRef = useRef(0);

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
    const handleMouseMove = (e) => {
      pointerYRef.current = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
      coordinateGetter: (event) => ({
        x: event.clientX,
        y: event.clientY,
      }),
    })
    // useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id) => {
    if (id in itemsByColumn) {
      return id;
    }

    return Object.keys(itemsByColumn).find((key) =>
      itemsByColumn[key]?.includes(id)
    );
  };

  const handleDragOver = ({ over }) => {
    if (!over || !over.rect) return;

    const pointerY = pointerYRef.current;
    const overRect = over.rect;

    isBelowRef.current = pointerY > overRect.top + overRect.height / 2;
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    const sourceCol = findContainer(activeId);
    const targetCol = findContainer(overId) || over.data.current?.columnId;
    if (!sourceCol || !targetCol) return;

    const isColumnNotEmpty = itemsByColumn[targetCol].length > 0;

    if (overId === targetCol && isColumnNotEmpty) {
      console.log("Dropped on column but it's not empty – ignoring");
      return;
    }

    setItemsByColumn((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const targetItems = [...prev[targetCol]];

      const activeIndex = sourceItems.indexOf(activeId);
      const overIndex = targetItems ? targetItems.indexOf(overId) : 0;

      const insertIndex =
        sourceCol === targetCol
          ? overIndex
          : overIndex + (isBelowRef.current ? 1 : 0);

      sourceItems.splice(activeIndex, 1);

      if (targetItems.includes(activeId)) {
        targetItems.splice(targetItems.indexOf(activeId), 1);
      }

      targetItems.splice(insertIndex, 0, activeId);

      const nextItemsByColumn = {
        ...prev,
        [sourceCol]: sourceItems,
        [targetCol]: targetItems,
      };

      return nextItemsByColumn;
    });

    moveTask(
      activeId,
      overId,
      targetCol,
      isBelowRef.current,
      itemsByColumn[targetCol]
    );
  };

  // Dnd debugging component to log all droppable containers
  // Uncomment this to see all droppable containers in the console
  // const DebugDroppables = () => {
  //   const { droppableContainers } = useDndContext();
  //   console.log("All droppables:", droppableContainers);
  //   return null;
  // };

  return (
    <div className="flex h-screen bg-gray-50 p-4 overflow-x-auto select-none">
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        collisionDetection={rectIntersection}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragStart={({ active }) => {
          const id = active.id.toString();
          const taskObj = tasks.find((t) => t.id.toString() === id);
          setActiveTask(taskObj);
        }}
      >
        {/* <DebugDroppables> */}
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

        <DragOverlay
          dropAnimation={{
            duration: 150,
          }}
        >
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
        {/* </DebugDroppables> */}
      </DndContext>
    </div>
  );
};

export default Board;
