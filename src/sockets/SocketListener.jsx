import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "@/socket";
import { setUserRed } from "@/store/userSlice";
import { setActiveTripId } from "@/store/tripSlice";
import { useQueryClient } from "@tanstack/react-query";

export default function SocketListener() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const authUser = useSelector((state) => state.user.user);
  const activeTripId = useSelector((state) => state.trips.activeTripId);
  const activeTripIdLocal =
    activeTripId || JSON.parse(localStorage.getItem("activeTripId"));

  useEffect(() => {
    socket.on("role_updated", async (data) => {
      console.log("socket listening", data);

      if (data.userId !== authUser?.id) return;

      // Always refresh trips API
      await queryClient.invalidateQueries(["getAllTripsWithRoleQuery"]);

      // Only handle role removal and redirect if active trip matches
      if (data.tripId === activeTripIdLocal) {
        const { trip_role, ...userWithoutRole } = authUser;

        // Update Redux user (without trip_role)
        dispatch(setUserRed(userWithoutRole));

        // Remove selected trip and active trip from localStorage
        localStorage.removeItem("selectedTripId");
        localStorage.removeItem("activeTripId");

        // Clear activeTripId in Redux
        dispatch(setActiveTripId(null));

        // Redirect user to MyTrips page
        navigate("/mytrips");
      }
    });

    return () => {
      socket.off("role_updated");
    };
  }, [authUser, activeTripId, dispatch, navigate, queryClient]);

  return null;
}
