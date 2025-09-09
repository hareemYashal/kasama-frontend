import React, { useState, useEffect } from "react";
import { formatDistanceToNowStrict, subWeeks } from "date-fns";
import { Clock } from "lucide-react";

export default function BookingDeadlineTimer({ startDate, bookingDeadline }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!startDate || !bookingDeadline) return;

    // bookingDeadline is in weeks
    const deadline = subWeeks(new Date(startDate), bookingDeadline);

    const calculateTimeLeft = () => {
      const now = new Date();
      if (deadline < now) {
        setIsPast(true);
        setTimeLeft("Booking deadline has passed");
      } else {
        setIsPast(false);
        setTimeLeft(formatDistanceToNowStrict(deadline, { addSuffix: true }));
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [startDate, bookingDeadline]);

  if (!startDate || !bookingDeadline) return null;

  return (
    <div
      className={`w-full rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center text-center ${
        isPast
          ? "bg-gray-100 text-gray-500 border border-gray-200"
          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-semibold uppercase tracking-wider">
          Booking Deadline
        </span>
      </div>
      <div className={`mt-2 font-bold ${isPast ? "text-base" : "text-lg"}`}>
        {timeLeft}
      </div>
    </div>
  );
}
