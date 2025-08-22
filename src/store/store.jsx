import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import tripReducer from "./tripSlice";
import expenseReducer from "./expenseSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    trips: tripReducer,
    expenses: expenseReducer,
  },
});
