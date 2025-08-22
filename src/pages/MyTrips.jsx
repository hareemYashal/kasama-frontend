import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trip } from "@/api/entities";
import { User } from "@/api/entities";
import { Contribution } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  Eye,
  Settings,
  Archive,
  Trash2,
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
import { format, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  deleteTripService,
  getActiveTripService,
  getAllTripsService,
} from "@/services/trip";
import { useDispatch, useSelector } from "react-redux";
import { setMyTrips, deleteTrip } from "@/store/tripSlice";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function MyTrips() {
  // const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  // const [trips, setTrips] = useState([]);
  // const [contributions, setContributions] = useState({});
  // const [loading, setLoading] = useState(true);
  // const [deletingTripId, setDeletingTripId] = useState(null);

  // useEffect(() => {
  //   loadUserTrips();
  // }, []);

  // const loadUserTrips = async () => {
  //   try {
  //     const currentUser = await User.me();
  //     setUser(currentUser);

  //     // Get all trips where user is admin
  //     const adminTrips = await Trip.filter({ admin_id: currentUser.id }, "-created_date");
  //     setTrips(adminTrips);

  //     // Load contributions for each trip to check if funds have been contributed
  //     const contributionsMap = {};
  //     for (const trip of adminTrips) {
  //       const tripContributions = await Contribution.filter({ trip_id: trip.id });
  //       const totalContributed = tripContributions.reduce((sum, contrib) => sum + contrib.amount_paid, 0);
  //       contributionsMap[trip.id] = {
  //         totalContributed,
  //         hasContributions: totalContributed > 0
  //       };
  //     }
  //     setContributions(contributionsMap);

  //   } catch (error) {
  //     console.error("Error loading trips:", error);
  //     navigate(createPageUrl("Home"));
  //   }
  //   setLoading(false);
  // };

  // const handleSwitchToTrip = async (tripId) => {
  //   try {
  //     await User.updateMyUserData({
  //       current_trip_id: tripId,
  //       trip_role: 'admin'
  //     });
  //     navigate(createPageUrl("Dashboard"));
  //   } catch (error) {
  //     console.error("Error switching trip:", error);
  //   }
  // };

  // const handleCreateNewTrip = () => {
  //   navigate(createPageUrl("TripCreation"));
  // };

  // const handleDeleteTrip = async (tripId) => {
  //   setDeletingTripId(tripId);
  //   try {
  //     // Delete the trip
  //     await Trip.delete(tripId);

  //     // If this was the current trip, clear it from user data
  //     if (user.current_trip_id === tripId) {
  //       await User.updateMyUserData({
  //         current_trip_id: null,
  //         trip_role: null
  //       });
  //     }

  //     // Reload trips list
  //     loadUserTrips();
  //   } catch (error) {
  //     console.error("Error deleting trip:", error);
  //   }
  //   setDeletingTripId(null);
  // };

  // const getTripStatus = (trip) => {
  //   const today = new Date();
  //   const startDate = new Date(trip.start_date);
  //   const endDate = new Date(trip.end_date);

  //   if (trip.status === 'cancelled') return { status: 'cancelled', color: 'bg-red-100 text-red-800' };
  //   if (today > endDate) return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
  //   if (today >= startDate) return { status: 'in progress', color: 'bg-yellow-100 text-yellow-800' };
  //   return { status: 'upcoming', color: 'bg-green-100 text-green-800' };
  // };

  // const getDaysUntilTrip = (startDate) => {
  //   const days = differenceInDays(new Date(startDate), new Date());
  //   return days > 0 ? days : 0;
  // };

  // const canDeleteTrip = (tripId) => {
  //   const tripContributions = contributions[tripId];
  //   return tripContributions && !tripContributions.hasContributions;
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingTripId, setDeletingTripId] = useState(null);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const myTrips = useSelector((state) => state.trips.myTrips || []);
  console.log("hey I am the My Trips", myTrips);
  console.log(setMyTrips, "Hey I am the SetMyTrips");

  // Dummy Data
  const dummyUser = {
    id: "u-123",
    current_trip_id: "trip-1",
    trip_role: "admin",
  };

  const dummyTrips = [
    {
      id: "trip-1",
      name: "Beach Getaway",
      start_date: "2025-08-01",
      end_date: "2025-08-05",
      status: "upcoming",
    },
    {
      id: "trip-2",
      name: "Mountain Hike",
      start_date: "2025-06-01",
      end_date: "2025-06-10",
      status: "completed",
    },
  ];

  const dummyContributionsMap = {
    "trip-1": { totalContributed: 1200, hasContributions: true },
    "trip-2": { totalContributed: 0, hasContributions: false },
  };

  useEffect(() => {
    const loadDummyData = () => {
      setUser(dummyUser);
      setTrips(dummyTrips);
      setContributions(dummyContributionsMap);
      setLoading(false);
    };

    const timeout = setTimeout(loadDummyData, 1000); // simulate loading
    return () => clearTimeout(timeout);
  }, []);

  const handleSwitchToTrip = async (tripId) => {
    try {
      console.log("Switching to trip:", tripId);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error switching trip:", error);
    }
  };

  const handleCreateNewTrip = () => {
    navigate("/TripCreation");
  };
  const { data, isSuccess } = useQuery({
    queryKey: ["getAllTripsQuery", token],
    queryFn: () => getAllTripsService(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (isSuccess && data?.data?.trips) {
      const tripData = data.data.trips;
      dispatch(setMyTrips(tripData));
    }
  }, [isSuccess, data, dispatch]);

  const { data: activeTripData, isSuccess: activeTripSuccess } = useQuery({
    queryKey: ["getActiveTrip", token],
    queryFn: () => getActiveTripService(token),
    enabled: !!token,
  });
  console.log(activeTripData);
  console.log(data?.data?.trips, "Hey  I am the All Trips");
  console.log("Heyyyyyyyy", myTrips);
  const { mutate } = useMutation({
    mutationFn: ({ token, tripId }) => deleteTripService(token, tripId),
    onSuccess: (_, variables) => {
      dispatch(deleteTrip(variables.tripId));
      toast.success("Trip Deleted Successfully");
    },
  });
  const handleDeleteTrip = async (tripId) => {
    mutate({ token, tripId });
  };

  const getTripStatus = (trip) => {
    const today = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (trip.status === "cancelled")
      return { status: "cancelled", color: "bg-red-100 text-red-800" };
    if (today > endDate)
      return { status: "completed", color: "bg-gray-100 text-gray-800" };
    if (today >= startDate)
      return { status: "in progress", color: "bg-yellow-100 text-yellow-800" };
    return { status: "upcoming", color: "bg-green-100 text-green-800" };
  };

  const getDaysUntilTrip = (startDate) => {
    const days = differenceInDays(new Date(startDate), new Date());
    return days > 0 ? days : 0;
  };

  const canDeleteTrip = (tripId) => {
    const tripContributions = contributions[tripId];
    return tripContributions && !tripContributions.hasContributions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                const isCurrentTrip = activeTripData?.data?.activeTrip?.id;
                // const daysUntil = getDaysUntilTrip(trip.start_date);
                // const isDeletable = canDeleteTrip(trip.id);

                return (
                  <Card
                    key={trip.id}
                    className={`bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 
                       ${
                         trip.id === isCurrentTrip
                           ? "ring-2 ring-blue-500 border-blue-300"
                           : ""
                       }
                  `}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          {isCurrentTrip && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Current
                            </Badge>
                          )}
                        </div>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8  
                            
                            `}
                              // disabled={!isDeletable}
                              // title={
                              //   isDeletable
                              //     ? "Delete trip"
                              //     : "Cannot delete trip - funds have been contributed"
                              // }
                            >
                              <Trash2 className="w-4 h-4" />
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
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(trip.start_date), "MMM d")} -{" "}
                        {format(new Date(trip.end_date), "MMM d, yyyy")}
                      </div>

                      {/* Contribution Status */}
                      {/* {contributions[trip.id] && (
                      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
                        {contributions[trip.id].hasContributions ? (
                          <span className="text-green-600">
                            💰 $
                            {contributions[trip.id].totalContributed.toFixed(2)}{" "}
                            contributed
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            No contributions yet
                          </span>
                        )}
                      </div>
                    )} */}

                      {/* {tripStatus.status === "upcoming" && daysUntil > 0 && (
                      <div className="text-center bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">
                          {daysUntil}
                        </div>
                        <div className="text-sm text-blue-600">
                          days until trip
                        </div>
                      </div>
                    )} */}

                      <div className="flex gap-2">
                        {/* {!isCurrentTrip &&
                        tripStatus.status !== "completed" &&
                        tripStatus.status !== "cancelled" && (
                          <Button
                            onClick={() => handleSwitchToTrip(trip.id)}
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Switch To
                          </Button>
                        )} */}

                        {/* {isCurrentTrip && (
                        <Button
                          onClick={() => navigate(createPageUrl("Dashboard"))}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Dashboard
                        </Button>
                      )} */}
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
