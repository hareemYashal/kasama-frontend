import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Settings,
  PenLine,
} from "lucide-react";
import { format } from "date-fns";
import CountdownTimer from "../components/dashboard/CountdownTimer";
import BookingDeadlineTimer from "../components/dashboard/BookingDeadlineTimer";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ContributionBreakdown from "../components/dashboard/ContributionBreakdown";
import { useQuery } from "@tanstack/react-query";
import {
  getExpenseByTripIdService,
  getExpenseListService,
} from "@/services/expense";
import { useSelector, useDispatch } from "react-redux";
import {
  getParticipantsWithContributions,
  totalParticipantsService,
} from "@/services/participant";
import { getActiveTripService, getTripService } from "@/services/trip";
import { setActiveTripId } from "@/store/tripSlice";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const dispatch = useDispatch();

  // Query for expense list
  const { data: tripExpenseData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["getExpenseListQuery", tripId],
    queryFn: () => getExpenseListService(tripId, token),
    enabled: !!token && !!tripId,
  });

  // Query for participant contributions
  // const { data: getContributionsData, isLoading: isLoadingContributions } =
  //   useQuery({
  //     queryKey: ["getParticipantsWithContributions", tripId],
  //     queryFn: () => getParticipantsWithContributions(token, tripId),
  //     enabled: !!token && !!tripId,
  //   });

  const { data: getContributionsData, isLoading: isLoadingContributions } =
    useQuery({
      queryKey: ["totalParticipantsService"],
      queryFn: () => totalParticipantsService(token, tripId),
      enabled: !!token && !!tripId,
    });

  // Query for active trip
  // const { data: activeTripData, isLoading: isLoadingActiveTrip } = useQuery({
  //   queryKey: ["getActiveTripData"],
  //   queryFn: () => getActiveTripService(token),
  //   enabled: !!token,
  // });

  const { data: activeTripData, isLoading: isLoadingActiveTrip } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  console.log("activeTripData----000998>>>", activeTripData);
  // Query for trip expense details
  const { data: tripExpenseDetails, isLoading: isLoadingExpenseDetails } =
    useQuery({
      queryKey: ["getExpenseByTripIdService", tripId],
      queryFn: () => getExpenseByTripIdService(token, tripId),
      enabled: !!token && !!tripId,
    });

  // State management with useEffect to sync with query data
  const [tripExpenses, setTripExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [participantContributionData, setParticipantContributionData] =
    useState({});
  const [activeTripDataState, setActiveTripDataState] = useState({});

  useEffect(() => {
    if (tripExpenseData?.expenses) {
      setTripExpenses(tripExpenseData.expenses);
      setTotalAmount(tripExpenseData?.totalAmount);
    }
  }, [tripExpenseData]);
  useEffect(() => {
    if (getContributionsData?.data) {
      setParticipantContributionData(getContributionsData.data);
    }
  }, [getContributionsData]);

  console.log("activeTripDataState", activeTripDataState);
  const participants = getContributionsData?.data?.participants?.map((p) => ({
    id: p.user.id,
    name: p.user.name,
    role: p.user.role,
  }));

  const contributions = getContributionsData?.data?.participants?.map((p) => ({
    id: p.id,
    user: p.user, // already has id, name, role
    // instead of paidAmount from participant, use paymentInfo
    amountPaid: p.paymentInfo?.amountPaid ?? 0,
    goal: p.paymentInfo?.your_goal ?? 0,
    remainings: p.paymentInfo?.remainings ?? 0,
    overpaid: p.paymentInfo?.overpaid ?? 0,
  }));

  useEffect(() => {
    if (activeTripData?.data?.activeTrip) {
      setActiveTripDataState(activeTripData.data.activeTrip);
      // dispatch(setActiveTripId(activeTripData.data.activeTrip.id));
      localStorage.setItem(
        "activeTripId",
        JSON.stringify(activeTripData.data.activeTrip.id)
      );
    }
  }, [activeTripData, dispatch]);

  const tripDataList = tripExpenseDetails?.data?.data;
  console.log("tripDataList", tripDataList);
  // Handle loading state
  const isLoading =
    isLoadingExpenses ||
    isLoadingContributions ||
    isLoadingActiveTrip ||
    isLoadingExpenseDetails;

  // Share invite handler
  const handleShareInvite = async () => {
    const inviteUrl = `${window.location.origin}/JoinTrip?trip_id=${
      activeTripDataState?.id || "101"
    }&code=${activeTripDataState?.invite_code || "TEMP1255"}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        // Fallback for non-HTTPS or unsupported browsers
        const textArea = document.createElement("textarea");
        textArea.value = inviteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Calculate totals (using real data instead of dummy)
  const getTotalContributed = () =>
    participantContributionData?.contributions?.reduce(
      (sum, c) => sum + c.amount_paid,
      0
    ) || 0;

  const getTotalExpenses = () =>
    tripExpenses?.reduce((sum, e) => sum + e.expense_amount, 0) || 0;

  const totalContributed = getTotalContributed();
  const totalExpenses = getTotalExpenses();

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="h-12 w-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log("activeTripDataState", activeTripDataState);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        {activeTripDataState && (
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl group">
            {activeTripDataState?.image ? (
              <>
                {/* Trip Image */}
                <img
                  src={activeTripDataState.image}
                  alt={activeTripDataState.trip_occasion || "Trip Image"}
                  className="w-full h-full object-cover"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-blue-600/90 text-white backdrop-blur-sm text-xs sm:text-sm">
                      Trip Admin
                    </Badge>

                    {(() => {
                      if (
                        !activeTripDataState?.start_date ||
                        !activeTripDataState?.end_date
                      )
                        return null;

                      const today = new Date();
                      const start = new Date(activeTripDataState.start_date);
                      const end = new Date(activeTripDataState.end_date);

                      // Normalize (remove time part, only compare dates)
                      const todayDate = new Date(
                        today.toISOString().split("T")[0]
                      );
                      const startDate = new Date(
                        start.toISOString().split("T")[0]
                      );
                      const endDate = new Date(end.toISOString().split("T")[0]);

                      if (startDate <= todayDate && todayDate <= endDate) {
                        return (
                          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 bg-slate-700/70 text-white backdrop-blur-sm text-xs sm:text-sm">
                            Active
                          </div>
                        );
                      }

                      return null;
                    })()}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {activeTripDataState.trip_occasion}
                  </h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xl">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {activeTripDataState?.destination}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {format(
                        new Date(activeTripDataState?.start_date),
                        "MMM d"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(activeTripDataState?.end_date),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </div>
                </div>
                {/* Edit Button (hover on group) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => navigate(createPageUrl("managetrip"))}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 bg-white/90 hover:bg-white text-slate-800 shadow-lg backdrop-blur-sm border border-white/20"
                  >
                    <PenLine />
                    Edit Trip
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Placeholder design when no image */}
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">
                      {activeTripDataState.trip_occasion}
                    </h2>

                    <div className="flex flex-col items-center gap-2 text-lg mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {activeTripDataState.destination}
                      </div>

                      {activeTripDataState?.start_date &&
                        activeTripDataState?.end_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {format(
                              new Date(activeTripDataState?.start_date),
                              "MMM d"
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(activeTripDataState?.end_date),
                              "MMM d, yyyy"
                            )}
                          </div>
                        )}

                      <p className="text-xs sm:text-sm text-slate-500">
                        Add a photo for this trip!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit button (hover on group) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => navigate(createPageUrl("managetrip"))}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 rounded-md px-3 bg-slate-800 hover:bg-slate-900 text-white shadow-lg"
                  >
                    <PenLine />
                    Edit Trip
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="bg-blue-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg text-white w-full">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-1">
              Invite Your Crew!
            </h3>
            <p className="text-blue-200 text-sm">
              Share this link with friends to let them join the trip
            </p>
          </div>
          <Button
            onClick={handleShareInvite}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-11 w-full md:w-auto bg-white hover:bg-slate-100 text-blue-600 font-bold shadow-lg text-base px-8 py-3 rounded-full transition-all hover:shadow-xl"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Get Invite Link
              </>
            )}
          </Button>
        </div>

        {/* Welcome */}
        {activeTripDataState?.welcome_message && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div
                  data-filename="pages/Dashboard"
                  data-linenumber="363"
                  data-visual-selector-id="pages/Dashboard363"
                  data-source-location="pages/Dashboard:363:16"
                  data-dynamic-content="false"
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-message-circle w-6 h-6 text-white"
                    data-filename="pages/Dashboard"
                    data-linenumber="364"
                    data-visual-selector-id="pages/Dashboard364"
                    data-source-location="pages/Dashboard:364:20"
                    data-dynamic-content="false"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 mb-1">
                    A Welcome Message from the Trip Admin
                  </CardTitle>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base break-words">
                    {activeTripDataState?.welcome_message}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Countdown & Booking Deadline */}
          {activeTripDataState?.start_date && (
            <CountdownTimer targetDate={activeTripDataState.start_date} />
          )}
          {activeTripDataState?.start_date &&
            activeTripDataState?.booking_deadline && (
              <BookingDeadlineTimer
                startDate={activeTripDataState.start_date}
                bookingDeadline={activeTripDataState.booking_deadline} // e.g. 6 = 6 weeks before
              />
            )}
        </div>

        {/* Group Progress */}
        {tripDataList && (
          <div className="rounded-lg bg-card text-card-foreground bg-gradient-to-br from-white via-emerald-50/30 to-green-50/20 shadow-xl border-2 border-emerald-200/40 w-full relative overflow-hidden">
            {/* Animated Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse opacity-30"></div>

            {/* Header */}
            <div className="flex flex-col space-y-1.5 p-4 sm:p-6 relative z-10">
              <h3 className="tracking-tight flex items-center gap-3 text-emerald-700 text-xl sm:text-2xl font-bold">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-dollar-sign w-5 h-5 sm:w-6 sm:h-6 text-white"
                  >
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                Group Progress
              </h3>
            </div>

            {/* Content */}
            <div className="space-y-6 p-4 sm:p-6 pt-0 relative z-10">
              {/* Total Contributed */}
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-base sm:text-lg font-medium">
                  Total Contributed
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 drop-shadow-sm">
                  ${tripDataList.baseAmountContributed?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Goal Amount */}
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-base sm:text-lg font-medium">
                  Goal Amount
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-700">
                  ${tripDataList.total_goal?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Remaining */}
              {/* <div className="flex justify-between items-center">
                <span className="text-slate-600 text-base sm:text-lg font-medium">
                  Remaining
                </span>
                <span className="text-xl sm:text-2xl font-bold text-red-600">
                  ${tripDataList.remaining?.toFixed(2) || "0.00"}
                </span>
              </div> */}

              {/* Overpaid */}
              {/* {tripDataList.overpaid > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-base sm:text-lg font-medium">
                    Overpaid
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-orange-500">
                    ${tripDataList.overpaid?.toFixed(2)}
                  </span>
                </div>
              )} */}

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="relative w-full overflow-hidden rounded-full bg-slate-200 h-5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 transition-all"
                    style={{
                      width: `${
                        tripDataList?.total_goal
                          ? (tripDataList.baseAmountContributed /
                              tripDataList.total_goal) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm sm:text-base text-slate-600 font-medium">
                    {tripDataList?.total_goal
                      ? `${(
                          (tripDataList.baseAmountContributed /
                            tripDataList.total_goal) *
                          100
                        ).toFixed(1)}% of goal reached`
                      : "No expenses set yet"}
                  </p>
                  {/* Motivational text */}
                  <p className="text-slate-600 font-semibold text-sm">
                    Let’s get this trip funded! 💰
                  </p>
                </div>
              </div>

              {/* Per Person */}
              {/* <div className="flex justify-between items-center text-sm sm:text-base text-slate-600">
                <span>Per Person Goal</span>
                <span className="font-semibold">
                  ${tripDataList.per_person?.toFixed(2) || "0.00"}
                </span>
              </div> */}

              {/* Bottom "Only $xxx left" box */}
              {/* {tripDataList.remaining > 0 && ( */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
                <p className="text-emerald-800 font-medium text-center">
                  Only{" "}
                  <span className="font-bold text-lg">
                    ${tripDataList.remaining?.toFixed(2)}
                  </span>{" "}
                  left to reach your goal!
                </p>
              </div>
              {/* )} */}
            </div>
          </div>
        )}

        {/* Contributions Breakdown */}
        {participantContributionData?.contributions?.length > 0 && (
          <ContributionBreakdown
            participantContributionData={participantContributionData}
          />
        )}
        <ContributionBreakdown
          participantContributionData={{ participants }}
          contributions={contributions}
          participants={participants}
          totalAmount={participantContributionData?.totalTripGoal || 0}
        />

        {/* Trip Expenses */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-1.5 border-b border-slate-100 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 font-semibold tracking-tight text-green-700 text-base sm:text-lg">
              <Receipt className="w-6 h-6 text-green-600" />
              Expenses
              {totalAmount > 0 && (
                <Badge
                  variant="outline"
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-green-50 text-green-700 border-green-200 ml-2 text-xs sm:text-sm flex-shrink-0"
                >
                  ${totalAmount} total
                </Badge>
              )}
            </CardTitle>
            {user.trip_role === "creator" && (
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-9 rounded-md flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4 bg-green-600 hover:bg-green-700 text-white"
                data-filename="pages/Dashboard"
                data-linenumber="464"
                data-visual-selector-id="pages/Dashboard464"
                data-source-location="pages/Dashboard:464:18"
                data-dynamic-content="false"
                onClick={() => navigate(createPageUrl("expenses"))}
              >
                <Settings />
                <span
                  data-filename="pages/Dashboard"
                  data-linenumber="470"
                  data-visual-selector-id="pages/Dashboard470"
                  data-source-location="pages/Dashboard:470:20"
                  data-dynamic-content="false"
                  className="hidden sm:inline"
                >
                  Manage Expense
                </span>
                <span
                  data-filename="pages/Dashboard"
                  data-linenumber="471"
                  data-visual-selector-id="pages/Dashboard471"
                  data-source-location="pages/Dashboard:471:20"
                  data-dynamic-content="false"
                  className="sm:hidden"
                >
                  Manage
                </span>
              </button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {tripExpenses?.length === 0 ? (
                <div
                  data-filename="pages/Dashboard"
                  data-linenumber="545"
                  data-visual-selector-id="pages/Dashboard545"
                  data-source-location="pages/Dashboard:545:18"
                  data-dynamic-content="false"
                  className="p-8 text-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-receipt w-12 h-12 text-slate-300 mx-auto mb-3"
                    data-filename="pages/Dashboard"
                    data-linenumber="546"
                    data-visual-selector-id="pages/Dashboard546"
                    data-source-location="pages/Dashboard:546:20"
                    data-dynamic-content="false"
                  >
                    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <path d="M12 17.5v-11"></path>
                  </svg>
                  <p
                    data-filename="pages/Dashboard"
                    data-linenumber="547"
                    data-visual-selector-id="pages/Dashboard547"
                    data-source-location="pages/Dashboard:547:20"
                    data-dynamic-content="false"
                    className="text-slate-600 text-lg"
                  >
                    No expenses yet.
                  </p>
                  <p
                    data-filename="pages/Dashboard"
                    data-linenumber="548"
                    data-visual-selector-id="pages/Dashboard548"
                    data-source-location="pages/Dashboard:548:20"
                    data-dynamic-content="false"
                    className="text-slate-500 text-sm mt-1"
                  >
                    Go to the Manage Expenses page to add the first one!
                  </p>
                </div>
              ) : (
                <>
                  {tripExpenses.slice(0, 5).map((expense, index) => (
                    <div
                      key={expense.id}
                      className={`p-4 border-l-4 border-l-green-400 ${
                        index < tripExpenses?.length - 1 && index < 4
                          ? "border-b border-slate-100"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                            {expense.expense_name}
                          </h4>
                          {expense.description && (
                            <p className="text-xs text-slate-600 mt-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-green-50 text-green-700 border-green-200 flex-shrink-0 text-xs sm:text-sm"
                        >
                          ${expense.expense_amount}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {tripExpenses?.length > 5 && (
                    <div className="p-4 text-center border-t border-slate-100">
                      <Button
                        variant="outline"
                        onClick={() => navigate(createPageUrl("Expenses"))}
                        size="sm"
                      >
                        View All {tripExpenses?.length} Expenses
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        {/* {activeTripDataState?.id && <ActivityFeed trip={activeTripDataState} />} */}
      </div>
    </div>
  );
}
