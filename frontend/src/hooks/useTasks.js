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

  const moveTask = async (taskId, targetId, status) => {
    const previousTasks = [...tasks];

    try {
      const checksum = generateChecksum(tasks, status);

      const newTasks = calculateNewOrder(tasks, taskId, targetId, status);
      dispatch(setAllTasks(newTasks));

      await axiosClient.patch(`/tasks/${taskId}/position`, {
        targetId,
        status,
        checksum,
        clientPosition: newTasks.find((t) => t.id == taskId).position,
      });

      // console.log(response.data.updatedTasks);

      // dispatch(setAllTasks(response.data.updatedTasks));
    } catch (error) {
      if (error.response?.status === 409) {
        await recoverFromError();
        console.error("Checksum mismatch, recovering...");
      } else {
        dispatch(setAllTasks(previousTasks));
      }
    }
  };

  const generateChecksum = (tasks, status) => {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position)
      .map((t) => `${t.id}:${t.position}`)
      .join("|");
  };

  const calculateNewOrder = (tasks, taskId, targetId, status) => {
    const columnTasks = tasks.filter((t) => t.status === status);
    const taskIndex = columnTasks.findIndex((t) => t.id == taskId);
    const overIndex = columnTasks.findIndex((t) => t.id == targetId);

    const fromIndex = tasks.indexOf(columnTasks[taskIndex]);
    let toIndex = tasks.indexOf(columnTasks[overIndex]);

    if (fromIndex < toIndex) toIndex--;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, movedTask);

    return newTasks;
  };

  const recoverFromError = async () => {
    const response = await axiosClient.get(
      `/projects/${projectId}/tasks/board`
    );
    dispatch(setAllTasks(response.data.data));
  };

  const updateStatus = async (taskId, newStatus, targetId) => {
    const previousTasks = [...tasks];

    try {
      const statusTask = tasks.filter((t) => t.status === newStatus);

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
