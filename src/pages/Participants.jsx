import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trip } from "@/api/entities";
import { User } from "@/api/entities";
import { Contribution } from "@/api/entities";
import { Expense } from "@/api/entities";
import { TripActivity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShieldCheck,
  Shield,
  Loader2,
  ArrowLeft,
  Crown,
  Calendar,
  Phone,
} from "lucide-react";
import ParticipantList from "../components/participants/ParticipantList";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  makeAdminService,
  totalParticipantsService,
} from "@/services/participant";
import { useSelector } from "react-redux";
import { getTripService } from "@/services/trip";

export default function Participants() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const { data: participantsData } = useQuery({
    queryKey: ["totalParticipantsService"],
    queryFn: () => totalParticipantsService(token, tripId),
    enabled: !!token && !!tripId,
  });
  let totalParticipant = participantsData?.data?.participants;
  let tripParticipantsNumber =
    participantsData?.data?.participants?.length || 0;
  useEffect(() => {
    loadParticipantData();
  }, []);
  const queryClient = useQueryClient(); // ✅ yeh zaroori hai

  const handleMakeAdmin = async (participant) => {
    try {
      await makeAdminService(token, {
        userId: participant.user?.id, // 👈 Correct key
        tripId: tripId,
      });
      queryClient.invalidateQueries(["totalParticipantsService"]);
    } catch (err) {
      console.error("Make Admin Error:", err);
    }
  };

  // const loadParticipantData = async () => {
  //   setLoading(true);
  //   try {
  //     const user = await User.me();
  //     setCurrentUser(user);

  //     if (!user.current_trip_id) {
  //       navigate(createPageUrl("Home"));
  //       return;
  //     }

  //     const currentTrip = await Trip.get(user.current_trip_id);
  //     setTrip(currentTrip);

  //     const [tripParticipants, tripContributions] = await Promise.all([
  //       User.filter({ current_trip_id: currentTrip.id }),
  //       Contribution.filter({ trip_id: currentTrip.id })
  //     ]);

  //     setParticipants(tripParticipants);
  //     setContributions(tripContributions);

  //   } catch (error) {
  //     console.error("Error loading participant data:", error);
  //     navigate(createPageUrl("Home"));
  //   }
  //   setLoading(false);
  // };

  const loadParticipantData = async () => {
    setLoading(true);
    try {
      // Simulated dummy current user
      const user = {
        id: 1,
        full_name: "Alex Morgan",
        current_trip_id: 101,
        trip_role: "admin",
      };
      setCurrentUser(user);

      const currentTrip = {
        id: 101,
        name: "Beach Getaway",
        total_goal_amount: 1000,
      };
      setTrip(currentTrip);

      const tripParticipants = [
        {
          id: 1,
          full_name: "Alex Morgan",
          trip_role: "admin",
          profile_photo_url: null,
          emergency_contact_name: "Jamie",
          emergency_contact_phone: "123-456-7890",
          emergency_contact_relationship: "Friend",
        },
        {
          id: 2,
          full_name: "Chris Evans",
          trip_role: "participant",
          profile_photo_url: null,
          emergency_contact_name: "Sam",
          emergency_contact_phone: "321-654-0987",
          emergency_contact_relationship: "Brother",
        },
        {
          id: 3,
          full_name: "Taylor Swift",
          trip_role: "admin",
          profile_photo_url: null,
          emergency_contact_name: "Andrea",
          emergency_contact_phone: "555-777-8888",
          emergency_contact_relationship: "Mother",
        },
      ];

      const tripContributions = [
        {
          id: 1,
          user_id: 1,
          amount_paid: 300,
          goal_amount: 333.33,
          amount_remaining: 33.33,
        },
        {
          id: 2,
          user_id: 2,
          amount_paid: 250,
          goal_amount: 333.33,
          amount_remaining: 83.33,
        },
        {
          id: 3,
          user_id: 3,
          amount_paid: 450,
          goal_amount: 333.33,
          amount_remaining: 0,
        },
      ];

      setParticipants(tripParticipants);
      setContributions(tripContributions);
    } catch (error) {
      console.error("Error loading participant data:", error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (participantId, newRole) => {
    try {
      await User.update(participantId, { trip_role: newRole });

      if (newRole === "admin") {
        const adminFirstName = currentUser.full_name.split(" ")[0];
        const promotedUser = participants.find((p) => p.id === participantId);
        const promotedFirstName = promotedUser.full_name.split(" ")[0];
        await TripActivity.create({
          trip_id: trip.id,
          user_id: currentUser.id,
          user_first_name: adminFirstName,
          action_type: "PROMOTED_TO_ADMIN",
          description: `${adminFirstName} promoted ${promotedFirstName} to co-admin.`,
          metadata: {
            promoted_user_id: participantId,
            promoted_user_name: promotedUser.full_name,
          },
        });
      }

      loadParticipantData(); // Refresh list
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const handleRemoveParticipant = async (participantToRemove) => {
    try {
      // Step 1: Disconnect user from the trip
      await User.update(participantToRemove.id, {
        current_trip_id: null,
        trip_role: null,
      });

      // Step 2: Reload data to get the new list of participants
      const remainingParticipants = participants.filter(
        (p) => p.id !== participantToRemove.id
      );

      // Step 3: Recalculate and update contributions for remaining participants
      const tripExpenses = await Expense.filter({ trip_id: trip.id });
      const totalAmount = tripExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const perPersonAmount =
        remainingParticipants.length > 0
          ? totalAmount / remainingParticipants.length
          : 0;

      await Trip.update(trip.id, { total_goal_amount: totalAmount });

      for (const participant of remainingParticipants) {
        const existingContribution = contributions.find(
          (c) => c.user_id === participant.id
        );
        if (existingContribution) {
          await Contribution.update(existingContribution.id, {
            goal_amount: perPersonAmount,
            amount_remaining: Math.max(
              0,
              perPersonAmount - existingContribution.amount_paid
            ),
          });
        }
      }

      // Log activity
      const adminFirstName = currentUser.full_name.split(" ")[0];
      const removedFirstName = participantToRemove.full_name.split(" ")[0];
      await TripActivity.create({
        trip_id: trip.id,
        user_id: currentUser.id,
        user_first_name: adminFirstName,
        action_type: "REMOVED_PARTICIPANT",
        description: `${adminFirstName} removed ${removedFirstName} from the trip.`,
        metadata: {
          removed_user_id: participantToRemove.id,
          removed_user_name: participantToRemove.full_name,
        },
      });

      // Final refresh
      loadParticipantData();
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  };

  const { data: tripData, isLoading: isLoadingTripData } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const tripDetails = tripData?.data?.activeTrip;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }
  
  const isAdmin =
    user?.trip_role === "creator" || user?.trip_role === "co-admin";

  const adminCount = participants.filter(
    (p) => p.trip_role === "creator"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Back to Dashboard Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                createPageUrl(isAdmin ? "Dashboard" : "ParticipantDashboard")
              )
            }
            className="bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-col mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <h1 className="tracking-tight flex items-center gap-3 text-2xl font-bold text-slate-800">
                Trip Participants
              </h1>
            </div>
            <p className="text-lg md:text-xl text-slate-600">
              {tripDetails?.trip_occasion} • {tripParticipantsNumber} People
            </p>
          </div>
          {totalParticipant && (
            <ParticipantList
              participants={totalParticipant}
              contributions={contributions}
              currentUser={currentUser}
              tripCreatorId={trip.admin_id}
              adminCount={adminCount}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveParticipant}
              isAdmin={isAdmin}
              onMakeAdmin={handleMakeAdmin}
              tripId={tripId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
