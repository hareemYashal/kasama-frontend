import axiosInstance from "@/utils/axiosInstance";

// ✅ Create Itinerary
const createItineraryService = async (token, data) => {
console.log('itinerarry data ',data)
  const response = await axiosInstance.post(`/itinerary/createItinerary`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ✅ Get All Itineraries for a Trip
const getItinerariesService = async (token, tripId) => {
  const response = await axiosInstance.get(
    `/itinerary/getItineraies/${tripId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// ✅ Update Itinerary
const updateItineraryService = async (token, itineraryId, data) => {
  const response = await axiosInstance.put(
    `/itinerary/updateItinerary/${itineraryId}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// ✅ Delete Itinerary
const deleteItineraryService = async (token, itineraryId) => {
  const response = await axiosInstance.delete(
    `/itinerary/deleteItinerary/${itineraryId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export {
  createItineraryService,
  getItinerariesService,
  updateItineraryService,
  deleteItineraryService,
};
