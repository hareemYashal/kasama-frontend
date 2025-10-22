"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";

export default function ExpediaTeaser() {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.user.user);
  const activeTripId = useSelector((state) => state.trips.activeTripId);

  const tripId =
    activeTripId || JSON.parse(localStorage.getItem("activeTripId"));

  const goto = () => {
    if (tripId) {
      const isAdmin =
        authUser?.trip_role === "creator" || authUser?.trip_role === "co-admin";
      const page = isAdmin ? "Dashboard" : "ParticipantDashboard";
      navigate(createPageUrl(page));
    } else {
      navigate("/DashboardHome");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center bg-white/80 backdrop-blur-sm p-8 md:p-16 rounded-3xl shadow-2xl border border-slate-200/60">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8">
          <img
            src="/assets/kasama-logo1.png"
            alt="Kasama Logo"
            className="h-14 md:h-20 object-contain"
          />
          <span className="text-4xl md:text-6xl font-bold text-slate-700 opacity-80">
            X
          </span>
          <img
            src="assets/expedia-logo.png"
            alt="Expedia Logo"
            className="h-16 md:h-20 object-contain"
          />
        </div>

        {/* Animated "Coming Soon" text */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold text-slate-800 mb-6"
        >
          Coming Soon
        </motion.h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12">
          Soon you’ll be able to use your saved contributions to book hotels,
          flights, and activities directly through our partnership with Expedia
          — all without leaving Kasama.
        </p>

        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-11 rounded-md bg-slate-300 text-slate-500 cursor-not-allowed w-full md:w-auto px-12 py-7 text-lg"
          disabled
        >
          Coming Soon
        </button>
      </div>

      <button
        onClick={goto}
        className="inline-flex mt-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-10 px-4 py-2 text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="lucide lucide-arrow-left w-4 h-4 mr-2" />
        Back to Dashboard
      </button>
    </div>
  );
}