import axiosInstance from "@/utils/axiosInstance";

const loginService = async (data) => {
  try {
    const response = await axiosInstance.post(`/user/login`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const registerService = async (data) => {
  try {
    const response = await axiosInstance.post(`/user/register`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const forgotPasswordService = async (data) => {
  try {
    const response = await axiosInstance.post(`/user/forgotPassword`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const verifyOtpService = async (data) => {
  try {
    const response = await axiosInstance.post(`/user/verifyOtp`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const changePasswordService = async (data) => {
  try {
    const response = await axiosInstance.post(`/user/changePassword`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getAllRegisteredUsers = async (tripId, token) => {
  try {
    const response = await axiosInstance.get(`/user/getAllRegisteredUsers`, {
      params: { tripId },
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

export {
  loginService,
  registerService,
  forgotPasswordService,
  verifyOtpService,
  changePasswordService,
  getAllRegisteredUsers,
};
