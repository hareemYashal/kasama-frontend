import axiosInstance from "@/utils/axiosInstance";

const createTripService = async (data, token) => {
  try {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const response = await axiosInstance.post(`/trip/createTrip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
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

const getAllTripsWithRole = async (token) => {
  try {
    const response = await axiosInstance.get(`/trip/getAllTripsWithRole`, {
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

export const getTripService = async (tripId) => {
  try {
    const response = await axiosInstance.get(`/trip/getTrip/${tripId}`);
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

export const getTripByIdService = async (tripId, token) => {
  try {
    const response = await axiosInstance.get(`/trip/getTrip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data.activeTrip; // ✅ directly return trip
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
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
export const getNotificationsService = async (tripId) => {
  try {
    const res = await axiosInstance.get(`/notifications/${tripId}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
export {
  createTripService,
  getAllTripsService,
  getAllTripsWithRole,
  getActiveTripService,
  updateTripService,
  deleteTripService,
};
