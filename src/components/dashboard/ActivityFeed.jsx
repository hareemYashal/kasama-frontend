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
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (trip?.id) {
      fetchActivities(true, 1, trip.id);

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

  const fetchActivities = async (isInitial = false, fetchPage, tripId) => {
    if (isInitial) setLoading(true);
    else setIsFetchingMore(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newActivities = await TripActivity.filter(
        { trip_id: tripId },
        "-created_date",
        PAGE_SIZE,
        (fetchPage - 1) * PAGE_SIZE
      );

      if (newActivities.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setActivities((prev) =>
        fetchPage === 1 ? [...newActivities] : [...prev, ...newActivities]
      );
    } catch (error) {
      console.error("Error fetching trip activities:", error);
    }

    if (isInitial) setLoading(false);
    else setIsFetchingMore(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(false, nextPage, trip.id);
    }
  };

  const visibleActivities = isExpanded ? activities : activities.slice(0, 3);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
          <History className="w-5 h-5 text-slate-600" />
          Activity Feed
        </CardTitle>
        {isExpanded && activities.length > 3 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="h-7 w-7 rounded-full"
          >
            <X className="w-4 h-4 text-slate-500" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : visibleActivities.length > 0 ? (
          visibleActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">
            No activity yet. Be the first to do something!
          </p>
        )}

        {!isExpanded && activities.length > 3 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 hover:underline w-full pt-2"
          >
            Load More
          </button>
        )}

        {isExpanded && hasMore && !isFetchingMore && (
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="w-full mt-2"
          >
            Load More...
          </Button>
        )}
        {isFetchingMore && (
          <div className="flex justify-center pt-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
