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

  const moveTask = async (taskId, targetId) => {
    try {
      const taskIndex = tasks.findIndex((t) => t.id == taskId);
      const overIndex = tasks.findIndex((t) => t.id == targetId);
      const newTasks = [...tasks].map((task) => ({ ...task }));
      newTasks.splice(overIndex, 0, newTasks.splice(taskIndex, 1)[0]);

      dispatch(setAllTasks(newTasks));
      await axiosClient.patch(`/tasks/${taskId}/position`, {
        targetId,
      });
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  const updateStatus = async (taskId, newStatus, targetId) => {
    const previousTasks = [...tasks];

    try {
      const taskIndex = tasks.findIndex((t) => t.id == taskId);
      const overIndex = tasks.findIndex((t) => t.id == targetId);
      const newTasks = [...tasks].map((task) => ({ ...task }));

      newTasks[taskIndex].status = newStatus;

      const [movedTask] = newTasks.splice(taskIndex, 1);
      newTasks.splice(overIndex, 0, movedTask);
      newTasks.splice(overIndex, 0, newTasks.splice(taskIndex, 1)[0]);

      dispatch(setAllTasks(newTasks));

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
