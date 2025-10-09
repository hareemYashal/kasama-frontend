import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Plus,
  Eye,
  Settings,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {format, differenceInDays} from "date-fns";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {
  deleteTripService,
  getActiveTripService,
  getAllTripsService,
  getAllTripsWithRole,
  getTripService,
} from "@/services/trip";
import {useDispatch, useSelector} from "react-redux";
import {setMyTrips, deleteTrip, setActiveTripId} from "@/store/tripSlice";
import {useMutation} from "@tanstack/react-query";
import {toast} from "sonner";
import {setUserRed} from "@/store/userSlice";
import {removeParticipantFromTrip} from "@/services/trip";
import {participantStatusUpdateService} from "@/services/participant";

export default function MyTrips() {
  const navigate = useNavigate();


  const [requestText, setRequestText] = useState("Request");
  const [selectedTripId, setSelectedTripId] = useState(null);

  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const myTrips = useSelector((state) => state.trips.myTrips || []);
  const authUser = useSelector((state) => state.user.user);
  const queryClient = useQueryClient();
  const {mutate: removeParticipant} = useMutation({
    mutationFn: ({token, userId, tripId}) =>
      removeParticipantFromTrip(token, userId, tripId),
    onSuccess: () => {
      toast.success("Participant Removed!");
      queryClient.invalidateQueries(["getAllTripsWithRoleQuery", token]);
    },
    onError: () => toast.error("Failed to Remove"),
  });

  // const tripId = useSelector((state) => state.trips.activeTripId);
  const authToken = useSelector((state) => state.user.token);
  const authUerId = authUser?.id;
  const handleSwitchToTrip = async (tripId) => {
    try {
      console.log("Switching to trip:", tripId);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error switching trip:", error);
    }
  };
  console.log("requestText", requestText);

  const handleCreateNewTrip = () => {
    navigate("/TripCreation");
  };
  const {data, isSuccess} = useQuery({
    queryKey: ["getAllTripsWithRoleQuery", token],
    queryFn: () => getAllTripsWithRole(token),
    enabled: !!token,
  });
  useEffect(() => {
    if (isSuccess && data?.data?.trips) {
      const tripData = data.data.trips;
      dispatch(setMyTrips(tripData));
    }
  }, [isSuccess, data, dispatch]);

  const {mutate} = useMutation({
    mutationFn: ({token, tripId}) => deleteTripService(token, tripId),
    onSuccess: (data, variables) => {
      dispatch(deleteTrip(variables.tripId));
      toast.success(
        data?.message ||
          "The trip was successfully deleted and all associated payments were refunded."
      );
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete the trip.");
    },
  });
  const handleDeleteTrip = async (tripId) => {
    mutate({token, tripId});
  };

  const getTripStatus = (trip) => {
    const today = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (trip.status === "cancelled")
      return {status: "cancelled", color: "bg-red-100 text-red-800"};
    if (today > endDate)
      return {status: "completed", color: "bg-gray-100 text-gray-800"};
    if (today >= startDate)
      return {status: "in progress", color: "bg-yellow-100 text-yellow-800"};
    return {status: "upcoming", color: "bg-green-100 text-green-800"};
  };

  const {mutate: updateMutation, isPending} = useMutation({
    mutationFn: ({authToken, authUerId, tripId, status}) =>
      participantStatusUpdateService(authToken, authUerId, tripId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getAllTripsWithRoleQuery"],
      });
      setRequestText("Wait for Approval");
    },
  });
  useEffect(() => {
    dispatch(setActiveTripId(null));
  }, []);

  const handleRequest = (tripId) => {
    // 1️⃣ Optimistic UI update
    dispatch(
      setMyTrips(
        myTrips.map((trip) =>
          trip.id === tripId ? {...trip, role: "REQUESTED"} : trip
        )
      )
    );
    setRequestText("Wait for Approval");

    // 2️⃣ Trigger API call
    let status = "REQUESTED";
    updateMutation({authToken, authUerId, tripId, status});
  };

  const getButtonConfig = (trip) => {
    // 🔒 If trip is ended and user is not creator
    // if (trip.status === "ended" && trip.role !== "creator") {
    //   return {
    //     text: "Trip Ended",
    //     color: "bg-gray-400 cursor-not-allowed",
    //     icon: <Archive className="w-4 h-4 mr-1" />,
    //     disabled: true,
    //   };
    // }

    // ⏳ Check booking deadline
    const isBookingClosed = trip.daysUntilTrip <= trip.booking_deadline;

    switch (trip.role) {
      case "creator":
        return {
          text: "Manage Dashboard",
          color: "bg-green-600 hover:bg-green-700",
          icon: <Settings className="w-4 h-4 mr-1" />,
          disabled: false,
        };
      case "participant":
        return {
          text: "View Dashboard",
          color: "bg-blue-600 hover:bg-blue-700",
          icon: <Eye className="w-4 h-4 mr-1" />,
          disabled: false,
        };
      // case "REQUESTED":
      //   return {
      //     text: "Requested (Waiting for Approval)",
      //     color: "bg-yellow-600 hover:bg-yellow-700",
      //     icon: <Clock className="w-4 h-4 mr-1" />,
      //     disabled: false,
      //   };
      // case "INVITED":
      //   return {
      //     text: isBookingClosed ? "Booking Closed" : "Accept Invitation",
      //     color: isBookingClosed
      //       ? "bg-gray-400 cursor-not-allowed"
      //       : "bg-teal-600 hover:bg-teal-700",
      //     icon: <Plus className="w-4 h-4 mr-1" />,
      //     disabled: isBookingClosed,
      //   };
      // case "REJECTED":
      //   return {
      //     text: "Rejected",
      //     color: "bg-red-600 hover:bg-red-700",
      //     icon: <X className="w-4 h-4 mr-1" />,
      //     disabled: true,
      //   };
      // case "notInvited":
      //   return {
      //     text: isBookingClosed ? "Booking Closed" : "Request to Join",
      //     color: isBookingClosed
      //       ? "bg-gray-400 cursor-not-allowed"
      //       : "bg-purple-600 hover:bg-purple-700",
      //     icon: <Plus className="w-4 h-4 mr-1" />,
      //     disabled: isBookingClosed,
      //   };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-600 hover:bg-gray-700",
          icon: null,
          disabled: true,
        };
    }
  };
  useEffect(() => {
    // Check localStorage first
    const storedTripId = localStorage.getItem("selectedTripId");
    if (storedTripId) {
      setSelectedTripId(Number(storedTripId)); // ya string, depending on your trip.id type
    } else if (myTrips.length > 0) {
      // If no stored trip, set first trip as default
      setSelectedTripId(myTrips[0].id);
      localStorage.setItem("selectedTripId", myTrips[0].id);
    }
  }, [myTrips]);
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                My Trips
              </h1>
              <p className="text-xl text-slate-600">
                Manage all your group travel adventures
              </p>
            </div>

            <Button
              onClick={handleCreateNewTrip}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Trip
            </Button>
          </div>
        </div>

        {/* Trips Grid */}
        {myTrips.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No trips created yet
              </h3>
              <p className="text-slate-500 mb-6">
                Start planning your first group adventure
              </p>
              <Button
                onClick={handleCreateNewTrip}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTrips.length > 0 ? (
              myTrips.map((trip) => {
                // const tripStatus = getTripStatus(trip);
                // const isCurrentTrip = activeTripData?.data?.activeTrip?.id;
                // const daysUntil = getDaysUntilTrip(trip.start_date);
                // const isDeletable = canDeleteTrip(trip.id);

                return (
                  <Card
                    key={trip.id}
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      localStorage.setItem("selectedTripId", trip.id); // save in localStorage
                    }} // ✅ sirf local highlight
                    className={`bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
     ${trip.id === selectedTripId ? "ring-2 ring-blue-500 border-blue-300" : ""}
  `}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={
                              trip.status === "upcoming"
                                ? "bg-[#dcfce7] text-[#166534]"
                                : trip.status === "ongoing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {trip.status}
                          </Badge>

                          {trip.id === selectedTripId && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Current
                            </Badge>
                          )}
                          {trip.role === "creator" ||
                          trip.role === "co-admin" ? (
                            <Badge className="border rounded-full border-[#e5e7eb] bg-transparent text-black">
                              <span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="lucide lucide-crown w-3 h-3 mr-1.5"
                                  data-filename="pages/MyTrips"
                                  data-linenumber="336"
                                  data-visual-selector-id="pages/MyTrips336"
                                  data-source-location="pages/MyTrips:336:37"
                                  data-dynamic-content="false"
                                >
                                  <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                                  <path d="M5 21h14"></path>
                                </svg>
                              </span>{" "}
                              {trip.role === "creator" ? "Admin" : "Co-Admin"}
                            </Badge>
                          ) : (
                            <Badge className="border rounded-full border-[#e5e7eb] bg-transparent text-black">
                              <span>
                                <UserCheck className="w-3 h-3 mr-1.5" />
                              </span>{" "}
                              Participant
                            </Badge>
                          )}
                        </div>

                        {trip.role == "creator" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8

                            `}
                              >
                                <Trash2 color="red" className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {trip.trip_occasion}"? This action cannot be
                                  undone.
                                  {/* {!isDeletable && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-red-800 font-medium">
                                    ⚠️ This trip cannot be deleted because funds
                                    have already been contributed.
                                  </p>
                                </div>
                              )} */}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTrip(trip.id)}
                                  // disabled={
                                  //   !isDeletable || deletingTripId === trip.id
                                  // }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {/* {deletingTripId === trip.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : null} */}
                                  Delete Trip
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {trip.role !== "creator" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8

                            `}
                              >
                                <X color="red" className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Leave Trip</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to leave "
                                  {trip.trip_occasion}"? This action cannot be
                                  undone.
                                  {/* {!isDeletable && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-red-800 font-medium">
                                    ⚠️ This trip cannot be deleted because funds
                                    have already been contributed.
                                  </p>
                                </div>
                              )} */}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    removeParticipant({
                                      token,
                                      userId: authUser.id,
                                      tripId: trip.id,
                                    });
                                  }}
                                  // disabled={
                                  //   !isDeletable || deletingTripId === trip.id
                                  // }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {/* {deletingTripId === trip.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                ) : null} */}
                                  Leave Trip
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {/* Delete Button */}
                      </div>

                      <CardTitle className="text-xl font-bold text-slate-800 mb-2">
                        {trip.trip_occasion}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {trip.destination}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Trip Dates */}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(trip.start_date), "MMM d")} -{" "}
                        {format(new Date(trip.end_date), "MMM d, yyyy")}
                      </div>

                      <div className="bg-[#F8FaFC] p-2 text-[#16A34A] text-sm font-samibold">
                        💰 {(trip?.totalContributed).toFixed(2)} contributed
                      </div>

                      <div className="text-center bg-blue-50 rounded-lg p-3 text-blue-600 text-sm">
                        <span className="text-blue-600 font-bold text-2xl">
                          {trip?.daysUntilTrip}
                        </span>
                        <br />
                        days until trip
                      </div>

                      {/* Action Button */}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTripId(trip.id); // highlight clicked trip
                            localStorage.setItem("selectedTripId", trip.id); // save in localStorage

                            if (
                              trip.role === "creator" ||
                              trip.role === "co-admin"
                            ) {
                              const updatedUser = {
                                ...authUser,
                                trip_role: trip.role,
                              };
                              dispatch(setUserRed(updatedUser));
                              localStorage.setItem(
                                "user",
                                JSON.stringify(updatedUser)
                              );
                              dispatch(setActiveTripId(trip.id));
                              localStorage.setItem(
                                "activeTripId",
                                JSON.stringify(trip.id)
                              );
                              navigate(`/dashboard`);
                            } else if (trip.role === "participant") {
                              const updatedUser = {
                                ...authUser,
                                trip_role: "participant",
                              };
                              dispatch(setUserRed(updatedUser));
                              localStorage.setItem(
                                "user",
                                JSON.stringify(updatedUser)
                              );
                              dispatch(setActiveTripId(trip.id));
                              localStorage.setItem(
                                "activeTripId",
                                JSON.stringify(trip.id)
                              );
                              navigate(`/participantdashboard`);
                            } else if (trip.role === "participant") {
                              const updatedUser = {
                                ...authUser,
                                trip_role: "participant",
                              };
                              dispatch(setUserRed(updatedUser));
                              localStorage.setItem(
                                "user",
                                JSON.stringify(updatedUser)
                              );
                              dispatch(setActiveTripId(trip.id));
                              localStorage.setItem(
                                "activeTripId",
                                JSON.stringify(trip.id)
                              );
                              navigate(`/participantdashboard`);
                            } else if (trip.role === "notInvited") {
                              handleRequest(trip.id);
                            } else if (trip.role === "INVITED") {
                              updateMutation({
                                authToken,
                                authUerId,
                                tripId: trip.id,
                                status: "ACCEPTED",
                              });
                            }
                          }}
                          className={`flex-1 flex items-center justify-center gap-1 ${
                            trip.id === selectedTripId
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          {trip.id === selectedTripId
                            ? "View Dashboard"
                            : "Switch To"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <>null</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
