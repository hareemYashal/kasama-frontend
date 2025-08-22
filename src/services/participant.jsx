import axiosInstance from "@/utils/axiosInstance";

const totalParticipantsService = async (token, tripId) => {
  try {
    const response = await axiosInstance.get(
      `/participant/getAllParticipants/${tripId}`,
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

const getParticipantsWithContributions = async (token, tripId) => {
  try {
    const response = await axiosInstance.get(
      `/participant/getParticipantsWithContributions?tripId=${tripId}`,
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
export { totalParticipantsService, getParticipantsWithContributions };
