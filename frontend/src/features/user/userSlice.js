import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  filters: {
    search: "",
    role: "",
    status: "",
  },
  pagination: {
    page: 1,
    pageSize: null,
    total: 0, // ✅ Added total count
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) state.users[index] = action.payload;
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
    },
  },
});

export const {
  setUsers,
  setFilters,
  setPagination,
  addUser,
  updateUser,
  deleteUser,
} = userSlice.actions;
export default userSlice.reducer;
