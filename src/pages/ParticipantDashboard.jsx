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
  Clock,
  DollarSign,
  Receipt,
  ImageIcon,
  MessageCircle,
  Share2,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import CountdownTimer from "../components/dashboard/CountdownTimer";
import BookingDeadlineTimer from "../components/dashboard/BookingDeadlineTimer";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ContributionBreakdown from "../components/dashboard/ContributionBreakdown";
import { useQuery } from "@tanstack/react-query";
import { getExpenseListService } from "@/services/expense";
import { useSelector } from "react-redux";
import {
  getParticipantsWithContributions,
  totalParticipantsService,
} from "@/services/participant";
import { getActiveTripService } from "@/services/trip";
import { getPaymentRemainingsService } from "@/services/paynent";

export default function ParticipantDashboard() {
  // const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  // const [trip, setTrip] = useState(null);
  // const [expenses, setExpenses] = useState([]);
  // const [contributions, setContributions] = useState([]);
  // const [participants, setParticipants] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [copied, setCopied] = useState(false);

  // useEffect(() => {
  //   loadDashboardData();
  // }, []);

  // const loadDashboardData = async () => {
  //   try {
  //     const currentUser = await User.me();
  //     setUser(currentUser);

  //     if (!currentUser.current_trip_id) {
  //       navigate(createPageUrl("MyTrips"));
  //       return;
  //     }

  //     const currentTrip = await Trip.get(currentUser.current_trip_id);
  //     setTrip(currentTrip);

  //     const [tripExpenses, tripContributions, allUsers] = await Promise.all([
  //       Expense.filter({ trip_id: currentTrip.id }),
  //       Contribution.filter({ trip_id: currentTrip.id }),
  //       User.filter({ current_trip_id: currentTrip.id })
  //     ]);

  //     setExpenses(tripExpenses);
  //     setContributions(tripContributions);
  //     setParticipants(allUsers);

  //   } catch (error) {
  //     console.error("Error loading dashboard:", error);
  //     navigate(createPageUrl("Home"));
  //   }
  //   setLoading(false);
  // };

  // const handleShareInvite = async () => {
  //   if (!trip) return;

  //   // CORRECTED: Now points to the backend function for public preview
  //   const inviteUrl = `${window.location.origin}/functions/tripInvitePreview?trip_id=${trip.id}&code=${trip.invite_code}`;

  //   const fallbackShare = async (urlToCopy) => {
  //     await navigator.clipboard.writeText(urlToCopy);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   };

  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: `Join ${trip.occasion}`,
  //         text: `You're invited to join our trip to ${trip.destination}!`,
  //         url: inviteUrl,
  //       });
  //       setCopied(false);
  //     } catch (error) {
  //       if (error.name !== 'AbortError') {
  //         fallbackShare(inviteUrl);
  //       }
  //     }
  //   } else {
  //     fallbackShare(inviteUrl);
  //   }
  // };

  // const getTotalContributed = () => {
  //   return contributions.reduce((sum, contrib) => sum + contrib.amount_paid, 0);
  // };

  // const getMyContribution = () => {
  //   return contributions.find(c => c.user_id === user?.id);
  // };

  // const getTotalExpenses = () => {
  //   return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!trip) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <h2 className="text-2xl font-bold text-slate-800 mb-4">No Active Trip</h2>
  //         <Button onClick={() => navigate(createPageUrl("Home"))}>
  //           Go Home
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  // const isAdmin = user?.trip_role === 'admin';
  // const totalContributed = getTotalContributed();
  // const myContribution = getMyContribution();
  // const totalExpenses = getTotalExpenses();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [, setContributions] = useState([]);
  const [, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const authUser = useSelector((state) => state.user.user);
  const authUerId = authUser?.id;

  const { data: expenseDataList, isSuccess: expenseListSuccess } = useQuery({
    queryKey: ["getExpenseListQuery", tripId],
    queryFn: () => getExpenseListService(tripId, token),
    enabled: !!tripId && !!token,
  });

  const { data: participantsData } = useQuery({
    queryKey: ["totalParticipantsService"],
    queryFn: () => totalParticipantsService(token, tripId),
    enabled: !!token && !!tripId,
  });

  const { data: activeTripData, isLoading: isLoadingActiveTrip } = useQuery({
    queryKey: ["getActiveTripData"],
    queryFn: () => getActiveTripService(token),
    enabled: !!token,
  });

  const { data: paymentData, isSuccess: isPaymentDataSuccess } = useQuery({
    queryKey: ["getPaymentRemainingsQuery", tripId, authUerId],
    queryFn: () => getPaymentRemainingsService(token, tripId, authUerId),
    enabled: !!token && !!tripId && !!authUerId,
  });

  const myContribution = paymentData?.data?.data;
  console.log("paymentData()()", paymentData);
  console.log("activeTripData--->", activeTripData);

  const apiData = participantsData?.data;
  console.log("apiData--->", apiData);
  // Map API response to match component props
  const participants = apiData?.participants.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    role: p.user.role,
  }));

  const contributions = apiData?.participants.map((p) => ({
    id: p.id,
    user: p.user, // already has id, name, role
    // instead of paidAmount from participant, use paymentInfo
    amountPaid: p.paymentInfo?.amountPaid ?? 0,
    goal: p.paymentInfo?.your_goal ?? 0,
    remainings: p.paymentInfo?.remainings ?? 0,
    overpaid: p.paymentInfo?.overpaid ?? 0,
  }));

  console.log("participants--->", participants);
  console.log("contributions--->", contributions);

  const tripExpensesList = expenseDataList?.expenses;
  const totalAmount = expenseDataList?.totalAmount;
  console.log("tripExpensesList", tripExpensesList);
  console.log("totalAmount", totalAmount);
  useEffect(() => {
    if (activeTripData?.data?.activeTrip) {
      setTrip(activeTripData.data.activeTrip);
      setLoading(false);
    }
  }, [activeTripData]);

  const handleShareInvite = async () => {
    if (!trip) return;

    const inviteUrl = `${window.location.origin}/functions/tripInvitePreview?trip_id=${trip.id}&code=${trip.invite_code}`;

    const fallbackShare = async (urlToCopy) => {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${trip.occasion}`,
          text: `You're invited to join our trip to ${trip.destination}!`,
          url: inviteUrl,
        });
        setCopied(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          fallbackShare(inviteUrl);
        }
      }
    } else {
      fallbackShare(inviteUrl);
    }
  };

  const getTotalContributed = () => {
    return contributions?.reduce(
      (sum, contrib) => sum + contrib.amount_paid,
      0
    );
  };

  const getMyContribution = () => {
    return contributions?.find((c) => c.user_id === user?.id);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            No Active Trip
          </h2>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const mockParticipants = [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "member" },
    { id: 3, name: "Charlie", role: "member" },
  ];

  const mockContributions = [
    {
      id: 101,
      user_id: 1,
      user: { id: 1, name: "Alice", role: "admin" },
      paidAmount: 120,
      mygoal: 200,
    },
    {
      id: 102,
      user_id: 2,
      user: { id: 2, name: "Bob", role: "member" },
      paidAmount: 80,
      mygoal: 150,
    },
    {
      id: 103,
      user_id: 3,
      user: { id: 3, name: "Charlie", role: "member" },
      paidAmount: 200,
      mygoal: 200,
    },
  ];

  const mockData = {
    participants: mockParticipants,
  };

  const isAdmin = user?.trip_role === "admin";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Trip Image Header */}
        {trip && (
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl">
            {trip?.image ? (
              <>
                <img
                  src={trip?.image}
                  alt={trip.trip_occasion}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-blue-500/90 text-white backdrop-blur-sm">
                      Participant
                    </Badge>
                    {/* <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
                      {trip.status}
                    </Badge> */}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {trip.trip_occasion}
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {trip.destination}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(trip.start_date), "MMM d")} -{" "}
                      {format(new Date(trip.end_date), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <div className="text-center text-slate-600">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h2 className="text-2xl font-bold mb-2">
                    {trip.trip_occasion}
                  </h2>
                  <div className="flex flex-col items-center gap-2 text-lg mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {trip.destination}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(trip.start_date), "MMM d")} -{" "}
                      {format(new Date(trip.end_date), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invite Link */}
        <div className="bg-blue-50 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center shadow-lg border border-blue-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Invite Your Friends!
            </h3>
            <p className="text-sm text-slate-600">
              Share this link to invite others to the trip.
            </p>
          </div>
          <Button
            onClick={handleShareInvite}
            className="mt-4 sm:mt-0 w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white shadow-lg"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share Invite
              </>
            )}
          </Button>
        </div>

        {/* Welcome Message Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Welcome Message from the Trip Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              {trip?.welcome_message}
            </p>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <div>
          {activeTripData?.data?.activeTrip?.id && (
            <ActivityFeed trip={activeTripData?.data?.activeTrip} />
          )}{" "}
        </div>

        <CountdownTimer
          targetDate={activeTripData?.data?.activeTrip?.start_date}
        />

        {activeTripData?.data?.activeTrip.start_date && (
          <BookingDeadlineTimer
            startDate={activeTripData?.data?.activeTrip.start_date}
          />
        )}

        {/* My Contribution Card */}
        {myContribution && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <DollarSign className="w-5 h-5 text-blue-600" /> My Contribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Amount Paid</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${myContribution.amountPaid}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">My Goal</span>
                <span className="text-xl font-semibold text-slate-800">
                  ${myContribution.your_goal}
                </span>
              </div>
              <Progress
                value={
                  myContribution.your_goal > 0
                    ? (myContribution.amountPaid /
                        myContribution.your_goal) *
                      100
                    : 0
                }
                className="h-3"
              />
            </CardContent>
          </Card>
        )}

        {/* All Participants Contribution Breakdown */}
        <ContributionBreakdown
          participantContributionData={{ participants }}
          contributions={contributions}
          participants={participants}
          totalAmount={apiData?.totalTripGoal || 0}
        />

        {/* Trip Expenses Section */}
        {/* Trip Expenses Section */}
        {tripExpensesList?.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Receipt className="w-5 h-5 text-green-600" />
                Trip Expenses
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 ml-auto"
                >
                  ${totalAmount} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {tripExpensesList.slice(0, 5).map((expense, index) => (
                  <div
                    key={expense.id}
                    className={`p-4 border-l-4 border-l-green-400 ${
                      index < tripExpensesList.length - 1 && index < 4
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {expense.expense_name}
                        </h4>
                        {expense.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        ${expense.expense_amount}
                      </Badge>
                    </div>
                  </div>
                ))}
                {tripExpensesList.length > 5 && (
                  <div className="p-4 text-center border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={() => navigate(createPageUrl("Expenses"))}
                      size="sm"
                    >
                      View All {tripExpensesList.length} Expenses
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          <Button
            onClick={() => navigate(createPageUrl("Itinerary"))}
            variant="outline"
            className="h-24 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:bg-slate-50 shadow-lg"
          >
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <span className="font-semibold">View Itinerary</span>
            </div>
          </Button>
          <Button
            onClick={() => navigate(createPageUrl("Chat"))}
            variant="outline"
            className="h-24 bg-white/80 backdrop-blur-sm border-slate-200/60 hover:bg-slate-50 shadow-lg"
          >
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
