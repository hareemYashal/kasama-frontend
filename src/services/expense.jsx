import axiosInstance from "@/utils/axiosInstance";

const getExpenseByTripIdService = async (token, tripId) => {
  try {
    const response = await axiosInstance.get(`/expense/getExpense/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getExpenseListService = async (tripId, token) => {
  try {
    const response = await axiosInstance.get(
      `/expense/getListofTripExpenses?tripId=${tripId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteExpenseService = async (token, expenseId) => {
  try {
    const response = await axiosInstance.delete(
      `/expense/deleteExpense/${expenseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createExpenseService = async (token, data) => {
  try {
    const response = await axiosInstance.post(`/expense/createExpense`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export {
  createExpenseService,
  getExpenseByTripIdService,
  getExpenseListService,
  deleteExpenseService,
};
