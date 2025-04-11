import { useCallback, useEffect, useState } from "react";
import { columns } from "@/features/task/components/columns";
import { DataTable } from "@/features/task/components/data-table";
import { axiosClient } from "@/axios";
import { useDispatch, useSelector } from "react-redux";
import { setPagination, setTasks } from "@/features/task/taskSlice";
import { setUsers } from "@/features/user/userSlice";
import Board from "@/features/dnd/components/Board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tasks({ projectId }) {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.tasks);
  const pagination = useSelector((state) => state.task.pagination);
  const users = useSelector((state) => state.user.users);
  const filters = useSelector((state) => state.task.filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get(`/projects/${projectId}/tasks`, {
        params: {
          page: pagination.page,
          per_page: pagination.pageSize,
          status: filters.status !== "All" ? filters.status : undefined,
          assignee: filters.assignee !== "All" ? filters.assignee : undefined,
          priority: filters.priority !== "All" ? filters.priority : undefined,
          search: filters.search || "",
        },
      });

      dispatch(setTasks(response.data.data));
      dispatch(
        setPagination({
          page: response.data.meta.current_page,
          pageSize: response.data.meta.per_page,
          total: response.data.meta.total,
          links: response.data.meta.links,
        })
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, pagination.page, pagination.pageSize, filters, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchUsers = useCallback(async () => {
    // setLoading(true);
    // setError(null);
    try {
      const response = await axiosClient.get(`/users`);

      dispatch(setUsers(response.data.users.data));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [dispatch]); // Dependencies inside useCallback

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="flex justify-center items-center mb-10">
      <Tabs defaultValue="table" className="w-full flex justify-center">
        <TabsList className="w-[50%] mx-auto">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <div className="container mx-auto w-full py-10">
            <DataTable
              columns={columns}
              filters={filters}
              data={tasks}
              pagination={pagination}
              setPagination={(newPagination) =>
                dispatch(setPagination(newPagination))
              }
              error={error}
              loading={loading}
              users={users}
              projectId={projectId}
            />
          </div>
        </TabsContent>
        <TabsContent value="board">
          <div className="container mx-auto w-full py-10">
            <Board projectId={projectId} users={users} />
          </div>
        </TabsContent>
        <TabsContent value="calendar">Calendar</TabsContent>
      </Tabs>
    </div>
  );
}
