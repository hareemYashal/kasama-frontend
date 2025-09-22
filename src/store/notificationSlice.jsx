// store/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [], // all notifications
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notif = state.list.find(n => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount -= 1;
      }
    },
    deleteNotification: (state, action) => {
      state.list = state.list.filter(n => n.id !== action.payload);
      state.unreadCount = state.list.filter(n => !n.isRead).length;
    },
    markAllRead: (state) => {
      state.list.forEach(n => (n.isRead = true));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, deleteNotification, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
