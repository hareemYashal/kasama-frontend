import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  if (timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0) {
    return (
      <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="text-2xl font-bold">Trip Started!</div>
        <div className="text-sm opacity-90">Have an amazing time!</div>
      </div>
    );
  }

  return (
    <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
      <div className="text-xs opacity-90 mb-2">COUNTDOWN TO TRIP</div>
      <div className="flex justify-center items-center gap-2 mb-2">
        <div className="text-center">
          <div className="text-2xl font-bold">{formatNumber(timeLeft.days)}</div>
          <div className="text-xs opacity-90">DAYS</div>
        </div>
        <div className="text-xl opacity-70">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold">{formatNumber(timeLeft.hours)}</div>
          <div className="text-xs opacity-90">HRS</div>
        </div>
        <div className="text-xl opacity-70">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-xs opacity-90">MIN</div>
        </div>
        <div className="text-xl opacity-70">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold">{formatNumber(timeLeft.seconds)}</div>
          <div className="text-xs opacity-90">SEC</div>
        </div>
      </div>
    </div>
  );
}