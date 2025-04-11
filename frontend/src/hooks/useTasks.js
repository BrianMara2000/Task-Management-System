import { axiosClient } from "@/axios";
import axios from "axios";
import { useState, useEffect } from "react";

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axiosClient.get(
        `/projects/${projectId}/tasks/board`
      );
      setTasks(response.data.data);
    };
    fetchTasks();
  }, []);

  const moveTask = async (taskId, overId) => {
    // Optimistic update
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      const overIndex = prev.findIndex((t) => t.id === overId);
      const newTasks = [...prev];
      newTasks.splice(overIndex, 0, newTasks.splice(taskIndex, 1)[0]);
      return newTasks;
    });

    // API call
    await axiosClient.patch(`/tasks/${taskId}/position`, { position: overId });
  };

  const updateStatus = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // API call
    await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
  };

  return { tasks, moveTask, updateStatus };
}
