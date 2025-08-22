// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { createPageUrl } from "@/utils";
// import { Trip } from "@/api/entities";
// import { User } from "@/api/entities";
// import { Expense } from "@/api/entities";
// import { Contribution } from "@/api/entities";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import {
//   MapPin,
//   Calendar,
//   Users,
//   Share2,
//   Clock,
//   DollarSign,
//   Copy,
//   CheckCircle,
//   Receipt,
//   ImageIcon,
//   MessageCircle
// } from "lucide-react";
// import { format, differenceInDays } from "date-fns";
// import CountdownTimer from "../components/dashboard/CountdownTimer";
// import BookingDeadlineTimer from "../components/dashboard/BookingDeadlineTimer";
// import ActivityFeed from "../components/dashboard/ActivityFeed";
// import ContributionBreakdown from "../components/dashboard/ContributionBreakdown";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [trip, setTrip] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [contributions, setContributions] = useState([]);
//   const [participants, setParticipants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       const currentUser = await User.me();
//       setUser(currentUser);

//       if (!currentUser.current_trip_id) {
//         navigate(createPageUrl("MyTrips"));
//         return;
//       }

//       // Ensure only admins can access this Dashboard
//       if (currentUser.trip_role !== 'admin') {
//         navigate(createPageUrl("ParticipantDashboard"));
//         return;
//       }

//       const currentTrip = await Trip.get(currentUser.current_trip_id);
//       setTrip(currentTrip);

//       const tripExpenses = await Expense.filter({ trip_id: currentTrip.id });
//       setExpenses(tripExpenses);

//       const tripContributions = await Contribution.filter({ trip_id: currentTrip.id });
//       setContributions(tripContributions);

//       const allUsers = await User.filter({ current_trip_id: currentTrip.id });
//       setParticipants(allUsers);

//     } catch (error) {
//       console.error("Error loading dashboard:", error);
//       navigate(createPageUrl("Home"));
//     }
//     setLoading(false);
//   };

//   const handleShareInvite = async () => {
//     if (!trip) return;

//     // CORRECTED: Now points to the backend function for public preview
//     const inviteUrl = `${window.location.origin}/functions/tripInvitePreview?trip_id=${trip.id}&code=${trip.invite_code}`;

//     const fallbackShare = async (urlToCopy) => {
//       await navigator.clipboard.writeText(urlToCopy);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     };

//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: `Join ${trip.occasion}`,
//           text: `You're invited to join our trip to ${trip.destination}!`,
//           url: inviteUrl,
//         });
//         setCopied(false);
//       } catch (error) {
//         if (error.name !== 'AbortError') {
//           fallbackShare(inviteUrl);
//         }
//       }
//     } else {
//       fallbackShare(inviteUrl);
//     }
//   };

//   const getTotalContributed = () => {
//     return contributions.reduce((sum, contrib) => sum + contrib.amount_paid, 0);
//   };

//   const getMyContribution = () => {
//     return contributions.find(c => c.user_id === user?.id);
//   };

//   const getTotalExpenses = () => {
//     return expenses.reduce((sum, expense) => sum + expense.amount, 0);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!trip) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-slate-800 mb-4">No Active Trip</h2>
//           <Button onClick={() => navigate(createPageUrl("MyTrips"))}>
//             View My Trips
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Since this Dashboard component is only accessible to admins (checked in loadDashboardData),
//   // isAdmin will always be true here.
//   const isAdmin = user?.trip_role === 'admin';
//   const totalContributed = getTotalContributed();
//   const myContribution = getMyContribution();
//   const totalExpenses = getTotalExpenses();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto space-y-6">

//         {/* Trip Banner */}
//         {trip && (
//           <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl">
//             {trip.trip_image_url ? (
//               <>
//                 <img
//                   src={trip.trip_image_url}
//                   alt={trip.occasion}
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
//                 <div className="absolute bottom-6 left-6 right-6 text-white">
//                   <div className="flex items-center gap-3 mb-2">
//                     {/* Badge hardcoded to "Trip Admin" as this dashboard is only for admins */}
//                     <Badge className="bg-coral-500/90 text-white backdrop-blur-sm">
//                       Trip Admin
//                     </Badge>
//                     <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
//                       {trip.status}
//                     </Badge>
//                   </div>
//                   <h1 className="text-4xl md:text-5xl font-bold mb-2">{trip.occasion}</h1>
//                   <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xl">
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-5 h-5" />
//                       {trip.destination}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-5 h-5" />
//                       {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
//                     </div>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
//                 <div className="text-center text-slate-600">
//                   <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <h2 className="text-2xl font-bold mb-2">{trip.occasion}</h2>
//                   <div className="flex flex-col items-center gap-2 text-lg mb-4">
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-5 h-5" />
//                       {trip.destination}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-5 h-5" />
//                       {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
//                     </div>
//                   </div>
//                   {/* Photo prompt displayed universally now, as this dashboard is admin-only */}
//                   <p className="text-sm opacity-75">Add a photo for this trip!</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Invite Link */}
//         <div className="bg-blue-50 rounded-2xl p-6 flex flex-col justify-center shadow-lg border border-blue-100">
//             <h3 className="text-sm font-semibold text-slate-800 mb-2">Trip Invite Link</h3>
//             <p className="text-xs text-slate-600 mb-3">Share this link with others to invite them to your trip</p>
//             <Button
//               onClick={handleShareInvite}
//               className="w-full bg-coral-500 hover:bg-coral-600 text-white shadow-lg"
//               size="sm"
//             >
//               {copied ? (
//                 <>
//                   <CheckCircle className="w-4 h-4 mr-2" />
//                   Copied!
//                 </>
//               ) : (
//                 <>
//                   <Share2 className="w-4 h-4 mr-2" />
//                   Share Invite
//                 </>
//               )}
//             </Button>
//           </div>

//         {/* Welcome Message Card */}
//         <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
//           <CardHeader className="pb-3">
//             <CardTitle className="text-lg font-semibold text-slate-800">
//               Welcome Message from the Trip Admin
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-slate-700 leading-relaxed">{trip?.welcome_message}</p>
//           </CardContent>
//         </Card>

//         {/* Activity Feed */}
//         <div>
//             <ActivityFeed tripId={trip.id} />
//         </div>

//         <CountdownTimer targetDate={trip?.start_date} />

//         {trip.booking_deadline && <BookingDeadlineTimer targetDate={trip.booking_deadline} />}

//         {/* Group Progress */}
//         <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-slate-800">
//               <DollarSign className="w-5 h-5 text-green-600" />
//               Group Progress
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex justify-between items-center">
//               <span className="text-slate-600">Total Contributed</span>
//               <span className="text-2xl font-bold text-green-600">
//                 ${totalContributed.toFixed(2)}
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-slate-600">Goal Amount</span>
//               <span className="text-xl font-semibold text-slate-800">
//                 ${totalExpenses.toFixed(2)}
//               </span>
//             </div>
//             <Progress
//               value={totalExpenses > 0 ? (totalContributed / totalExpenses) * 100 : 0}
//               className="h-3"
//             />
//             <p className="text-sm text-slate-500">
//               {totalExpenses > 0 ? `${((totalContributed / totalExpenses) * 100).toFixed(1)}% of total goal reached` : 'No expenses set yet'}
//             </p>
//           </CardContent>
//         </Card>

//         {/* All Participants Contribution Breakdown */}
//         <ContributionBreakdown
//           contributions={contributions}
//           participants={participants}
//           currentUserId={user?.id}
//           totalAmount={totalExpenses}
//         />

//         {/* Trip Expenses Section */}
//         {expenses.length > 0 && (
//           <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
//             <CardHeader className="border-b border-slate-100">
//               <CardTitle className="flex items-center gap-2 text-slate-800">
//                 <Receipt className="w-5 h-5 text-green-600" />
//                 Trip Expenses
//                 <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-auto">
//                   ${totalExpenses.toFixed(2)} total
//                 </Badge>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="space-y-0">
//                 {expenses.slice(0, 5).map((expense, index) => (
//                   <div
//                     key={expense.id}
//                     className={`p-4 border-l-4 border-l-green-400 hover:bg-slate-50/60 transition-colors duration-200 ${
//                       index < expenses.length - 1 && index < 4 ? 'border-b border-slate-100' : ''
//                     }`}
//                   >
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h4 className="font-semibold text-slate-800">{expense.name}</h4>
//                         {expense.description && (
//                           <p className="text-sm text-slate-600 mt-1">{expense.description}</p>
//                         )}
//                       </div>
//                       <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
//                         ${expense.amount.toFixed(2)}
//                       </Badge>
//                     </div>
//                   </div>
//                 ))}
//                 {expenses.length > 5 && (
//                   <div className="p-4 text-center border-t border-slate-100">
//                     <Button
//                       variant="outline"
//                       onClick={() => navigate(createPageUrl("Expenses"))}
//                       size="sm"
//                     >
//                       View All {expenses.length} Expenses
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Quick Actions */}
//         <div className="grid grid-cols-2 gap-6">
//           <Button
//             onClick={() => navigate(createPageUrl("Itinerary"))}
//             variant="outline"
//             className="h-24 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:bg-slate-50 shadow-lg"
//           >
//             <div className="text-center">
//               <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
//               <span className="font-semibold">Trip Itinerary</span>
//             </div>
//           </Button>

//           <Button
//             onClick={() => navigate(createPageUrl("Chat"))}
//             variant="outline"
//             className="h-24 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:bg-slate-50 shadow-lg"
//           >
//             <div className="text-center">
//               <MessageCircle className="w-8 h-8 mx-auto mb-2 text-coral-600" />
//               <span className="font-semibold">Group Chat</span>
//             </div>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trip } from "@/api/entities";
import { User } from "@/api/entities";
import { Expense } from "@/api/entities";
import { Contribution } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Calendar,
  Users,
  Share2,
  Clock,
  DollarSign,
  Copy,
  CheckCircle,
  Receipt,
  ImageIcon,
  MessageCircle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import CountdownTimer from "../components/dashboard/CountdownTimer";
import BookingDeadlineTimer from "../components/dashboard/BookingDeadlineTimer";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ContributionBreakdown from "../components/dashboard/ContributionBreakdown";
import { useQuery } from "@tanstack/react-query";
import {
  getExpenseByTripIdService,
  getExpenseListService,
} from "@/services/expense";
import { useSelector } from "react-redux";
import { getParticipantsWithContributions } from "@/services/participant";
import { getActiveTripService } from "@/services/trip";
import { useDispatch } from "react-redux";
import { setActiveTripId } from "@/store/tripSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);

  const dispatch = useDispatch();

  // first Query
  const { data: tripExpenseData } = useQuery({
    queryKey: ["getExpenseByTripIdService", tripId],
    queryFn: () => getExpenseListService(tripId, token),
    enabled: !!token && !!tripId,
  });
  const tripExpensesList = tripExpenseData?.expenses;

  console.log("Hey Iiiiaiaiaiaiaia", tripExpensesList);

  // second Query
  const { data: getContributionsData } = useQuery({
    queryKey: ["getParticipantsWithContributions", tripId],
    queryFn: () => getParticipantsWithContributions(token, tripId),
    enabled: !!token && !!tripId,
  });

  console.log(getContributionsData, "Hey I am the getContributionsData");
  // third Query
  const { data: activeTripData, isSuccess: activeTripSuccess } = useQuery({
    queryKey: ["getActiveTripData"],
    queryFn: () => getActiveTripService(token),
    enabled: !!token,
  });
  useEffect(() => {
    if (activeTripSuccess && activeTripData?.data?.activeTrip?.id) {
      dispatch(setActiveTripId(activeTripData.data.activeTrip.id));
      localStorage.setItem(
        "activeTripId",
        JSON.stringify(activeTripData.data.activeTrip.id)
      );
    }
  }, [activeTripData, activeTripSuccess, dispatch]);
  const dummyUser = {
    id: 1,
    full_name: "John Doe",
    trip_role: "admin",
  };

  const dummyTrip = {
    id: 101,
    occasion: "Beach Vacation",
    destination: "Maldives",
    start_date: "2025-08-15",
    end_date: "2025-08-22",
    status: "Upcoming",
    invite_code: "ABC123",
    welcome_message: "Welcome to our amazing trip!",
    trip_image_url: "",
    booking_deadline: "2025-08-01",
  };

  const dummyExpenses = [
    { id: 1, name: "Hotel", description: "Beach resort", amount: 500 },
    { id: 2, name: "Flight", description: "Round trip ticket", amount: 800 },
    { id: 3, name: "Activities", description: "Scuba diving", amount: 300 },
  ];

  const dummyContributions = [
    {
      id: 1,
      user_id: 1,
      amount_paid: 700,
      goal_amount: 800,
      amount_remaining: 100,
    },
    {
      id: 2,
      user_id: 2,
      amount_paid: 500,
      goal_amount: 800,
      amount_remaining: 300,
    },
  ];

  const dummyParticipants = [
    { id: 1, full_name: "John Doe", trip_role: "admin" },
    { id: 2, full_name: "Jane Smith", trip_role: "member" },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}/tripInvitePreview?trip_id=${dummyTrip.id}&code=${dummyTrip.invite_code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${dummyTrip.occasion}`,
          text: `You're invited to join our trip to ${dummyTrip.destination}!`,
          url: inviteUrl,
        });
        setCopied(false);
      } catch {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTotalContributed = () =>
    dummyContributions.reduce((sum, c) => sum + c.amount_paid, 0);

  const getTotalExpenses = () =>
    dummyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalContributed = getTotalContributed();
  const totalExpenses = getTotalExpenses();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg">
          {dummyTrip.trip_image_url ? (
            <img
              src={dummyTrip.trip_image_url}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-slate-700">
                  {dummyTrip.occasion}
                </h2>
                <p className="text-sm text-slate-500">
                  Add a photo for this trip!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Invite */}
        {/* <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            Trip Invite Link
          </h3>
          <p className="text-xs text-slate-600 mb-3">Share this with others</p>
          <Button
            onClick={handleShareInvite}
            className="bg-coral-500 hover:bg-coral-600 text-white w-full"
            size="sm"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" /> Share Invite
              </>
            )}
          </Button>
        </div> */}

        {/* Welcome */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Welcome Message from Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{dummyTrip.welcome_message}</p>
          </CardContent>
        </Card>

        {/* Countdown & Booking Deadline */}
        <CountdownTimer targetDate={dummyTrip.start_date} />
        <BookingDeadlineTimer targetDate={dummyTrip.booking_deadline} />

        {/* Group Progress */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center text-slate-800">
              <DollarSign className="w-5 h-5 text-green-600" /> Group Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Contributed</span>
              <span className="font-bold text-green-600">
                ${totalContributed.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Goal Amount</span>
              <span>${totalExpenses.toFixed(2)}</span>
            </div>
            <Progress
              value={
                totalExpenses ? (totalContributed / totalExpenses) * 100 : 0
              }
            />
            <p className="text-sm text-slate-500">
              {totalExpenses > 0
                ? `${((totalContributed / totalExpenses) * 100).toFixed(
                    1
                  )}% of goal reached`
                : "No expenses set"}
            </p>
          </CardContent>
        </Card>

        {/* Contributions Breakdown */}
        <ContributionBreakdown
          contributions={dummyContributions}
          participants={dummyParticipants}
          currentUserId={dummyUser.id}
          totalAmount={totalExpenses}
        />

        {/* Trip Expenses */}
        {dummyExpenses.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" /> Trip Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dummyExpenses.map((e) => (
                <div key={e.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{e.name}</div>
                      {e.description && (
                        <div className="text-sm text-slate-500">
                          {e.description}
                        </div>
                      )}
                    </div>
                    <div>${e.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Activity Feed (use test mode) */}
        <ActivityFeed tripId="dummy" />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          <Button className="h-24 bg-white/80 backdrop-blur-sm hover:bg-slate-50 shadow-lg">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <span className="font-semibold">Itinerary</span>
            </div>
          </Button>
          <Button className="h-24 bg-white/80 backdrop-blur-sm hover:bg-slate-50 shadow-lg">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-coral-600" />
              <span className="font-semibold">Group Chat</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
