import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Actions from "./Actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatStatus } from "@/constants/constants";

const columnHelper = createColumnHelper();

const statusColors = {
  Pending: "bg-yellow-500 text-white",
  In_Progress: "bg-blue-500 text-white",
  Completed: "bg-green-500 text-white",
};

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
  columnHelper.accessor("id", {
    header: "ID",
    cell: ({ row }) => <span>{row.original.id}</span>,
  }),
  columnHelper.accessor("image_path", {
    header: "Image",
    cell: ({ row }) => (
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={row.original.image_path}
          alt={row.original.name}
          className="w-full h-full object-cover"
        />
        <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
      </Avatar>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Project Name",
    size: 250, // Set width in pixels
    minSize: 100, // Minimum width
    maxSize: 200,
  }),
  {
    accessorKey: "status", // ✅ This makes getValue() work
    header: "Project Status",
    cell: (info) => {
      const status = formatStatus(info.getValue()) || "No Status";
      const statusClass = statusColors[status];

      return (
        <span className={`px-3 py-2 rounded ${statusClass}`}>{status}</span>
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
    cell: ({ row }) => <Actions project={row.original} />,
  }),
];
