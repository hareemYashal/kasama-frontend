// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { createPageUrl } from "@/utils";
// import { Trip } from "@/api/entities";
// import { User } from "@/api/entities";
// import { Itinerary as ItineraryEntity } from "@/api/entities";
// import { TripActivity } from "@/api/entities";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Calendar,
//   Clock,
//   Plus,
//   Edit,
//   Trash2,
//   ChevronDown,
//   ChevronRight,
//   MapPin,
//   ArrowLeft,
// } from "lucide-react";
// import { format, parseISO, isWithinInterval } from "date-fns";
// import ItineraryForm from "../components/itinerary/ItineraryForm";
// import ItineraryDayGroup from "../components/itinerary/ItineraryDayGroup";

// export default function Itinerary() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [trip, setTrip] = useState(null);
//   const [itineraryItems, setItineraryItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [expandedDays, setExpandedDays] = useState(new Set());

//   useEffect(() => {
//     loadItineraryData();
//   }, []);

//   const loadItineraryData = async () => {
//     setLoading(true);
//     try {
//       // Dummy user
//       const currentUser = {
//         id: 1,
//         full_name: "Alex Morgan",
//         current_trip_id: 101,
//         trip_role: "admin",
//       };
//       setUser(currentUser);

//       // Dummy trip
//       const currentTrip = {
//         id: 101,
//         name: "Europe Adventure",
//       };
//       setTrip(currentTrip);

//       // Dummy itinerary
//       const dummyItinerary = [
//         {
//           id: 1,
//           trip_id: 101,
//           date: "2025-08-10",
//           activity_title: "Arrival & Check-in",
//           start_time: "10:00 AM",
//           end_time: "12:00 PM",
//           notes: "Hotel lobby meetup",
//         },
//         {
//           id: 2,
//           trip_id: 101,
//           date: "2025-08-10",
//           activity_title: "City Walking Tour",
//           start_time: "2:00 PM",
//           end_time: "5:00 PM",
//           notes: "Wear comfortable shoes",
//         },
//         {
//           id: 3,
//           trip_id: 101,
//           date: "2025-08-11",
//           activity_title: "Museum Visit",
//           start_time: "11:00 AM",
//           end_time: "1:00 PM",
//           notes: "Tickets already booked",
//         },
//       ];
//       setItineraryItems(dummyItinerary);

//       const uniqueDays = [...new Set(dummyItinerary.map((item) => item.date))];
//       setExpandedDays(new Set(uniqueDays));
//     } catch (error) {
//       console.error("Error loading dummy itinerary:", error);
//       navigate(createPageUrl("Home"));
//     }
//     setLoading(false);
//   };

//   const handleEditItem = (item) => {
//     if (user?.trip_role !== "admin") return;
//     setEditingItem(item);
//     setShowForm(true);
//   };

//   const handleDeleteItem = async (itemId) => {
//     if (user?.trip_role !== "admin") return;

//     try {
//       await ItineraryEntity.delete(itemId);
//       loadItineraryData();
//     } catch (error) {
//       console.error("Error deleting itinerary item:", error);
//     }
//   };

//   const handleFormSubmit = async (formData) => {
//     if (user?.trip_role !== "admin") return;

//     try {
//       const itemData = {
//         ...formData,
//         trip_id: trip.id,
//       };

//       const firstName = user.full_name.split(" ")[0];
//       let description = "";

//       if (editingItem) {
//         await ItineraryEntity.update(editingItem.id, itemData);
//         description = `${firstName} updated the itinerary: ${
//           formData.activity_title
//         } on Day ${format(new Date(formData.date), "d")}.`;
//       } else {
//         await ItineraryEntity.create(itemData);
//         description = `${firstName} added to the itinerary: ${
//           formData.activity_title
//         } on Day ${format(new Date(formData.date), "d")}.`;
//       }

//       await TripActivity.create({
//         trip_id: trip.id,
//         user_id: user.id,
//         user_first_name: firstName,
//         action_type: "UPDATED_ITINERARY",
//         description: description,
//         metadata: {
//           activity_title: formData.activity_title,
//           date: formData.date,
//         },
//       });

//       setShowForm(false);
//       setEditingItem(null);
//       loadItineraryData();
//     } catch (error) {
//       console.error("Error saving itinerary item:", error);
//     }
//   };

//   const handleFormCancel = () => {
//     setShowForm(false);
//     setEditingItem(null);
//   };

//   const toggleDay = (date) => {
//     const newExpanded = new Set(expandedDays);
//     if (newExpanded.has(date)) {
//       newExpanded.delete(date);
//     } else {
//       newExpanded.add(date);
//     }
//     setExpandedDays(newExpanded);
//   };

//   const groupItemsByDay = () => {
//     const groups = {};
//     itineraryItems.forEach((item) => {
//       if (!groups[item.date]) {
//         groups[item.date] = [];
//       }
//       groups[item.date].push(item);
//     });

//     // Sort days chronologically
//     return Object.keys(groups)
//       .sort((a, b) => new Date(a) - new Date(b))
//       .map((date) => ({
//         date,
//         items: groups[date].sort((a, b) =>
//           a.start_time.localeCompare(b.start_time)
//         ),
//       }));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!trip) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-slate-800 mb-4">
//             No Active Trip
//           </h2>
//           <Button onClick={() => navigate(createPageUrl("Home"))}>
//             Go Home
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const isAdmin = user?.trip_role === "admin";
//   const dayGroups = groupItemsByDay();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
//       <div className="max-w-5xl mx-auto space-y-8">
//         {/* Back to Dashboard Button */}
//         <div className="flex items-center gap-4">
//           <Button
//             variant="outline"
//             onClick={() =>
//               navigate(
//                 createPageUrl(isAdmin ? "Dashboard" : "ParticipantDashboard")
//               )
//             }
//             className="bg-white/80"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Button>
//         </div>

//         {/* Header */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 <Calendar className="w-8 h-8 text-blue-600" />
//                 <Badge
//                   className={`${
//                     isAdmin
//                       ? "bg-coral-100 text-coral-800"
//                       : "bg-blue-100 text-blue-800"
//                   }`}
//                 >
//                   {isAdmin ? "Admin - Can Edit" : "Participant - View Only"}
//                 </Badge>
//               </div>
//               <h1 className="text-4xl font-bold text-slate-800 mb-2">
//                 Trip Itinerary
//               </h1>
//               <div className="flex items-center gap-2 text-xl text-slate-600">
//                 <MapPin className="w-5 h-5" />
//                 {trip.destination} •{" "}
//                 {format(new Date(trip.start_date), "MMM d")} -{" "}
//                 {format(new Date(trip.end_date), "MMM d, yyyy")}
//               </div>
//             </div>

//             {isAdmin && (
//               <Button
//                 onClick={handleAddItem}
//                 size="lg"
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
//               >
//                 <Plus className="w-5 h-5 mr-2" />
//                 Add Activity
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Itinerary Form - Only visible to admins */}
//         {showForm && isAdmin && (
//           <ItineraryForm
//             trip={trip}
//             item={editingItem}
//             onSubmit={handleFormSubmit}
//             onCancel={handleFormCancel}
//           />
//         )}

//         {/* Itinerary Items */}
//         <div className="space-y-6">
//           {dayGroups.length === 0 ? (
//             <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
//               <CardContent className="py-16 text-center">
//                 <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-slate-600 mb-2">
//                   No itinerary has been added yet
//                 </h3>
//                 <p className="text-slate-500 mb-6">
//                   {isAdmin
//                     ? "Start planning your trip by adding your first activity"
//                     : "Check back soon. The trip admin hasn't added any activities yet."}
//                 </p>
//                 {isAdmin && (
//                   <Button
//                     onClick={handleAddItem}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add First Activity
//                   </Button>
//                 )}
//               </CardContent>
//             </Card>
//           ) : (
//             dayGroups.map(({ date, items }) => (
//               <ItineraryDayGroup
//                 key={date}
//                 date={date}
//                 items={items}
//                 isExpanded={expandedDays.has(date)}
//                 onToggle={() => toggleDay(date)}
//                 isAdmin={isAdmin}
//                 onEdit={handleEditItem}
//                 onDelete={handleDeleteItem}
//               />
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, ArrowLeft, MapPin } from "lucide-react";
import { format } from "date-fns";
import ItineraryForm from "../components/itinerary/ItineraryForm";
import ItineraryDayGroup from "../components/itinerary/ItineraryDayGroup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getItinerariesService,
  deleteItineraryService,
} from "@/services/itinerary";
import { getActiveTripService } from "@/services/trip";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function Itinerary() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());

  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const authUser = useSelector((state) => state.user.user);
  // ✅ Active Trip
  const { data: activeTripData, isLoading: isLoadingTrip } = useQuery({
    queryKey: ["getActiveTripData"],
    queryFn: () => getActiveTripService(token),
    enabled: !!token,
  });

  const activeTrip = activeTripData?.data?.activeTrip;
  const isAdmin = authUser?.role === "admin";

  // ✅ Get Itineraries
  const {
    data: itineraryRes,
    isLoading: isLoadingItineraries,
    refetch,
  } = useQuery({
    queryKey: ["getItineraries", tripId],
    queryFn: () => getItinerariesService(token, tripId),
    enabled: !!tripId,
  });

  const itineraries = itineraryRes?.data || [];

  // ✅ Delete Itinerary
  const { mutate: deleteItinerary } = useMutation({
    mutationFn: (id) => deleteItineraryService(token, id),
    onSuccess: () => {
      toast.success("Itinerary deleted");
      refetch();
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = (itemId) => {
    deleteItinerary(itemId);
  };

  const toggleDay = (date) => {
    const newExpanded = new Set(expandedDays);
    newExpanded.has(date) ? newExpanded.delete(date) : newExpanded.add(date);
    setExpandedDays(newExpanded);
  };
  console.log("itineraries", itineraries);
  const groupItemsByDay = () => {
    const groups = {};
    itineraries?.itineraries?.forEach((item) => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        items: groups[date].sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        ),
      }));
  };

  if (isLoadingTrip || isLoadingItineraries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Trip</h2>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const dayGroups = groupItemsByDay();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                createPageUrl(isAdmin ? "Dashboard" : "ParticipantDashboard")
              )
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Trip Header */}
        <div className="bg-white/80 p-8 rounded-3xl shadow-xl border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <Badge
                  className={`${
                    isAdmin
                      ? "bg-coral-100 text-coral-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isAdmin ? "Admin - Can Edit" : "Participant - View Only"}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">Trip Itinerary</h1>
              <div className="flex items-center gap-2 text-xl text-slate-600">
                <MapPin className="w-5 h-5" />
                {activeTrip.destination} •{" "}
                {format(new Date(activeTrip.start_date), "MMM d")} -{" "}
                {format(new Date(activeTrip.end_date), "MMM d, yyyy")}
              </div>
              {activeTrip.welcome_message && (
                <p className="mt-2 text-slate-500">
                  {activeTrip.welcome_message}
                </p>
              )}
            </div>

            {isAdmin && (
              <Button
                onClick={handleAddItem}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Activity
              </Button>
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && isAdmin && (
          <ItineraryForm
            trip={activeTrip}
            item={editingItem}
            onCancel={() => setShowForm(false)}
            setShowForm={setShowForm}
            refetch={refetch}
          />
        )}

        {/* Itinerary Groups */}
        <div className="space-y-6">
          {dayGroups.length === 0 ? (
            <Card className="bg-white/80 shadow-lg">
              <CardContent className="py-16 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No itinerary has been added yet
                </h3>
                {isAdmin && (
                  <Button onClick={handleAddItem} className="bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Activity
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            dayGroups.map(({ date, items }) => (
              <ItineraryDayGroup
                key={date}
                date={date}
                items={items}
                isExpanded={expandedDays.has(date)}
                onToggle={() => toggleDay(date)}
                isAdmin={isAdmin}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
