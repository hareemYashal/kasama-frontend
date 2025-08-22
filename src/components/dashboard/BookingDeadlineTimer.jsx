import React, { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Clock } from 'lucide-react';

export default function BookingDeadlineTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const deadline = new Date(targetDate);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      if (deadline < now) {
        setIsPast(true);
        setTimeLeft('Booking deadline has passed');
      } else {
        setIsPast(false);
        // Ensure to pass date objects to formatDistanceToNowStrict
        setTimeLeft(formatDistanceToNowStrict(deadline, new Date(), { addSuffix: true }));
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate) {
    return null; // Don't render if no deadline is set
  }

  return (
    <div className={`text-center rounded-2xl p-4 shadow-lg ${isPast ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'}`}>
      <div className="flex items-center justify-center gap-2">
        <Clock className="w-4 h-4" />
        <div className="text-sm font-semibold uppercase tracking-wider">Booking Deadline</div>
      </div>
      <div className={`mt-1 font-bold ${isPast ? 'text-base' : 'text-lg'}`}>{timeLeft}</div>
    </div>
  );
}