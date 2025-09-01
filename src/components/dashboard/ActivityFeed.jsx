import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  History,
  UserPlus,
  CreditCard,
  MessageSquare,
  Calendar,
  DollarSign,
  UserCog,
  Trash2,
  Camera,
  UserX,
  Edit,
  X,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TripActivity } from "@/api/entities";

const ICONS = {
  JOINED_TRIP: <UserPlus className="w-5 h-5 text-blue-500" />,
  MADE_PAYMENT: <CreditCard className="w-5 h-5 text-green-500" />,
  PAID_FOR_FRIEND: <CreditCard className="w-5 h-5 text-green-500" />,
  SENT_CHAT_MESSAGE: <MessageSquare className="w-5 h-5 text-purple-500" />,
  UPDATED_ITINERARY: <Calendar className="w-5 h-5 text-cyan-500" />,
  ADDED_EXPENSE: <DollarSign className="w-5 h-5 text-emerald-500" />,
  REMOVED_EXPENSE: <Trash2 className="w-5 h-5 text-red-500" />,
  PROMOTED_TO_ADMIN: <UserCog className="w-5 h-5 text-yellow-600" />,
  REMOVED_PARTICIPANT: <UserX className="w-5 h-5 text-red-500" />,
  UPDATED_WELCOME_MESSAGE: <Edit className="w-5 h-5 text-indigo-500" />,
  UPDATED_TRIP_PHOTO: <Camera className="w-5 h-5 text-indigo-500" />,
  WITHDREW_FUNDS: <DollarSign className="w-5 h-5 text-red-500" />,
  PAYMENT_METHOD_UPDATE: <CreditCard className="w-5 h-5 text-blue-500" />,
  TRIP_CREATED: <Calendar className="w-5 h-5 text-blue-500" />,
  TRIP_ACTIVE: <CheckCircle className="w-5 h-5 text-green-600" />,
  BOOKING_DEADLINE: <Clock className="w-5 h-5 text-orange-500" />,
  DEFAULT: <History className="w-5 h-5 text-slate-500" />,
};

const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
      {ICONS[activity.action_type] || ICONS.DEFAULT}
    </div>
    <div className="flex-1">
      <p className="text-sm text-slate-700 leading-snug">
        {activity.description}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {formatDistanceToNow(new Date(activity.created_date), {
          addSuffix: true,
        })}
      </p>
    </div>
  </div>
);

export default function ActivityFeed({ trip }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trip?.id) {
      fetchActivities(trip.id);

      // Inject meta activities
      const metaActivities = [
        {
          id: `trip-created-${trip.id}`,
          action_type: "TRIP_CREATED",
          description: `${trip.trip_occasion} to ${
            trip.destination
          } scheduled from 
            ${new Date(trip.start_date).toLocaleDateString()} to 
            ${new Date(trip.end_date).toLocaleDateString()}.`,
          created_date: trip.start_date,
        },
        {
          id: `trip-active-${trip.id}`,
          action_type: "TRIP_ACTIVE",
          description: trip.isActive
            ? "Trip is currently active"
            : "Trip is not active",
          created_date: trip.start_date,
        },
        {
          id: `booking-deadline-${trip.id}`,
          action_type: "BOOKING_DEADLINE",
          description: `Booking deadline is ${trip.booking_deadline} days before departure.`,
          created_date: trip.start_date,
        },
      ];

      if (trip.welcome_message) {
        metaActivities.push({
          id: `welcome-msg-${trip.id}`,
          action_type: "UPDATED_WELCOME_MESSAGE",
          description: `Welcome message: "${trip.welcome_message}"`,
          created_date: trip.start_date,
        });
      }

      setActivities((prev) => [...metaActivities, ...prev]);
    }
  }, [trip]);

  const fetchActivities = async (tripId) => {
    setLoading(true);
    try {
      const newActivities = await TripActivity.filter(
        { trip_id: tripId },
        "-created_date"
      );
      setActivities((prev) => [...newActivities, ...prev]);
    } catch (error) {
      console.error("Error fetching trip activities:", error);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
          <History className="w-5 h-5 text-slate-600" />
          Activity Feed
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            No activity yet. Be the first to do something!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
