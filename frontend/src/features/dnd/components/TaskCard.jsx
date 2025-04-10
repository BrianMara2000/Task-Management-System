import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function TaskCard({ task, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab 
               hover:shadow-md transition-shadow active:cursor-grabbing"
    >
      <h4 className="font-medium line-clamp-2">{task.name}</h4>
      {task.due_date && (
        <div className="mt-2 text-xs text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
