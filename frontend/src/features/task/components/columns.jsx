import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Actions from "./Actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatPriority,
  formatStatus,
  getColorFromName,
  priorityColors,
  statusColors,
} from "@/constants/constants";
import { CircleIcon, DotIcon, TriangleAlert } from "lucide-react";

const columnHelper = createColumnHelper();

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  // columnHelper.accessor("id", {
  //   header: "ID",
  //   cell: ({ row }) => <span>{row.original.id}</span>,
  // }),
  columnHelper.accessor("image_path", {
    header: "Image",
    cell: ({ row }) => (
      <Avatar className="rounded w-14 h-10">
        <AvatarImage
          src={row.original.image_path}
          alt={row.original.name}
          className="w-full h-full object-cover"
        />
        <AvatarFallback
          className={`rounded w-14 h-10 ${getColorFromName(
            row.original.name
          )} text-white font-bold`}
        >
          {row.original.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Task Name",
    size: 250, // Set width in pixels
    minSize: 100, // Minimum width
    maxSize: 200,
  }),
  {
    accessorKey: "status", // ✅ This makes getValue() work
    header: "Task Status",
    cell: (info) => {
      const status = formatStatus(info.getValue()) || "No Status";
      const statusClass = statusColors[status];

      return (
        <span className={`px-3 py-2 rounded ${statusClass}`}>{status}</span>
      );
    },
  },

  {
    accessorKey: "priority", // ✅ This makes getValue() work
    header: "Priority",
    cell: (info) => {
      const priority = formatPriority(info.getValue()) || "No Status";
      const priorityClass = priorityColors[priority];

      return (
        <span
          className={`px-3 py-2 flex items-center gap-2 rounded font-bold ${priorityClass}`}
        >
          {priority === "High" ? (
            <TriangleAlert />
          ) : (
            <CircleIcon fill="currentColor" className="w-3 h-3" />
          )}
          {priority}
        </span>
      );
    },
  },

  columnHelper.accessor("created_at", {
    header: "Create Date",
  }),
  columnHelper.accessor("due_date", {
    header: "Due Date",
  }),
  columnHelper.display({
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <Actions task={row.original} />,
  }),
];
