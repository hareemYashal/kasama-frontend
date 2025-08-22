import { createSlice } from "@reduxjs/toolkit";

export const tripSlice = createSlice({
  name: "trips",
  initialState: {
    myTrips: [],
    activeTripId: JSON.parse(localStorage.getItem("activeTripId")) || null,
  },
  reducers: {
    setMyTrips: (state, action) => {
      state.myTrips = action.payload;
    },
    deleteTrip: (state, action) => {
      const tripId = action.payload;
      state.myTrips = state.myTrips.filter((trip) => trip.id !== tripId);
    },
    setActiveTripId: (state, action) => {
      state.activeTripId = action.payload;
    },
  },
});

export const { setMyTrips, deleteTrip, setActiveTripId } = tripSlice.actions;

export default tripSlice.reducer;
