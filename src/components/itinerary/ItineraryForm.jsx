"use client";

import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import {
  createItineraryService,
  updateItineraryService,
} from "@/services/itinerary";
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
  const [formData, setFormData] = useState(() => {
    // Compute initial date from props and clamp within trip range
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    let initial = item?.date
      ? new Date(item.date)
      : selectedDate
      ? new Date(selectedDate)
      : new Date(trip.start_date);

    if (isNaN(initial.getTime())) initial = start;
    if (initial < start) initial = start;
    if (initial > end) initial = end;

    return {
      date: format(initial, "yyyy-MM-dd"),
      start_time: item?.start_time
        ? format(new Date(item.start_time), "HH:mm")
        : "",
      end_time: item?.end_time ? format(new Date(item.end_time), "HH:mm") : "",
      activity_title: item?.activity_title || "",
      notes: item?.notes || "",
    };
  });

  const [errors, setErrors] = useState({});
  const [isDateReady, setIsDateReady] = useState(false);
  const token = useSelector((state) => state.user.token);
  const activeTripId = useSelector((state) => state.trips.activeTripId);
  const dateInputRef = useRef(null);

  const tripStartDate = useMemo(
    () => new Date(trip.start_date),
    [trip.start_date]
  );
  const tripEndDate = useMemo(() => new Date(trip.end_date), [trip.end_date]);
  const minDateStr = useMemo(
    () => format(tripStartDate, "yyyy-MM-dd"),
    [tripStartDate]
  );
  const maxDateStr = useMemo(
    () => format(tripEndDate, "yyyy-MM-dd"),
    [tripEndDate]
  );

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iP(hone|ad|od)/.test(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1));

  const clampDateToRange = (dateStr) => {
    if (!dateStr) return minDateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return minDateStr;
    if (d < tripStartDate) return minDateStr;
    if (d > tripEndDate) return maxDateStr;
    return format(d, "yyyy-MM-dd");
  };

  const primeDateValueForPicker = () => {
    const target = clampDateToRange(formData.date);
    // update DOM value immediately so iOS opens on the correct month
    if (dateInputRef.current) {
      dateInputRef.current.value = target;
    }
    // keep state in sync
    setFormData((prev) => ({ ...prev, date: target }));
  };

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
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: format(new Date(selectedDate), "yyyy-MM-dd"),
      }));
    }
  }, [item, selectedDate]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: clampDateToRange(prev.date || minDateStr),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDateStr, maxDateStr]);

  useEffect(() => {
    if (isIOS && dateInputRef.current) {
      // Keep input non-interactive initially
      setIsDateReady(false);

      // Wait for modal animation and rendering to complete
      const timer = setTimeout(() => {
        // Set the correct clamped date value
        primeDateValueForPicker();
        // Ensure input is blurred (not focused)
        dateInputRef.current?.blur();
        // Now allow the input to be interactive
        setIsDateReady(true);
      }, 150);

      return () => clearTimeout(timer);
    } else {
      // Non-iOS devices are ready immediately
      setIsDateReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIOS]);

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
      if (selectedDateObj < tripStartDate || selectedDateObj > tripEndDate) {
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
      let end = new Date(`${formData.date}T${formData.end_time}`);

      // If end time equals start time — ❌ not allowed
      if (formData.start_time === formData.end_time) {
        newErrors.end_time = "End time cannot be the same as start time";
      } else {
        // ✅ Allow crossing midnight (e.g., 9:30 PM → 12:30 AM)
        if (end <= start) {
          end.setDate(end.getDate() + 1);
        }

        // ⏱️ Duration check (optional but good practice)
        const durationHours = (end - start) / (1000 * 60 * 60);
        if (durationHours > 24) {
          newErrors.end_time =
            "End time cannot be more than 24 hours after start time";
        }
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = "Notes cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (e) => {
    const raw = e.target.value;
    const clamped = clampDateToRange(raw);
    if (clamped !== raw) {
      toast.error(
        `Please select a date between ${format(
          tripStartDate,
          "MMM d, yyyy"
        )} and ${format(tripEndDate, "MMM d, yyyy")}`
      );
    }
    setFormData({ ...formData, date: clamped });
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

  const generate12HourTimes = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (const minute of ["00", "15", "30", "45"]) {
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const format12Hour = (time24) => {
    if (!time24) return { time: "", ampm: "AM" }; // leave time empty initially
    let [hour, minute] = time24.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return { time: `${hour}:${minute.toString().padStart(2, "0")}`, ampm };
  };

  const to24Hour = (time, ampm) => {
    let [hour, minute] = time.split(":").map(Number);
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const handleTimeChange = (field, time, ampm) => {
    const time24 = to24Hour(time, ampm);
    setFormData((prev) => ({ ...prev, [field]: time24 }));
  };

  return (
    <form id="itinerary" onSubmit={handleSubmit} className="space-y-6">
      {/* Date + Title */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            Date *
          </label>
          <Input
            ref={dateInputRef}
            type={isIOS && !isDateReady ? "text" : "date"}
            inputMode={isIOS && !isDateReady ? "none" : undefined}
            tabIndex={isIOS && !isDateReady ? -1 : 0}
            autoComplete="off"
            value={formData.date}
            onChange={handleDateChange}
            onFocus={primeDateValueForPicker}
            onMouseDown={primeDateValueForPicker}
            onTouchStart={primeDateValueForPicker}
            min={minDateStr}
            max={maxDateStr}
            readOnly={isIOS && !isDateReady}
          />
          {formData.date && (
            <p className="text-sm text-blue-600 mt-1">
              Selected: {format(parseISO(formData.date), "MM/dd/yyyy")}
            </p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Must be between {format(tripStartDate, "MMM d, yyyy")} –{" "}
            {format(tripEndDate, "MMM d, yyyy")}
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
      <div className="flex flex-col gap-6">
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
              className="border rounded-md px-3 py-2 w-full text-sm"
            >
              <option value="" disabled>
                Select time
              </option>
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
              className="border rounded-md px-3 py-2 w-24 text-sm"
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
              className="border rounded-md px-3 py-2 w-full text-sm"
            >
              <option value="" disabled>
                Select time
              </option>
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
              className="border rounded-md px-3 py-2 w-24 text-sm"
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
