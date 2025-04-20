import { axiosClient } from "@/axios";
import { setAllTasks } from "@/features/task/taskSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useTasks(projectId) {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.task.allTasks);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axiosClient.get(
        `/projects/${projectId}/tasks/board`
      );
      dispatch(setAllTasks(response.data.data));
    };
    fetchTasks();
  }, [dispatch, projectId]);

  // In your useTasks hook
  const moveTask = async (taskId, targetId, status) => {
    const previousTasks = [...tasks]; // Store for rollback

    try {
      // 1. Optimistic update
      const newTasks = calculateNewOrder(tasks, taskId, targetId);
      dispatch(setAllTasks(newTasks));

      // 2. Send checksum for validation
      const checksum = generateChecksum(newTasks);
      await axiosClient.patch(`/tasks/${taskId}/position`, {
        targetId,
        status,
        checksum,
        clientPosition: newTasks.find((t) => t.id == taskId).position,
      });
    } catch (error) {
      // 3. Reconcile on error
      if (error.response?.status === 409) {
        // await recoverFromError();
        console.error("Checksum mismatch, recovering...");
      } else {
        dispatch(setAllTasks(previousTasks));
      }
    }
  };

  // Generate a simple checksum
  const generateChecksum = (tasks) => {
    return tasks.map((t) => `${t.id}:${t.position}`).join("|");
  };

  // Calculate positions client-side
  const calculateNewOrder = (tasks, taskId, targetId) => {
    const taskIndex = tasks.findIndex((t) => t.id == taskId);
    const overIndex = tasks.findIndex((t) => t.id == targetId);
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(taskIndex, 1);
    newTasks.splice(overIndex, 0, movedTask);
  };

  // const moveTask = async (taskId, targetId) => {
  //   try {
  //     const taskIndex = tasks.findIndex((t) => t.id == taskId);
  //     const overIndex = tasks.findIndex((t) => t.id == targetId);
  //     const newTasks = [...tasks];
  //     const [movedTask] = newTasks.splice(taskIndex, 1);
  //     newTasks.splice(overIndex, 0, movedTask);

  //     dispatch(setAllTasks(newTasks));
  //     await axiosClient.patch(`/tasks/${taskId}/position`, {
  //       targetId,
  //     });
  //   } catch (error) {
  //     console.error("Failed to move task:", error);
  //   }
  // };

  const updateStatus = async (taskId, newStatus, targetId) => {
    const previousTasks = [...tasks];

    try {
      const statusTask = tasks.find((t) => t.status === newStatus);

      const newTasks = tasks.map((task) =>
        task.id == taskId ? { ...task, status: newStatus } : task
      );

      const taskToMove = newTasks.find((task) => task.id == taskId);
      const filtered = newTasks.filter((task) => task.id != taskId);

      const insertAt = targetId
        ? filtered.findIndex((task) => task.id == targetId)
        : statusTask.length;

      filtered.splice(insertAt, 0, taskToMove);

      dispatch(setAllTasks(filtered));

      await axiosClient.patch(`/tasks/${taskId}`, {
        status: newStatus,
        targetId,
      });
    } catch (error) {
      // Revert on error
      dispatch(setAllTasks(previousTasks));
      console.error("Status update failed:", error);
    }
  };

  return { tasks, moveTask, updateStatus };
}
