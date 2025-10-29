"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { fromZonedTime } from "date-fns-tz";
import { Save, X } from "lucide-react";
import { toUTCDate } from "@/lib/utils";

export default function ItineraryForm({
  trip,
  item,
  onCancel,
  setShowForm,
  refetch,
  selectedDate,
}) {
  const token = useSelector((state) => state.user.token);
  const activeTripId = useSelector((state) => state.trips.activeTripId);
  const dateInputRef = useRef(null);

  // const toUTCDate = (date) => {
  //   const d = new Date(date);
  //   return new Date(
  //     Date.UTC(
  //       d.getFullYear(),
  //       d.getMonth(),
  //       d.getDate(),
  //       d.getHours(),
  //       d.getMinutes(),
  //       d.getSeconds()
  //     )
  //   );
  // };
  // ---------- Date setup ----------
  const tripStart = useMemo(
    () => toUTCDate(trip.start_date),
    [trip.start_date]
  );
  const tripEnd = useMemo(() => toUTCDate(trip.end_date), [trip.end_date]);
  const minDate = format(tripStart, "yyyy-MM-dd");
  const maxDate = format(tripEnd, "yyyy-MM-dd");

  const clampDate = (date) => {
    if (!date) return minDate;
    const d = toUTCDate(date);
    if (d < tripStart) return minDate;
    if (d > tripEnd) return maxDate;
    return format(d, "yyyy-MM-dd");
  };

  // ---------- Initialize form ----------

  const toLocalDate = (dateString) => {
    if (!dateString) return "";

    const d = toUTCDate(dateString);
    return format(d, "yyyy-MM-dd");
  };

  const [formData, setFormData] = useState({
    date: clampDate(toLocalDate(item?.date || selectedDate || trip.start_date)),
    start_time: item?.start_time
      ? format(new Date(item.start_time), "HH:mm")
      : "",
    end_time: item?.end_time ? format(new Date(item.end_time), "HH:mm") : "",
    activity_title: item?.activity_title || "",
    notes: item?.notes || "",
  });

  const [errors, setErrors] = useState({});
  const [isDateReady, setIsDateReady] = useState(false);

  // ---------- iOS date picker fix ----------
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iP(hone|ad|od)/.test(navigator.platform) ||
      (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1));

  useEffect(() => {
    if (isIOS && dateInputRef.current) {
      setIsDateReady(false);
      const timer = setTimeout(() => {
        dateInputRef.current.value = formData.date;
        dateInputRef.current?.blur();
        setIsDateReady(true);
      }, 150);
      return () => clearTimeout(timer);
    } else setIsDateReady(true);
  }, [isIOS, formData.date]);

  // ---------- Change handlers ----------
  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleDateChange = (e) => {
    const value = e.target.value;
    const clamped = clampDate(value);
    handleChange("date", clamped);
  };

  // ---------- Time format helpers ----------
  const format12Hour = (time24) => {
    if (!time24) return { time: "", ampm: "AM" };
    let [h, m] = time24.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return { time: `${h}:${m.toString().padStart(2, "0")}`, ampm };
  };

  const to24Hour = (time, ampm) => {
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const handleTimeChange = (field, time, ampm) => {
    handleChange(field, to24Hour(time, ampm));
  };

  // ---------- Time generator ----------
  const generateTimes = () => {
    const arr = [];
    for (let h = 1; h <= 12; h++)
      for (const m of ["00", "15", "30", "45"]) arr.push(`${h}:${m}`);
    return arr;
  };

  // ---------- Validation ----------
  const validate = () => {
    const errs = {};
    const { date, start_time, end_time, activity_title, notes } = formData;

    if (!date) errs.date = "Date is required";
    const d = toUTCDate(date);
    if (d < tripStart || d > tripEnd)
      errs.date = "Date must be within trip dates";

    if (!activity_title.trim()) errs.activity_title = "Title is required";
    else if (activity_title.trim().length < 3)
      errs.activity_title = "Title must be at least 3 characters";

    if (!start_time) errs.start_time = "Start time is required";
    if (!end_time) errs.end_time = "End time is required";

    if (start_time && end_time) {
      const start = new Date(`${date}T${start_time}`);
      const end = new Date(`${date}T${end_time}`);
      if (start_time === end_time)
        errs.end_time = "End time cannot be same as start";
      else if (end <= start) end.setDate(end.getDate() + 1);
      if ((end - start) / (1000 * 60 * 60) > 24)
        errs.end_time = "Duration cannot exceed 24 hours";
    }

    if (notes?.length > 500) errs.notes = "Notes cannot exceed 500 characters";

    setErrors(errs);
    return !Object.keys(errs).length;
  };

  // ---------- API mutation ----------
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

  // ---------- Submit ----------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 🧠 Detect the user’s timezone (auto)
    // Detect the user’s timezone automatically
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert from the user's selected local date/time to UTC
    const startUtc = fromZonedTime(
      `${formData.date}T${formData.start_time}`,
      timeZone
    );
    const endUtc = fromZonedTime(
      `${formData.date}T${formData.end_time}`,
      timeZone
    );

    const payload = {
      ...formData,
      start_time: startUtc.toISOString(),
      end_time: endUtc.toISOString(),
      tripId: activeTripId,
    };

    saveItinerary(payload);
  };

  // ---------- UI ----------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date & Title */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            Date *
          </label>
          <Input
            ref={dateInputRef}
            type={isIOS && !isDateReady ? "text" : "date"}
            value={formData.date}
            onChange={handleDateChange}
            onFocus={() => (dateInputRef.current.value = formData.date)}
            min={minDate}
            max={maxDate}
            readOnly={isIOS && !isDateReady}
          />
          <p className="text-sm text-slate-500 mt-1">
            Must be between {format(tripStart, "MMM d, yyyy")} –{" "}
            {format(tripEnd, "MMM d, yyyy")}
          </p>
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        <div>
          <label className="text-base font-semibold text-slate-700 mb-2 block">
            Activity Title *
          </label>
          <Input
            value={formData.activity_title}
            onChange={(e) => handleChange("activity_title", e.target.value)}
            placeholder="e.g., City Tour, Dinner"
          />
          {errors.activity_title && (
            <p className="text-red-500 text-sm">{errors.activity_title}</p>
          )}
        </div>
      </div>

      {/* Start / End time */}
      <div className="flex flex-col gap-6">
        {["start_time", "end_time"].map((field) => {
          const label = field === "start_time" ? "Start Time *" : "End Time *";
          const formatted = format12Hour(formData[field]);
          return (
            <div key={field}>
              <label className="text-base font-semibold text-slate-700 mb-2 block">
                {label}
              </label>
              <div className="flex gap-2">
                <select
                  value={formatted.time}
                  onChange={(e) =>
                    handleTimeChange(field, e.target.value, formatted.ampm)
                  }
                  className="border rounded-md px-3 py-2 w-full text-sm"
                >
                  <option value="">Select time</option>
                  {generateTimes().map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={formatted.ampm}
                  onChange={(e) =>
                    handleTimeChange(field, formatted.time, e.target.value)
                  }
                  className="border rounded-md px-3 py-2 w-24 text-sm"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
              {errors[field] && (
                <p className="text-red-500 text-sm">{errors[field]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div>
        <label className="text-base font-semibold text-slate-700 mb-2 block">
          Notes (Optional)
        </label>
        <Textarea
          placeholder="Add any details..."
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="min-h-24"
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
