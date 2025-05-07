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

  const moveTask = async (taskId, targetId, status, isBelow, targetItems) => {
    const previousTasks = [...tasks];
    console.log("targetItems: ", targetItems);
    try {
      let newPosition;
      const taskToMove = tasks.find((t) => t.id == taskId);

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
        .map((id) => tasks.find((task) => task.id.toString() === id))
        .filter(Boolean);

      console.log("Status tasks: ", statusTasks);
      console.log("targetId: ", targetId);
      const targetIndex = statusTasks.findIndex((t) => t.id == targetId);

      console.log("targetIndex: ", targetIndex);
      if (targetIndex === -1) return;

      const targetTask = statusTasks[targetIndex] || null;
      const previousTask = statusTasks[targetIndex - 1] || null;
      const nextTask = statusTasks[targetIndex + 1] || null;

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
        newPosition = 1000;
      }

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

  return { tasks, moveTask };
}
