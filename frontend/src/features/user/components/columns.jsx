import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2Icon, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  }),
  // columnHelper.accessor("role", {
  //   header: "Role",
  // }),
  columnHelper.accessor("actions", {
    header: "Actions",
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center w-10 gap-2">
          <Button className="cursor-pointer bg-purple-500">
            <SquarePen className="" />
          </Button>
          <Button className="cursor-pointer bg-red-500">
            <Trash2Icon className="" />
          </Button>
        </div>
      );
    },
  }),
];
