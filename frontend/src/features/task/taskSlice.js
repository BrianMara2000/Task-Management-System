import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  task: {},
  tasks: [],
  filters: {
    search: "",
    role: "",
    status: "",
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
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      state.tasks = state.tasks
        .map((task) => (task.id === action.payload.id ? action.payload : task))
        .filter((task) => {
          return state.filters.status
            ? task.status === state.filters.status
            : true;
        });
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
