import axiosInstance from "@/utils/axiosInstance";

const createTripService = async (data, token) => {
  try {
    const response = await axiosInstance.post(`/trip/createTrip`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllTripsService = async (token) => {
  try {
    const response = await axiosInstance.get(`/trip/getAllTrips`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getActiveTripService = async (token) => {
  try {
    const response = await axiosInstance.get(`/trip/getActiveTrip`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateTripService = async (data, tripId, token) => {
  try {
    const response = await axiosInstance.put(
      `/trip/updateTrip/${tripId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteTripService = async (token, tripId) => {
  try {
    const respponse = await axiosInstance.delete(`/trip/deleteTrip/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return respponse.data;
  } catch (error) {
    throw error;
  }
};
export {
  createTripService,
  getAllTripsService,
  getActiveTripService,
  updateTripService,
  deleteTripService,
};
