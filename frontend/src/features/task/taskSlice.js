import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  allTasks: [],
  filters: {
    search: "",
    status: [],
    priority: [],
    assignee: [],
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    links: "",
  },
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setAllTasks: (state, action) => {
      state.allTasks = action.payload;
    },
    setFilters: (state, action) => {
      // This will merge the new filters with existing ones
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    // Add a new reducer to clear specific filters if needed
    clearFilter: (state, action) => {
      const { category } = action.payload;
      state.filters = {
        ...state.filters,
        [category]: [],
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateTask: (state, action) => {
      state.tasks = state.tasks.map((task) =>
        task.id === action.payload.id ? action.payload : task
      );

      state.allTasks = state.allTasks.map((task) =>
        task.id === action.payload.id ? action.payload : task
      );
    },

    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);

      state.allTasks = state.allTasks.filter(
        (task) => task.id !== action.payload
      );
    },

    updateTaskPosition: (state, action) => {
      const { taskId, newPosition, newStatus } = action.payload;
      const id = Number(taskId);
      console.log("Position change");
      state.allTasks = state.allTasks.map((task) =>
        task.id === id
          ? { ...task, position: newPosition, status: newStatus }
          : task
      );
    },
  },
});

export const {
  setTasks,
  setAllTasks,
  setFilters,
  setPagination,
  addTask,
  updateTask,
  deleteTask,
  updateTaskPosition,
} = taskSlice.actions;
export default taskSlice.reducer;
