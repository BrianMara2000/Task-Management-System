// src/constants/constants.js
export const formatStatus = (status) => {
  const statuses = {
    pending: "Pending",
    in_progress: "In_Progress",
    completed: "Completed",
  };

  return statuses[status] || status.toUpperCase(); // Default to uppercase if not in the list
};

export const statusColors = {
  Pending: "bg-yellow-500 text-white",
  In_Progress: "bg-blue-500 text-white",
  Completed: "bg-green-500 text-white",
};

export const getColorFromName = (name) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  // Hash the name to pick a consistent color
  const hash = name
    ?.split("")
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

export const formatPriority = (priority) => {
  const priorities = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return priorities[priority] || priority.toUpperCase();
};

export const priorityColors = {
  Low: "text-green-500",
  Medium: "text-yellow-500",
  High: "text-red-500",
};
