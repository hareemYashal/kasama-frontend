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
const deleteExpenseService = async (token, expenseId, tripId) => {
  try {
    const response = await axiosInstance.delete(
      `/expense/deleteExpense/${expenseId}?tripId=${tripId}`,
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

const updateExpenseService = (token, expenseId, data) => {
  return axiosInstance.put(`/expense/updateExpense/${expenseId}`, data, {
    headers: {Authorization: `Bearer ${token}`},
  });
};

const getExpenseByIdService = async (token, expenseId) => {
  try {
    const response = await axiosInstance.get(
      `/expense/getExpenseById/${expenseId}`,
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
const getFileUrl = async (BASE_URL, token, fileKey) => {
  const sanitizedKey = fileKey.startsWith("/") ? fileKey.slice(1) : fileKey;

  const endpoint = `${BASE_URL}/files/signed-url/${sanitizedKey}`;

  const res = await fetch(endpoint, {
    method: "GET",
    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();

  if (json?.success && json?.data?.url) {
    const result = json.data.url;
    return result;
  }

  return null;
};

export {
  createExpenseService,
  updateExpenseService,
  getExpenseByIdService,
  getExpenseByTripIdService,
  getExpenseListService,
  deleteExpenseService,
  getFileUrl,
};
