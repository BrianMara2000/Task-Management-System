import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Actions from "./Actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  formatPriority,
  getColorFromName,
  priorityColors,
} from "@/constants/constants";
import {
  CircleAlertIcon,
  CircleIcon,
  DotIcon,
  TriangleAlert,
} from "lucide-react";

import StatusUpdate from "./StatusUpdate";

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
  // columnHelper.accessor("image_path", {
  //   header: "Image",
  //   cell: ({ row }) => (
  //     <Avatar className="rounded w-14 h-10">
  //       <AvatarImage
  //         src={row.original.image_path}
  //         alt={row.original.name}
  //         className="w-full h-full object-cover"
  //       />
  //       <AvatarFallback
  //         className={`rounded w-14 h-10 ${getColorFromName(
  //           row.original.name
  //         )} text-white font-bold`}
  //       >
  //         {row.original.name.charAt(0)}
  //       </AvatarFallback>
  //     </Avatar>
  //   ),
  // }),

  columnHelper.accessor("name", {
    header: () => (
      <span className="flex items-center justify-start">Task Name</span>
    ),
    size: 250, // Set width in pixels
    minSize: 100, // Minimum width
    maxSize: 200,
  }),

  columnHelper.display({
    id: "status",
    header: () => (
      <span className="flex items-center justify-start">Task Status</span>
    ),
    cell: ({ row }) => <StatusUpdate task={row.original} />,
  }),

  {
    accessorKey: "assigned_user",
    header: () => (
      <span className="flex items-center whitespace-nowrap">Assignee</span>
    ),
    cell: ({ row }) => (
      <Avatar className="rounded w-full gap-x-3 h-10 flex items-center">
        <AvatarImage
          src={row.original.assigned_user.profile_image}
          alt={row.original.assigned_user.name}
          className="rounded-full w-8 h-8 object-cover"
        />

        <AvatarFallback
          className={`rounded-full w-8 h-8 ${getColorFromName(
            row.original.assigned_user.name
          )} text-white font-bold`}
        >
          {row.original.assigned_user.name.charAt(0)}
        </AvatarFallback>
        <span className="hidden sm:inline text-sm font-medium">
          {row.original.assigned_user.name}
        </span>
      </Avatar>
    ),
  },

  {
    accessorKey: "priority",
    header: () => (
      <span className="flex px-3 items-center whitespace-nowrap justify-start">
        Priority
      </span>
    ),

    cell: (info) => {
      const priority = formatPriority(info.getValue()) || "No Status";
      const priorityClass = priorityColors[priority];

      return (
        <span
          className={`px-3 py-2 flex items-center gap-2 rounded font-bold text-sm ${priorityClass}`}
        >
          {priority === "High" ? (
            <TriangleAlert />
          ) : priority === "Low" ? (
            <CircleIcon
              fill="currentColor"
              className="w-3 h-3 ml-1 text-center"
            />
          ) : (
            <CircleAlertIcon className="w-5 h-5" />
          )}
          {priority}
        </span>
      );
    },
  },

  columnHelper.accessor("created_at", {
    header: () => (
      <span className="flex items-center justify-start">Create Date</span>
    ),
  }),
  columnHelper.accessor("due_date", {
    header: () => (
      <span className="flex items-center justify-start">Due Date</span>
    ),
  }),
  columnHelper.display({
    header: () => (
      <span className="flex items-center justify-start">Actions</span>
    ),
    id: "actions",
    cell: ({ row }) => <Actions task={row.original} type="list" />,
  }),
];
