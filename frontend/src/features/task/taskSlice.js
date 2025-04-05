import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  task: {},
  tasks: [],
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
    setTask: (state, action) => {
      state.task = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
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
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      state.tasks = state.tasks.map((task) =>
        task.id === action.payload.id ? action.payload : task
      );
    },

    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
  },
});

export const {
  setTask,
  setTasks,
  setFilters,
  setPagination,
  addTask,
  updateTask,
  deleteTask,
} = taskSlice.actions;
export default taskSlice.reducer;
