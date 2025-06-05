import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  comments: [],
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    setComments: (state, action) => {
      state.comments = action.payload;
    },
    addComment: (state, action) => {
      const { comment } = action.payload;
      state.comments.push(comment);
    },
    removeComment: (state, action) => {
      const tempId = action.payload;
      state.comments = state.comments.filter(
        (comment) => comment.id !== tempId
      );
    },
  },
});

export const { setComments, addComment, removeComment } = commentSlice.actions;
export default commentSlice.reducer;
