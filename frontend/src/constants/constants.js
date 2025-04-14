import {
  CircleAlertIcon,
  CircleIcon,
  TriangleAlert,
  CircleCheck,
  Clock,
  Loader2,
} from "lucide-react";

// src/constants/constants.js
export const formatStatus = (status) => {
  const statuses = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return statuses[status] || status.toUpperCase(); // Default to uppercase if not in the list
};

export const statusColors = {
  Pending: "bg-yellow-500 text-white",
  "In Progress": "bg-blue-500 text-white",
  Completed: "bg-green-500 text-white",
};

export const statusBorderColors = {
  Pending: "border-l-yellow-500 ",
  "In Progress": "border-l-blue-500 ",
  Completed: "border-l-green-500 ",
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

export const getTaskFilters = (users) => ({
  Status: [
    {
      name: "Pending",
      value: "pending",
      icon: Clock,
      className: "w-4 h-4 text-yellow-500",
    },
    {
      name: "In Progress",
      value: "in_progress",
      icon: Loader2,
      className: "w-4 h-4 text-blue-500",
    },
    {
      name: "Completed",
      value: "completed",
      icon: CircleCheck,
      className: "w-4 h-4 text-green-500 ",
    },
  ],

  Assignee: users?.map((user) => ({
    name: user.name,
    value: user.id,
    icon: user.profile_image,
  })),

  Priority: [
    {
      name: "Low",
      value: "low",
      icon: CircleIcon,
      fill: "currentColor",
      className: "w-3 h-3 text-green-500",
      color: "text-green-500 bg-green-100",
    },
    {
      name: "Medium",
      value: "medium",
      icon: CircleAlertIcon,
      className: "w-5 h-5 text-yellow-500",
      color: "text-yellow-500 bg-yellow-100",
    },
    {
      name: "High",
      value: "high",
      icon: TriangleAlert,
      className: "w-4 h-4 text-red-500",
      color: "text-red-500 bg-red-100",
    },
  ],
});
