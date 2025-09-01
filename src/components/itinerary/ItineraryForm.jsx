import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import {
  createItineraryService,
  updateItineraryService,
} from "@/services/itinerary";
import { toast } from "sonner";

export default function ItineraryForm({
  trip,
  item,
  onCancel,
  setShowForm,
  refetch,
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
        start_time: item.start_time
          ? format(new Date(item.start_time), "HH:mm")
          : "",
        end_time: item.end_time ? format(new Date(item.end_time), "HH:mm") : "",
        activity_title: item.activity_title || "",
        notes: item.notes || "",
      });
    }
  }, [item]);

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

    if (!formData.notes || formData.notes.trim() === "") {
      newErrors.notes = "Notes are required";
    }

    // Notes (optional, max length)
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
      date: formData.date, // yyyy-MM-dd only
      start_time: formData.start_time, // HH:mm
      end_time: formData.end_time, // HH:mm
      activity_title: formData.activity_title,
      notes: formData.notes,
      tripId: activeTripId,
    });
  };

  return (
    <Card className="bg-white/90 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          {item ? "Edit Activity" : "Add New Activity"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date + Title */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                min={format(new Date(trip.start_date), "yyyy-MM-dd")}
                max={format(new Date(trip.end_date), "yyyy-MM-dd")}
              />

              {errors.date && (
                <p className="text-red-500 text-sm">{errors.date}</p>
              )}
            </div>
            <div>
              <Label>Activity Title *</Label>
              <Input
                value={formData.activity_title}
                onChange={(e) =>
                  setFormData({ ...formData, activity_title: e.target.value })
                }
              />
              {errors.activity_title && (
                <p className="text-red-500 text-sm">{errors.activity_title}</p>
              )}
            </div>
          </div>
          {/* Times */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
              />
              {errors.start_time && (
                <p className="text-red-500 text-sm">{errors.start_time}</p>
              )}
            </div>
            <div>
              <Label>End Time *</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm">{errors.end_time}</p>
              )}
            </div>
          </div>
          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            {errors.notes && (
              <p className="text-red-500 text-sm">{errors.notes}</p>
            )}
          </div>
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
      </CardContent>
    </Card>
  );
}
