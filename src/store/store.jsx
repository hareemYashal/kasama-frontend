import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import tripReducer from "./tripSlice";
import expenseReducer from "./expenseSlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    trips: tripReducer,
    expenses: expenseReducer,
    notifications: notificationReducer,
  },
});
