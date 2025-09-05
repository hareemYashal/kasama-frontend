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
import { getParticipantsWithContributions } from "@/services/participant";
import { getActiveTripService, getTripService } from "@/services/trip";
import { setActiveTripId } from "@/store/tripSlice";

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();

  // Query for expense list
  const { data: tripExpenseData, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["getExpenseListQuery", tripId],
    queryFn: () => getExpenseListService(tripId, token),
    enabled: !!token && !!tripId,
  });

  // Query for participant contributions
  const { data: getContributionsData, isLoading: isLoadingContributions } =
    useQuery({
      queryKey: ["getParticipantsWithContributions", tripId],
      queryFn: () => getParticipantsWithContributions(token, tripId),
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
    queryFn: () => getTripService(token, tripId),
    enabled: !!token,
  });
  // Query for trip expense details
  const { data: tripExpenseDetails, isLoading: isLoadingExpenseDetails } =
    useQuery({
      queryKey: ["getExpenseByTripIdService", tripId],
      queryFn: () => getExpenseByTripIdService(token, tripId),
      enabled: !!token && !!tripId,
    });

  // State management with useEffect to sync with query data
  const [tripExpenses, setTripExpenses] = useState([]);
  const [participantContributionData, setParticipantContributionData] =
    useState({});
  const [activeTripDataState, setActiveTripDataState] = useState({});

  useEffect(() => {
    if (tripExpenseData?.expenses) {
      setTripExpenses(tripExpenseData.expenses);
    }
  }, [tripExpenseData]);

  useEffect(() => {
    if (getContributionsData?.data) {
      setParticipantContributionData(getContributionsData.data);
    }
  }, [getContributionsData]);

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
    const inviteUrl = `${window.location.origin}/tripInvitePreview?trip_id=${
      activeTripDataState?.id || "101"
    }&code=${activeTripDataState?.invite_code || "ABC123"}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${activeTripDataState?.occasion || "Trip"}`,
          text: `You're invited to join our trip to ${
            activeTripDataState?.destination || "Destination"
          }!`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg">
          {activeTripDataState?.image ? (
            <img
              src={activeTripDataState.image}
              alt={activeTripDataState.destination || "Trip Image"}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-slate-700">
                  {activeTripDataState?.destination || "No Destination"}
                </h2>
                <p className="text-sm text-slate-500">
                  Add a photo for this trip!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Welcome */}
        {activeTripDataState?.welcome_message && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Welcome Message from Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{activeTripDataState.welcome_message}</p>
            </CardContent>
          </Card>
        )}

        {/* Countdown & Booking Deadline */}
        {activeTripDataState?.start_date && (
          <CountdownTimer targetDate={activeTripDataState.start_date} />
        )}
        {activeTripDataState?.booking_deadline && (
          <BookingDeadlineTimer
            targetDate={activeTripDataState.booking_deadline}
          />
        )}

        {/* Group Progress */}
        {tripDataList && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center text-slate-800">
                <DollarSign className="w-5 h-5 text-green-600" /> Group Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total Contributed */}
              <div className="flex justify-between">
                <span>Total Contributed</span>
                <span className="font-bold text-green-600">
                  ${tripDataList.baseAmountContributed?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Goal Amount */}
              <div className="flex justify-between">
                <span>Goal Amount</span>
                <span>${tripDataList.total_goal?.toFixed(2) || "0.00"}</span>
              </div>

              {/* Remaining */}
              <div className="flex justify-between">
                <span>Remaining</span>
                <span className="text-red-600 font-semibold">
                  ${tripDataList.remaining?.toFixed(2) || "0.00"}
                </span>
              </div>

              {/* Overpaid (only show if > 0) */}
              {tripDataList.overpaid > 0 && (
                <div className="flex justify-between">
                  <span>Overpaid</span>
                  <span className="text-orange-500 font-semibold">
                    ${tripDataList.overpaid?.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <Progress
                value={
                  tripDataList?.total_goal
                    ? (tripDataList.baseAmountContributed /
                        tripDataList.total_goal) *
                      100
                    : 0
                }
              />

              {/* Progress Text */}
              <p className="text-sm text-slate-500">
                {tripDataList?.total_goal
                  ? `${(
                      (tripDataList.baseAmountContributed /
                        tripDataList.total_goal) *
                      100
                    ).toFixed(1)}% of goal reached`
                  : "No expenses set"}
              </p>

              {/* Per Person */}
              <div className="flex justify-between text-sm text-slate-600">
                <span>Per Person Goal</span>
                <span>${tripDataList.per_person?.toFixed(2) || "0.00"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributions Breakdown */}
        {participantContributionData?.contributions?.length > 0 && (
          <ContributionBreakdown
            participantContributionData={participantContributionData}
          />
        )}

        {/* Trip Expenses */}
        {tripExpenses?.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" /> Trip Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tripExpenses.map((e) => (
                <div key={e.id} className="border-b py-2">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{e.expense_name}</div>
                      {e.description && (
                        <div className="text-sm text-slate-500">
                          {e.description}
                        </div>
                      )}
                    </div>
                    <div>${e.expense_amount?.toFixed(2) || "0.00"}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        {activeTripDataState?.id && <ActivityFeed trip={activeTripDataState} />}
      </div>
    </div>
  );
}
