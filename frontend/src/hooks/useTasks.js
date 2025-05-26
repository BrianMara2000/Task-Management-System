import { axiosClient } from "@/axios";
import {
  setAllTasks,
  setPagination,
  setTasks,
  updateTaskPosition,
} from "@/features/task/taskSlice";
import { setUsers } from "@/features/user/userSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useTasks(projectId) {
  const dispatch = useDispatch();

  // Table Tab
  const tasks = useSelector((state) => state.task.tasks);
  const allTasks = useSelector((state) => state.task.allTasks);

  const pagination = useSelector((state) => state.task.pagination);
  const users = useSelector((state) => state.user.users);
  const filters = useSelector((state) => state.task.filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTableTasks = useCallback(async () => {
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
    fetchTableTasks();
  }, [fetchTableTasks]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axiosClient.get(`/users`);

      dispatch(setUsers(response.data.users.data));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  //Board Tab

  const fetchBoardTasks = useCallback(async () => {
    try {
      const response = await axiosClient.get(
        `/projects/${projectId}/tasks/board`
      );
      dispatch(setAllTasks(response.data));
    } catch (error) {
      console.error("Failed to fetch all tasks:", error);
      setError("Failed to load tasks. Please try again.");
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    fetchBoardTasks();
  }, [fetchBoardTasks]);

  const moveTask = async (taskId, targetId, status, isBelow, targetItems) => {
    const previousTasks = [...tasks];
    // console.log("Target ID: ", targetId);
    try {
      let newPosition;
      const taskToMove = allTasks.find((t) => t.id == taskId);

      if (!taskToMove) return;

      //For empty column
      const isEmptyColumn = targetId === status;

      if (isEmptyColumn) {
        newPosition = 100;
        await axiosClient.patch(`/tasks/${taskId}/position`, {
          position: newPosition,
          status,
          targetId: null,
        });

        return;
      }

      const statusTasks = targetItems
        .map((id) => allTasks.find((task) => task.id.toString() === id))
        .filter(Boolean);

      const targetIndex = statusTasks.findIndex((t) => t.id == targetId);

      if (targetIndex === -1) {
        return;
      }

      const targetTask = statusTasks[targetIndex] || null;
      const previousTask = statusTasks[targetIndex - 1] || null;
      const nextTask = statusTasks[targetIndex + 1] || null;

      // console.log("Target Index: ", targetIndex);
      // statusTasks.forEach((task) => {
      //   console.log("Task ID: ", task.id + " " + "Position: ", task.position);
      // });
      // console.log("Previous Task: ", previousTask);
      // console.log("Next Task: ", nextTask);

      const targetTaskPosition = parseFloat(targetTask.position || 0);
      const previousTaskPosition = parseFloat(previousTask?.position) || 0;
      const nextTaskPosition = parseFloat(nextTask?.position) || 0;

      if (previousTask && nextTask) {
        if (isBelow) {
          newPosition = (previousTaskPosition + targetTaskPosition) / 2;
        } else {
          newPosition = (nextTaskPosition + targetTaskPosition) / 2;
        }
      } else if (previousTask && !nextTask) {
        newPosition = targetTaskPosition + 100;
      } else if (!previousTask && nextTask) {
        newPosition = targetTaskPosition - 100;
      } else {
        if (isBelow) {
          newPosition = targetTaskPosition + 100;
        } else {
          newPosition = targetTaskPosition - 100;
        }
      }

      // console.log("Target task Position: ", targetTaskPosition);
      // console.log("New Position: ", newPosition);

      dispatch(
        updateTaskPosition({
          taskId,
          newPosition,
          newStatus: status,
        })
      );

      await axiosClient.patch(`/tasks/${taskId}/position`, {
        position: newPosition,
        status,
        targetId,
      });
    } catch (error) {
      dispatch(setAllTasks(previousTasks));
      console.error("Error moving task:", error);
    }
  };

  return {
    tasks,
    allTasks,
    users,
    pagination,
    filters,
    loading,
    error,
    fetchBoardTasks,
    moveTask,
  };
}
