import { setActiveTripId } from "@/store/tripSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const tripId = useSelector((state) => state.trips.activeTripId);
  const user = useSelector((state) => state.user.user);
  const linkTo = !tripId
    ? "/mytrips"
    : user?.trip_role === "creator" || user?.trip_role === "co-admin"
    ? "/dashboard"
    : "/participantdashboard";
  return (
    <div className="flex-1 overflow-auto">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin w-10 h-10 text-white"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx={12} cy={10} r={3} />
                  </svg>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 tracking-tight">
                Plan Group Trips
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Without the Chaos
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Kasama is your digital command center for group travel planning.
                One shared space, clear roles, zero confusion.
              </p>
              <Link to={linkTo}>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Start Planning
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right ml-3 w-6 h-6"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="py-24 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">
                Everything You Need for Group Travel
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Built around clear roles and responsibilities, Kasama eliminates
                the friction from group planning
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin w-8 h-8 text-white"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx={12} cy={10} r={3} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Single Source of Truth
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  One shared trip space for all your group planning needs
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-users w-8 h-8 text-white"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx={9} cy={7} r={4} />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Role-Based Access
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Trip admins control everything while participants stay
                  informed
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-calendar w-8 h-8 text-white"
                  >
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width={18} height={18} x={3} y={4} rx={2} />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Collaborative Itinerary
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Plan your schedule together with real-time updates
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-credit-card w-8 h-8 text-white"
                  >
                    <rect width={20} height={14} x={2} y={5} rx={2} />
                    <line x1={2} x2={22} y1={10} y2={10} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Expense Tracking
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Track group expenses and individual contributions seamlessly
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-24 bg-gradient-to-r from-slate-900 to-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                How Kasama Works
              </h2>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                Simple workflow designed around trip ownership and collaboration
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-2xl font-bold text-white">01</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Create Your Trip
                </h3>
                <p className="text-blue-200 text-lg leading-relaxed">
                  Fill out trip details and become the trip admin with full
                  control
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-2xl font-bold text-white">02</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Invite Your Group
                </h3>
                <p className="text-blue-200 text-lg leading-relaxed">
                  Share your unique trip link - all joiners become participants
                  automatically
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-2xl font-bold text-white">03</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Plan Together
                </h3>
                <p className="text-blue-200 text-lg leading-relaxed">
                  Collaborate on itinerary, track expenses, and manage
                  everything in one place
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              Ready to Plan Your Next Group Adventure?
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Join thousands of travelers who've eliminated group planning chaos
              with Kasama
            </p>
            <Link to={linkTo}>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-11 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-16 py-6 text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Start Your Trip Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-right ml-3 w-6 h-6"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
