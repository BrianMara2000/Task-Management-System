import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
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

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action) => {
      state.projects = state.projects.map((project) =>
        project.id === action.payload.id ? action.payload : project
      );
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(
        (project) => project.id !== action.payload
      );
    },
  },
});

export const {
  setProjects,
  setFilters,
  setPagination,
  addProject,
  updateProject,
  deleteProject,
} = projectSlice.actions;
export default projectSlice.reducer;
