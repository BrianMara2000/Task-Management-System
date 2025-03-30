// src/constants/constants.js
export const formatStatus = (status) => {
  const statuses = {
    pending: "Pending",
    in_progress: "In_Progress",
    completed: "Completed",
  };

  return statuses[status] || status.toUpperCase(); // Default to uppercase if not in the list
};
