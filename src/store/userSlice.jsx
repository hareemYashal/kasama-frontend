import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: JSON.parse(localStorage.getItem("token")) || null,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserRed: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setToken, setUserRed } = userSlice.actions;

export default userSlice.reducer;
