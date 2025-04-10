import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";

export function Column({ column, tasks, activeId }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col w-72 bg-gray-100 rounded-lg p-3"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex justify-between items-center mb-3 cursor-grab"
      >
        <h3 className="font-semibold">{column.title}</h3>
        <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)}>
        <div className="flex flex-col gap-3 overflow-y-auto flex-grow">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={activeId === task.id}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
