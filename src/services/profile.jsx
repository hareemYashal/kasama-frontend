import axiosInstance from "@/utils/axiosInstance";

export const saveProfileService = async (data, token) => {
  try {
    const response = await axiosInstance.post("/profile", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfileService = async (token) => {
  try {
    const response = await axiosInstance.get("/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
