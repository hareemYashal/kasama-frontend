import { createSlice } from "@reduxjs/toolkit";

export const expenseSlice = createSlice({
  name: "expenses",
  initialState: {
    expensesList: [],
  },
  reducers: {
    setExpensesList: (state, action) => {
      state.expensesList = action.payload;
    },
    deleteExpenseRed: (state, action) => {
      const expenseId = action.payload;
      state.expensesList = state.expensesList.filter(
        (expense) => expense.id !== expenseId
      );
    },
  },
});

export const { setExpensesList, deleteExpenseRed } = expenseSlice.actions;
export default expenseSlice.reducer;
