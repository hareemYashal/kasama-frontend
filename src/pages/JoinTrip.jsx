import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Trip } from "@/api/entities";
import { Expense } from "@/api/entities";
import { Contribution } from "@/api/entities";
import { TripActivity } from "@/api/entities";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function JoinTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Processing your invitation...");
  const [errorDetails, setErrorDetails] = useState("");
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState(null); // New state for current authenticated user
  const [joining, setJoining] = useState(false); // New state to track if join process is active

  const handleJoinTrip = useCallback(async () => {
    if (!trip || !user || joining) {
      // Prevent re-running if trip/user not loaded or if already joining
      return;
    }

    setJoining(true); // Indicate that the join process has started
    setStatus("processing"); // Ensure status is processing when starting join
    setMessage(`Welcome, ${user.full_name.split(" ")[0]}! Joining the trip...`);

    try {
      // Check if user is already part of this trip
      if (user.current_trip_id === trip.id) {
        setStatus("success");
        setMessage(
          "You are already part of this trip! Redirecting to dashboard..."
        );
        setTimeout(() => {
          navigate(
            createPageUrl(
              user.trip_role === "admin" ? "Dashboard" : "ParticipantDashboard"
            )
          );
        }, 1500);
        return; // Exit if user is already in the trip
      }

      // Update user to join the trip as participant
      await User.updateMyUserData({
        current_trip_id: trip.id,
        trip_role: "participant",
      });

      // Get all current participants (including the newly joined user) and expenses for contribution calculation
      const [allParticipants, tripExpenses] = await Promise.all([
        User.filter({ current_trip_id: trip.id }),
        Expense.filter({ trip_id: trip.id }),
      ]);

      const totalExpenses = tripExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const perPersonAmount =
        allParticipants.length > 0 ? totalExpenses / allParticipants.length : 0;

      // Create or update contribution record for the new participant
      // Check if a contribution record already exists for this user in this trip to ensure idempotency
      const existingUserContribution = await Contribution.filter({
        trip_id: trip.id,
        user_id: user.id,
      });

      if (existingUserContribution.length === 0) {
        await Contribution.create({
          trip_id: trip.id,
          user_id: user.id,
          goal_amount: perPersonAmount,
          amount_paid: 0,
          amount_remaining: perPersonAmount,
        });
      } else {
        // If it exists, update it with the new recalculated amount
        await Contribution.update(existingUserContribution[0].id, {
          goal_amount: perPersonAmount,
          amount_remaining: Math.max(
            0,
            perPersonAmount - existingUserContribution[0].amount_paid
          ),
        });
      }

      // Update contributions for all participants (recalculate split)
      const allContributions = await Contribution.filter({ trip_id: trip.id });
      for (const contribution of allContributions) {
        // Update all contributions based on the new perPersonAmount, including the newly created/updated one
        await Contribution.update(contribution.id, {
          goal_amount: perPersonAmount,
          amount_remaining: Math.max(
            0,
            perPersonAmount - contribution.amount_paid
          ),
        });
      }

      // Log activity
      const firstName = user.full_name.split(" ")[0];
      await TripActivity.create({
        trip_id: trip.id,
        user_id: user.id,
        user_first_name: firstName,
        action_type: "JOINED_TRIP",
        description: `${firstName} joined the trip.`,
        metadata: {}, // Changed metadata to an empty object as per outline
      });

      setStatus("success");
      setMessage(
        "Successfully joined the trip! Redirecting to your dashboard..."
      );

      // Redirect to participant dashboard
      setTimeout(() => {
        navigate(createPageUrl("ParticipantDashboard"));
      }, 2000);
    } catch (error) {
      console.error("Error processing invitation:", error);
      setStatus("error");
      setMessage("Unable to Join Trip");
      setErrorDetails(
        error.message ||
          "An unexpected error occurred. Please try again or contact support."
      );
    } finally {
      setJoining(false); // Reset joining state
    }
  }, [navigate, trip, user, joining]); // Dependencies for useCallback

  // Effect to initialize the invitation process and fetch user/trip data
  useEffect(() => {
    const tripId = searchParams.get("trip_id");
    const inviteCode = searchParams.get("code");

    if (!tripId || !inviteCode) {
      setStatus("error");
      setMessage("Invalid Invitation Link");
      setErrorDetails(
        "The link is missing necessary information. Please ask for a new invite."
      );
      return;
    }

    const initializeInvitation = async () => {
      try {
        // First, verify the invitation exists and get trip details
        const trips = await Trip.filter({
          id: tripId,
          invite_code: inviteCode,
        });
        if (trips.length === 0) {
          throw new Error(
            "Invitation not found. This invite link is either invalid or has expired."
          );
        }

        const tripToJoin = trips[0];
        setTrip(tripToJoin); // Set trip state

        if (tripToJoin.status === "cancelled") {
          throw new Error(
            "This trip has been cancelled and is no longer accepting new members."
          );
        }

        // Now authenticate the user
        let currentUser;
        try {
          currentUser = await User.me();
          setUser(currentUser); // Set user state
        } catch (authError) {
          // User is not authenticated, redirect to login with callback
          setMessage("Redirecting to login...");
          await User.loginWithRedirect(window.location.href);
          return; // Stop execution if redirecting
        }

        // If both user and trip are available, the subsequent useEffect will trigger handleJoinTrip
        setStatus("processing"); // Keep processing status while waiting for handleJoinTrip
        setMessage("Verifying your details...");
      } catch (error) {
        console.error("Error initializing invitation:", error);
        setStatus("error");
        setMessage("Unable to Join Trip");
        setErrorDetails(
          error.message ||
            "An unexpected error occurred. Please try again or contact support."
        );
      }
    };

    initializeInvitation();
  }, [searchParams]); // Dependencies for initial setup: only searchParams

  // Effect to trigger handleJoinTrip once user and trip states are loaded and not already joining
  useEffect(() => {
    if (user && trip && status === "processing" && !joining) {
      handleJoinTrip();
    }
  }, [user, trip, status, joining, handleJoinTrip]); // Dependencies for triggering join logic

  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "error":
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default:
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "text-blue-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Trip Details Card (if available) */}
        {trip && (
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                You're invited to join
              </CardTitle>
              <h2 className="text-3xl font-bold text-blue-600 mb-4">
                {trip.occasion}
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">
                    {format(new Date(trip.start_date), "MMM d")} -{" "}
                    {format(new Date(trip.end_date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </CardHeader>
            {trip.welcome_message && (
              <CardContent className="pt-0">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Welcome Message
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {trip.welcome_message}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Status Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mb-6">{getStatusIcon()}</div>
              <h3 className={`text-xl font-semibold mb-2 ${getStatusColor()}`}>
                {message}
              </h3>
              {errorDetails && (
                <p className="text-red-600 text-sm mt-4 bg-red-50 p-3 rounded-lg border border-red-200">
                  {errorDetails}
                </p>
              )}
              {status === "processing" && (
                <p className="text-slate-500 text-sm mt-4">
                  Please wait while we process your invitation...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Kasama</span>
          </div>
          <p className="text-slate-500 text-sm">
            Group Travel Planning Made Simple
          </p>
        </div>
      </div>
    </div>
  );
}
