import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { createItineraryService, updateItineraryService } from "@/services/itinerary";
import { format, parseISO } from "date-fns";
import { Save, X } from "lucide-react";

export default function ItineraryForm({
  trip,
  item,
  onCancel,
  setShowForm,
  refetch,
  selectedDate,
}) {
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    activity_title: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const token = useSelector((state) => state.user.token);
  const activeTripId = useSelector((state) => state.trips.activeTripId);

  useEffect(() => {
    if (item) {
      setFormData({
        date: item.date ? format(new Date(item.date), "yyyy-MM-dd") : "",
        start_time: item.start_time ? format(new Date(item.start_time), "HH:mm") : "",
        end_time: item.end_time ? format(new Date(item.end_time), "HH:mm") : "",
        activity_title: item.activity_title || "",
        notes: item.notes || "",
      });
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(new Date(selectedDate), "yyyy-MM-dd"),
      }));
    }
  }, [item, selectedDate]);

  const { mutate: saveItinerary } = useMutation({
    mutationFn: (data) =>
      item
        ? updateItineraryService(token, item.id, data)
        : createItineraryService(token, data),
    onSuccess: () => {
      toast.success(item ? "Itinerary updated" : "Itinerary created");
      setShowForm(false);
      refetch();
    },
    onError: () => toast.error("Failed to save itinerary"),
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDateObj = new Date(formData.date);
      const tripStart = new Date(trip.start_date);
      const tripEnd = new Date(trip.end_date);
      if (selectedDateObj < tripStart || selectedDateObj > tripEnd) {
        newErrors.date = "Date must be within trip dates";
      }
    }

    if (!formData.activity_title.trim()) {
      newErrors.activity_title = "Title is required";
    } else if (formData.activity_title.trim().length < 3) {
      newErrors.activity_title = "Title must be at least 3 characters";
    }

    if (!formData.start_time) newErrors.start_time = "Start time is required";
    if (!formData.end_time) newErrors.end_time = "End time is required";

    if (formData.start_time && formData.end_time) {
      const start = new Date(`${formData.date}T${formData.start_time}`);
      const end = new Date(`${formData.date}T${formData.end_time}`);
      if (end <= start) newErrors.end_time = "End time must be after start time";
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Notes cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    saveItinerary({
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      activity_title: formData.activity_title,
      notes: formData.notes,
      tripId: activeTripId,
    });
  };

  // ===== 12-Hour Time Helpers =====
  const generate12HourTimes = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute of ["00", "15", "30", "45"]) {
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const format12Hour = (time24) => {
    if (!time24) return { time: "12:00", ampm: "AM" };
    let [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return { time: `${hour}:${minute.toString().padStart(2, "0")}`, ampm };
  };

  const to24Hour = (time, ampm) => {
    let [hour, minute] = time.split(":").map(Number);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  };

  const handleTimeChange = (field, time, ampm) => {
    const time24 = to24Hour(time, ampm);
    setFormData((prev) => ({ ...prev, [field]: time24 }));
  };

  // ===== Render Form =====
  return (
    <form id="itinerary" onSubmit={handleSubmit} className="space-y-6">
      {/* Date + Title */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            Date *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={format(parseISO(trip.start_date), "yyyy-MM-dd")}
            max={format(parseISO(trip.end_date), "yyyy-MM-dd")}
          />
          {formData.date && (
            <p className="text-sm text-blue-600 mt-1">
              Selected: {format(parseISO(formData.date), "MM/dd/yyyy")}
            </p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Must be between {format(parseISO(trip.start_date), "MMM d, yyyy")} –{" "}
            {format(parseISO(trip.end_date), "MMM d, yyyy")}
          </p>
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            Activity Title *
          </label>
          <Input
            value={formData.activity_title}
            onChange={(e) =>
              setFormData({ ...formData, activity_title: e.target.value })
            }
            placeholder="e.g., Beach Day, City Tour, Dinner"
          />
          {errors.activity_title && (
            <p className="text-red-500 text-sm">{errors.activity_title}</p>
          )}
        </div>
      </div>

      {/* Start/End Times */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Start Time */}
        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            Start Time *
          </label>
          <div className="flex gap-2">
            <select
              value={format12Hour(formData.start_time).time}
              onChange={(e) =>
                handleTimeChange(
                  "start_time",
                  e.target.value,
                  format12Hour(formData.start_time).ampm
                )
              }
              className="border rounded-md px-3 py-2 w-full"
            >
              {generate12HourTimes().map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={format12Hour(formData.start_time).ampm}
              onChange={(e) =>
                handleTimeChange(
                  "start_time",
                  format12Hour(formData.start_time).time,
                  e.target.value
                )
              }
              className="border rounded-md px-3 py-2 w-24"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.start_time && (
            <p className="text-red-500 text-sm">{errors.start_time}</p>
          )}
        </div>

        {/* End Time */}
        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            End Time *
          </label>
          <div className="flex gap-2">
            <select
              value={format12Hour(formData.end_time).time}
              onChange={(e) =>
                handleTimeChange(
                  "end_time",
                  e.target.value,
                  format12Hour(formData.end_time).ampm
                )
              }
              className="border rounded-md px-3 py-2 w-full"
            >
              {generate12HourTimes().map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={format12Hour(formData.end_time).ampm}
              onChange={(e) =>
                handleTimeChange(
                  "end_time",
                  format12Hour(formData.end_time).time,
                  e.target.value
                )
              }
              className="border rounded-md px-3 py-2 w-24"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
          {errors.end_time && (
            <p className="text-red-500 text-sm">{errors.end_time}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-base font-semibold text-slate-700 mb-2 block">
          Notes (Optional)
        </label>
        <Textarea
          placeholder="Add any additional details, meeting points, or special instructions..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="flex w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none mt-2 border-slate-200 min-h-24"
        />
        {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button type="submit" className="bg-blue-600">
          <Save className="w-4 h-4 mr-2" />
          {item ? "Update Activity" : "Add Activity"}
        </Button>
      </div>
    </form>
  );
}
