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
import { addTask, setFilters } from "../taskSlice";
import ImageUpload from "../../../components/core/ImageUpload";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { getColorFromName } from "@/constants/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Filters } from "@/components/core/filter";

export function DataTable({
  columns,
  data,
  pagination,
  setPagination,
  filters,
  error,
  loading,
  users,
  projectId,
}) {
  const [sorting, setSorting] = useState([]);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    status: "",
    image_path: "",
    created_at: "",
    due_date: "",
    priority: "",
    assignee: "",
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
    setNewTask((prevTask) => ({
      ...prevTask,
      image_path: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    try {
      const formData = new FormData();
      formData.append("name", newTask.name);
      formData.append("description", newTask.description);
      formData.append("status", newTask.status);
      formData.append("priority", newTask.priority);
      formData.append("assignee", newTask.assignee);
      if (newTask.due_date) {
        formData.append(
          "due_date",
          format(new Date(newTask.due_date), "yyyy-MM-dd")
        );
      }
      if (typeof newTask.image_path === "object") {
        formData.append("image_path", newTask.image_path);
      }

      const response = await axiosClient.post(
        `/projects/${projectId}/tasks`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      dispatch(
        addTask({
          ...response.data.task,
          created_at: format(
            new Date(response.data.task.created_at),
            "yyyy-MM-dd"
          ),
        })
      );
      setIsOpen(false);
      toast.success("Task Created", {
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

  const toggleFilter = async (category, value) => {
    dispatch(
      setFilters({
        ...filters,
        [category]: filters[category]?.includes(value)
          ? filters[category].filter((f) => f !== value) // Remove filter
          : [...(filters[category] || []), value], // Add filter
      })
    );
  };

  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      dispatch(setFilters(updatedFilters));
    }
  }, [updatedFilters, dispatch, debouncedSearch, filters.search]);

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-5">
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
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
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
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search Tasks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px] py-4"
          />

          <Filters filters={filters} toggleFilter={toggleFilter} />

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 px-3 py-2 text-white bg-purple-500 rounded-md hover:bg-purple-400 hover:text-white transition duration-200">
                <PlusIcon />
                <span>New Task</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Add your new Task here. Click save when you're done.
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
                      {newTask.image_path && (
                        <img
                          src={
                            newTask.image_path instanceof File
                              ? URL.createObjectURL(newTask.image_path)
                              : newTask.image_path?.startsWith("/storage/")
                              ? `${import.meta.env.VITE_API_BASE_URL}${
                                  newTask.image_path
                                }`
                              : newTask.image_path
                          }
                          alt="Task"
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
                        <Label htmlFor="name">Task Name</Label>
                        <Input
                          id="name"
                          value={newTask.name}
                          onChange={(e) =>
                            setNewTask((prevTask) => ({
                              ...prevTask,
                              name: e.target.value,
                            }))
                          }
                          // required
                        />
                      </div>
                      {errors?.name && (
                        <p className="text-sm text-red-600">
                          {errors?.name[0]}
                        </p>
                      )}

                      {/* Description Field */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask((prevTask) => ({
                              ...prevTask,
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
                                !newTask.due_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newTask.due_date ? (
                                format(new Date(newTask.due_date), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newTask.due_date}
                              onSelect={(date) => {
                                setNewTask((prevTask) => ({
                                  ...prevTask,
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

                      {/* Assignee Field */}
                      <div className="flex flex-col gap-2 w-full">
                        <Label htmlFor="dueDate">Assign to</Label>
                        <Select
                          className="w-full p-2"
                          value={newTask.assignee}
                          onValueChange={(value) => {
                            console.log(value);
                            setNewTask((prev) => ({
                              ...prev,
                              assignee: Number(value),
                            }));
                          }}
                        >
                          <SelectTrigger className="w-full py-5">
                            <SelectValue placeholder="Select Assignee" />
                          </SelectTrigger>
                          <SelectContent side="bottom" align="start">
                            {users.map((user) => (
                              <SelectItem
                                value={user.id}
                                className="flex items-center gap-10 border-b border-gray-200 p-2"
                                key={user.id}
                              >
                                <Avatar>
                                  <AvatarImage
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="rounded-full w-full h-full object-cover"
                                  />
                                  <AvatarFallback
                                    className={`w-full h-full flex items-center justify-center rounded-full ${getColorFromName(
                                      user.name
                                    )} text-white font-bold`}
                                  >
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {user.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors?.assignee && (
                          <p className="text-sm text-red-600">
                            {errors?.assignee[0]}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center gap-x-10">
                        {/* Status Field */}
                        <div className="w-full flex flex-col gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={newTask.status}
                            onValueChange={(value) =>
                              setNewTask((prev) => ({
                                ...prev,
                                status: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in_progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors?.status && (
                            <p className="text-sm text-red-600">
                              {errors?.status[0]}
                            </p>
                          )}
                        </div>

                        {/* Priority Field */}
                        <div className=" w-full flex flex-col gap-2">
                          <Label htmlFor="status">Priority</Label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value) =>
                              setNewTask((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors?.priority && (
                            <p className="text-sm text-red-600">
                              {errors?.priority[0]}
                            </p>
                          )}
                        </div>
                      </div>
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
      </div>

      <div className="rounded-md border p-2 overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-max w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-center px-4 py-2"
                    >
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
                  <TableRow key={row.id} className="text-sm sm:text-base">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-2">
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
