"use client";
import React, { useEffect, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  addDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import {
  deleteItineraryService,
  getItinerariesService,
} from "@/services/itinerary";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTripService } from "@/services/trip";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  SquarePen,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ItineraryForm from "../itinerary/ItineraryForm";
import {
  createItineraryService,
  updateItineraryService,
} from "@/services/itinerary";
import { toast } from "sonner";

const ItineraryCalander = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    activity_title: "",
    notes: "",
  });
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const authUser = useSelector((state) => state.user.user);
  const [errors, setErrors] = useState({});
  const activeTripId = useSelector((state) => state.trips.activeTripId);
  const { data: activeTripData, isLoading: isLoadingTrip } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const activeTrip = activeTripData?.data?.activeTrip;
  const isAdmin =
    authUser?.trip_role === "creator" || authUser?.trip_role === "co-admin";
  useEffect(() => {
    if (editingItem) {
      setFormData({
        date: editingItem.date
          ? format(new Date(editingItem.date), "yyyy-MM-dd")
          : "",
        start_time: editingItem.start_time
          ? format(new Date(editingItem.start_time), "HH:mm")
          : "",
        end_time: editingItem.end_time
          ? format(new Date(editingItem.end_time), "HH:mm")
          : "",
        activity_title: editingItem.activity_title || "",
        notes: editingItem.notes || "",
      });
    }
  }, [editingItem]);

  useEffect(() => {
    if (activeTrip) {
      const tripStart = new Date(activeTrip.start_date);
      const tripEnd = new Date(activeTrip.end_date);

      if (selectedDate < tripStart || selectedDate > tripEnd) {
        setSelectedDate(tripStart);
        setCurrentMonth(tripStart);
      }
    }
  }, [activeTrip]);

  const { mutate: saveItinerary } = useMutation({
    mutationFn: (data) =>
      editingItem
        ? updateItineraryService(token, editingItem.id, data)
        : createItineraryService(token, data),
    onSuccess: () => {
      toast.success(editingItem ? "Itinerary updated" : "Itinerary created");
      setShowForm(false);
      refetch();
    },
    onError: () => toast.error("Failed to save itinerary"),
  });

  const validateForm = () => {
    const newErrors = {};

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const tripStart = new Date(trip.start_date);
      const tripEnd = new Date(trip.end_date);

      if (selectedDate < tripStart || selectedDate > tripEnd) {
        newErrors.date = "Date must be within trip dates";
      }
    }

    // Activity title
    if (!formData.activity_title.trim()) {
      newErrors.activity_title = "Title is required";
    } else if (formData.activity_title.trim().length < 3) {
      newErrors.activity_title = "Title must be at least 3 characters";
    }

    // Time validation
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }
    if (formData.start_time && formData.end_time) {
      const start = new Date(`${formData.date}T${formData.start_time}`);
      const end = new Date(`${formData.date}T${formData.end_time}`);
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Notes cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  console.log("activeTrippppp", activeTrip);
  // ✅ Fetch all itineraries once
  const {
    data: itineraryRes,
    isLoading: isLoadingItineraries,
    refetch,
  } = useQuery({
    queryKey: ["getItineraries", tripId],
    queryFn: () => getItinerariesService(token, tripId),
    enabled: !!tripId,
  });

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
    setFormData({
      date: format(selectedDate, "yyyy-MM-dd"), // ✅ selected calendar date auto set
      start_time: "",
      end_time: "",
      activity_title: "",
      notes: "",
    });
    setShowForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = (itemId) => {
    deleteItinerary(itemId);
  };

  const itineraries = itineraryRes?.data?.itineraries || [];

  // ✅ Group itineraries by date
  const itinerariesByDate = {};
  itineraries.forEach((item) => {
    const dateKey = format(new Date(item.date), "yyyy-MM-dd");
    if (!itinerariesByDate[dateKey]) itinerariesByDate[dateKey] = [];
    itinerariesByDate[dateKey].push(item);
  });

  // ✅ Get itineraries for selected day
  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");
  const activitiesForSelectedDay = itinerariesByDate[selectedDayKey] || [];

  const renderHeader = () => {
    if (!activeTrip) return null;

    const tripStart = startOfDay(new Date(activeTrip.start_date));
    const tripEnd = endOfDay(new Date(activeTrip.end_date));

    // calendar ke current month ka visible range nikaalo
    const monthStart = startOfWeek(startOfMonth(currentMonth), {
      weekStartsOn: 0,
    });
    const monthEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    // ✅ prev disable: agar already tripStart se pehle nahi jaa sakte
    const prevDisabled =
      monthStart <= startOfWeek(startOfMonth(tripStart), { weekStartsOn: 0 });

    // ✅ next disable: agar already tripEnd ke aage nahi jaa sakte
    const nextDisabled =
      monthEnd >= endOfWeek(endOfMonth(tripEnd), { weekStartsOn: 0 });

    return (
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() =>
            !prevDisabled && setCurrentMonth(subMonths(currentMonth, 1))
          }
          disabled={prevDisabled}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium 
          border border-input bg-background h-9 rounded-md px-3
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>

        <button
          onClick={() =>
            !nextDisabled && setCurrentMonth(addMonths(currentMonth, 1))
          }
          disabled={nextDisabled}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium 
          border border-input bg-background h-9 rounded-md px-3
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-medium text-slate-500">
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1 mb-4">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // ✅ Normalize tripStart to startOfDay & tripEnd to endOfDay
    const tripStart = activeTrip
      ? startOfDay(new Date(activeTrip.start_date))
      : null;
    const tripEnd = activeTrip ? endOfDay(new Date(activeTrip.end_date)) : null;

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;

        const dateKey = format(cloneDay, "yyyy-MM-dd");
        const activityCount = itinerariesByDate[dateKey]?.length || 0;

        // ✅ use isWithinInterval (handles inclusive start/end correctly)
        const isWithinTrip =
          tripStart && tripEnd
            ? isWithinInterval(cloneDay, { start: tripStart, end: tripEnd })
            : false;

        days.push(
          <button
            key={day.toString()}
            onClick={() => isWithinTrip && setSelectedDate(cloneDay)}
            disabled={
              !isSameMonth(day, monthStart) || !isWithinTrip // disable outside trip dates
            }
            className={`p-2 text-sm rounded-lg relative transition-all
          ${
            !isSameMonth(day, monthStart) || !isWithinTrip
              ? "text-slate-300 cursor-not-allowed"
              : "hover:bg-blue-50 hover:text-black"
          }
          ${
            isSameDay(day, selectedDate)
              ? "bg-blue-600 text-white font-semibold"
              : ""
          }
        `}
          >
            {formattedDate}
            {activityCount > 0 && (
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                  isSameDay(day, selectedDate)
                    ? "bg-white text-blue-600"
                    : "bg-blue-600 text-white"
                }`}
              >
                {activityCount}
              </div>
            )}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="rounded-lg border bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Itinerary
          </h3>
          {isAdmin && (
            <button
              onClick={handleAddItem}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-9 rounded-md px-3 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> <span>Add Activity</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}

        {/* Activities List */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-slate-800">
              {format(selectedDate, "EEEE, MMMM d")}
            </h4>
            {isAdmin && (
              <button
                onClick={handleAddItem}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
              >
                <Plus className="w-4 h-4 mr-2" /> Add
              </button>
            )}
          </div>
          <div className="space-y-3">
            {activitiesForSelectedDay.length > 0 ? (
              activitiesForSelectedDay.map((a) => (
                <div key={a.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    {/* Left side: title, time, description */}
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-800">
                        {a.activity_title}
                      </h5>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-sm text-blue-600 mt-1">
                        <Clock className="w-3 h-3" />
                        {a.start_time && a.end_time
                          ? `${format(
                              new Date(a.start_time),
                              "HH:mm"
                            )} - ${format(new Date(a.end_time), "HH:mm")}`
                          : a.start_time
                          ? format(new Date(a.start_time), "HH:mm")
                          : "No time set"}
                      </div>

                      {/* Description */}
                      <div className="mt-2 text-sm text-slate-600 flex items-start gap-2">
                        <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{a.notes || "No description"}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <>
                        {/* Right side: edit / delete buttons */}
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEditItem(a)}
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-6 w-6 hover:bg-accent hover:text-accent-foreground"
                          >
                            <SquarePen className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(a?.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-6 w-6 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No activities for this day.
              </p>
            )}
          </div>
        </div>
      </div>
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
                formData={formData}
                selectedDate={selectedDate}
                setFormData={setFormData}
                onCancel={() => setShowForm(false)}
                setShowForm={setShowForm}
                refetch={refetch}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ItineraryCalander;
