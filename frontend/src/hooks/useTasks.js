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

  const moveTask = async (taskId, overId) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    const overIndex = tasks.findIndex((t) => t.id === overId);
    const newTasks = [...tasks];
    newTasks.splice(overIndex, 0, newTasks.splice(taskIndex, 1)[0]);
    dispatch(setAllTasks(newTasks));

    await axiosClient.patch(`/tasks/${taskId}/position`, { position: overId });
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id.toString() === taskId.toString()
          ? { ...task, status: newStatus }
          : task
      );
      dispatch(setAllTasks(updatedTasks));

      await axiosClient.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      // Revert on error
      dispatch(setAllTasks(tasks));
      console.error("Status update failed:", error);
    }
  };

  return { tasks, moveTask, updateStatus };
}
