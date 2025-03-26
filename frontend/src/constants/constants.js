// src/constants/constants.js
export const formatStatus = (status) => {
  const statuses = {
    pending: "PENDING",
    in_progress: "IN_PROGRESS",
    completed: "COMPLETED",
  };

  return statuses[status] || status.toUpperCase(); // Default to uppercase if not in the list
};
