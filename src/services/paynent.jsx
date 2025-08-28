import axiosInstance from "@/utils/axiosInstance";

const getPaymentRemainingsService = async (token, tripId, userId) => {
  try {
    const response = await axiosInstance(
      `/payment/getPaymentRemainings?tripId=${tripId}&userId=${userId}`,
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

export { getPaymentRemainingsService };
