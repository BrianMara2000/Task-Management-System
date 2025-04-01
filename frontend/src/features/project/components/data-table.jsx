import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { useEffect, useMemo, useState } from "react";
import { DataTablePagination } from "@/components/core/pagination";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { axiosClient } from "@/axios";
import { toast } from "sonner";
import { PlusIcon, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { addProject, setFilters } from "../projectSlice";
import ImageUpload from "./ImageUpload";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { formatStatus } from "@/constants/constants";
import { useDebounce } from "@/hooks/useDebounce";

export function DataTable({
  columns,
  data,
  pagination,
  setPagination,
  filters,
  error,
  loading,
}) {
  const [sorting, setSorting] = useState([]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "",
    image_path: "",
    created_at: "",
    due_date: "",
    pinned: false,
  });
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debouncedSearch = useDebounce(localSearch, 500);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.page - 1, // ✅ Convert 1-based index to 0-based
        pageSize: pagination.pageSize,
      },
    },
    manualPagination: true, // ✅ Enable manual pagination
    rowCount: pagination.total, // ✅ Total rows from backend
  });

  const handleUpload = (file) => {
    setNewProject((prevProject) => ({
      ...prevProject,
      image_path: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    try {
      const formData = new FormData();
      formData.append("name", newProject.name);
      formData.append("description", newProject.description);
      formData.append("status", newProject.status);
      formData.append("pinned", newProject.pinned);
      if (newProject.due_date) {
        formData.append(
          "due_date",
          format(new Date(newProject.due_date), "yyyy-MM-dd")
        );
      }
      if (typeof newProject.image_path === "object") {
        formData.append("image_path", newProject.image_path);
      }

      const response = await axiosClient.post(`/projects`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(
        addProject({
          ...response.data.project,
          created_at: format(
            new Date(response.data.project.created_at),
            "yyyy-MM-dd"
          ),
        })
      );
      setIsOpen(false);
      toast.success("Project Created", {
        closeButton: true,
      });
    } catch (error) {
      setErrors(error.response?.data?.errors);
    } finally {
      setIsLoading(false);
    }
  };

  const updatedFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [debouncedSearch, filters]
  );

  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      dispatch(setFilters(updatedFilters));
    }
  }, [updatedFilters, dispatch, debouncedSearch, filters.search]);

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              dispatch(
                setPagination({
                  ...pagination,
                  pageSize: Number(value),
                })
              );
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filter by status</p>
          <Select
            value={filters.status}
            onValueChange={(value) => {
              dispatch(
                setFilters({
                  ...filters,
                  status: value,
                })
              );
            }}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent side="top">
              {["All", "pending", "in_progress", "completed"].map((status) => (
                <SelectItem key={status} value={`${status}`}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search projects..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 px-3 py-2 text-white bg-purple-500 rounded-md hover:bg-purple-400 hover:text-white transition duration-200">
              <PlusIcon />
              <span>New Project</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Add your new project here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            {/* Form Content */}
            {isLoading ? (
              <div className="grid gap-4 py-4">
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid sm:grid-cols-1 md:grid-cols-2  gap-6 py-4">
                  {/* Left: Image Upload */}
                  <div className="flex flex-col justify-center items-center gap-4">
                    <ImageUpload onUpload={handleUpload} />
                    {newProject.image_path && (
                      <img
                        src={
                          newProject.image_path instanceof File
                            ? URL.createObjectURL(newProject.image_path)
                            : newProject.image_path?.startsWith("/storage/")
                            ? `http://localhost:8000${newProject.image_path}`
                            : newProject.image_path
                        }
                        alt="Project"
                        className="w-full rounded object-cover border"
                      />
                    )}
                    {errors?.image_path && (
                      <p className="text-sm text-red-600">
                        {errors.image_path[0]}
                      </p>
                    )}
                  </div>

                  {/* Right: Form Fields */}
                  <div className="flex flex-col gap-4">
                    {/* Name Field */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject((prevProject) => ({
                            ...prevProject,
                            name: e.target.value,
                          }))
                        }
                        // required
                      />
                    </div>
                    {errors?.name && (
                      <p className="text-sm text-red-600">{errors?.name[0]}</p>
                    )}

                    {/* Description Field */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject((prevProject) => ({
                            ...prevProject,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    {errors?.description && (
                      <p className="text-sm text-red-600">
                        {errors?.description[0]}
                      </p>
                    )}

                    {/* Due Date Field */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newProject.due_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newProject.due_date ? (
                              format(new Date(newProject.due_date), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newProject.due_date}
                            onSelect={(date) => {
                              setNewProject((prevProject) => ({
                                ...prevProject,
                                due_date: date,
                              }));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {errors?.due_date && (
                      <p className="text-sm text-red-600">
                        {errors?.due_date[0]}
                      </p>
                    )}

                    {/* Status Field */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newProject.status}
                        onValueChange={(value) =>
                          setNewProject((prev) => ({
                            ...prev,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors?.status && (
                      <p className="text-sm text-red-600">
                        {errors?.status[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <DialogFooter>
                  <Button
                    className="bg-purple-500 w-full md:w-auto rounded-md shadow-md"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border p-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!data || loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24 text-red-500"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center h-24"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {!pagination || loading ? (
          <div></div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <DataTablePagination
            table={table}
            setPagination={setPagination}
            pagination={pagination}
          />
        )}
      </div>
    </div>
  );
}
