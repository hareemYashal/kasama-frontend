import axiosInstance from "@/utils/axiosInstance";

export const getNotificationsService = async (tripId, token) => {
  try {
    const res = await axiosInstance.get(`/notifications`, {
      params: { tripId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

// ✅ Mark notification as read
export const markAsReadService = async (id, token) => {
  try {
    const res = await axiosInstance.patch(
      `/notifications/${id}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const deleteNotificationService = async (notifId, token) => {
  try {
    const res = await axiosInstance.delete(`/notifications/${notifId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
