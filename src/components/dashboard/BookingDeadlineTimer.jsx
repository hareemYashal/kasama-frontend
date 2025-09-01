import React, { useState, useEffect } from "react";
import { formatDistanceToNowStrict, subDays } from "date-fns";
import { Clock } from "lucide-react";

export default function BookingDeadlineTimer({ startDate }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!startDate) return;

    // booking deadline = 1 day before trip start date
    const deadline = subDays(new Date(startDate), 1);

    const calculateTimeLeft = () => {
      const now = new Date();
      if (deadline < now) {
        setIsPast(true);
        setTimeLeft("Booking deadline has passed");
      } else {
        setIsPast(false);
        setTimeLeft(
          formatDistanceToNowStrict(deadline, { addSuffix: true })
        );
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [startDate]);

  if (!startDate) return null;

  return (
    <div
      className={`text-center rounded-2xl p-4 shadow-lg ${
        isPast
          ? "bg-gray-100 text-gray-500 border border-gray-200"
          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <div className="text-sm font-semibold uppercase tracking-wider">
          Booking Deadline
        </div>
      </div>
      <div className={`mt-1 font-bold ${isPast ? "text-base" : "text-lg"}`}>
        {timeLeft}
      </div>
    </div>
  );
}
