import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Plus, ArrowLeft, MapPin } from "lucide-react";
import { format } from "date-fns";
import ItineraryForm from "../components/itinerary/ItineraryForm";
import ItineraryDayGroup from "../components/itinerary/ItineraryDayGroup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getItinerariesService,
  deleteItineraryService,
} from "@/services/itinerary";
import { getTripService } from "@/services/trip";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Itinerary() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set());

  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const authUser = useSelector((state) => state.user.user);
  // ✅ Active Trip
  // const { data: activeTripData, isLoading: isLoadingTrip } = useQuery({
  //   queryKey: ["getActiveTripData"],
  //   queryFn: () => getActiveTripService(token),
  //   enabled: !!token,
  // });

  const { data: activeTripData, isLoading: isLoadingTrip } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const activeTrip = activeTripData?.data?.activeTrip;
  const isAdmin = authUser?.trip_role === "creator";

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
                {/* <Badge
                  className={`${
                    isAdmin
                      ? "bg-coral-100 text-coral-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {isAdmin ? "Admin - Can Edit" : "Participant - View Only"}
                </Badge> */}
              </div>
              <h1 className="text-4xl font-bold mb-2">Trip Itinerary</h1>
              <div className="flex items-center gap-2 text-xl text-slate-600">
                <MapPin className="w-5 h-5" />
                {activeTrip.destination} •{" "}
                {format(new Date(activeTrip.start_date), "MMM d")} -{" "}
                {format(new Date(activeTrip.end_date), "MMM d, yyyy")}
              </div>
              {/* {activeTrip.welcome_message && (
                <p className="mt-2 text-slate-500">
                  {activeTrip.welcome_message}
                </p>
              )} */}
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
        {isAdmin && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>
                  {editingItem ? "Edit Itinerary" : "Add New Itinerary Item"}
                </DialogTitle>
              </DialogHeader>

              <div className="p-6">
                <ItineraryForm
                  trip={activeTrip}
                  item={editingItem}
                  onCancel={() => setShowForm(false)}
                  setShowForm={setShowForm}
                  refetch={refetch}
                />
              </div>
            </DialogContent>
          </Dialog>
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
                <p className="text-slate-500 mb-6">
                  Start planning your trip by adding your first activity
                </p>
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
