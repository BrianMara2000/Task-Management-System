import { axiosClient } from "@/axios";
import { setAllTasks, updateTaskPosition } from "@/features/task/taskSlice";
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

  const moveTask = async (taskId, targetId, status, isBelow) => {
    console.log(isBelow, targetId);
    const taskToMove = tasks.find((t) => t.id == taskId);

    if (!taskToMove) return;

    const statusTasks = tasks
      .filter((t) => t.status === status && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const targetIndex = statusTasks.findIndex((t) => t.id == targetId);
    if (targetIndex === -1) return;

    const targetTask = statusTasks[targetIndex] || null;
    const previousTask = statusTasks[targetIndex - 1] || null;
    const nextTask = statusTasks[targetIndex + 1] || null;

    const targetTaskPosition = parseFloat(targetTask.position || 0);
    const previousTaskPosition = parseFloat(previousTask?.position) || 0;
    const nextTaskPosition = parseFloat(nextTask?.position) || 0;

    let newPosition;

    if (previousTask && nextTask) {
      if (isBelow) {
        newPosition = (previousTaskPosition + targetTaskPosition) / 2;
        console.log("newPosition: ", newPosition);
      } else {
        newPosition = (nextTaskPosition + targetTaskPosition) / 2;
        console.log("newPosition: ", newPosition);
      }
    } else if (previousTask && !nextTask) {
      console.log("first");
      newPosition = targetTaskPosition + 100;
      console.log("new position: ", newPosition);
    } else if (!previousTask && nextTask) {
      console.log("second");
      newPosition = targetTaskPosition - 100;
    } else {
      console.log("last");
      newPosition = 1000;
    }

    // console.log("Updated task position: ", newPosition);
    // console.log("Target index: ", targetIndex);
    // console.log("Previous task: ", previousTask);
    // console.log("Next task: ", nextTask);

    dispatch(
      updateTaskPosition({
        taskId,
        newPosition,
        newStatus: status,
      })
    );

    // Optionally sync with backend
    await axiosClient.patch(`/tasks/${taskId}/position`, {
      position: newPosition,
      status,
      targetId,
    });
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
