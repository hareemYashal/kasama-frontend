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

const participantTripCheck = async (token, userId, tripId) => {
  try {
    const response = await axiosInstance.get(
      `/participant/participantTripCheck?userId=${userId}&tripId=${tripId}`,
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

const getAllTripParticipantsService = async (token, tripId) => {
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

const addParticipantService = async (token, data) => {
  try {
    const response = await axiosInstance.post(
      `/participant/addParticipant`,
      data,
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

const participantStatusUpdateService = async (
  token,
  userId,
  tripId,
  status
) => {
  try {
    const response = await axiosInstance.put(
      `/participant/participantStatus?userId=${userId}&tripId=${tripId}`,
      { status },
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

const removeParticipantService = async (token, userId, tripId) => {
  try {
    const response = await axiosInstance.delete(
      `/participant/deleteParticipant?userId=${userId}&tripId=${tripId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};
export {
  addParticipantService,
  totalParticipantsService,
  getParticipantsWithContributions,
  participantTripCheck,
  getAllTripParticipantsService,
  participantStatusUpdateService,
  removeParticipantService,
};
