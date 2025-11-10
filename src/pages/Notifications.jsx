"use client";
import { useEffect } from "react";
import {
  ActivityIcon,
  History,
  Trash2,
  CreditCard,
  Megaphone,
  DollarSign,
  User,
  NotepadText,
  BarChart3,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BackButton from "@/components/ui/BackButton";
import {
  getNotificationsService,
  deleteNotificationService,
  markAsReadService,
} from "@/services/notification";
import { io } from "socket.io-client";
import {
  setNotifications,
  markAsRead,
  deleteNotification,
} from "@/store/notificationSlice";

const BASE_URL = import.meta.env.VITE_API_URL;

const Notifications = () => {
  const dispatch = useDispatch();
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const queryClient = useQueryClient();
  const notifications = useSelector((state) => state.notifications.list);
  const { data: activeTripData } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });
  const activeTrip = activeTripData?.data?.activeTrip;

  const hasAdminAccess =
    user?.trip_role === "creator" || user?.trip_role === "co-admin";

  // Fetch notifications from API
  const { data } = useQuery({
    queryKey: ["notifications", tripId, token],
    queryFn: () => getNotificationsService(tripId, token),
    enabled: !!tripId && !!token,
  });

  useEffect(() => {
    if (data?.notifications) {
      dispatch(setNotifications(data.notifications));
    }
  }, [data, dispatch]);

  // Socket for real-time notifications
  useEffect(() => {
    if (!tripId || !token) return;

    const socket = io(BASE_URL, { auth: { token } });
    socket.emit("joinTrip", tripId);

    socket.on(
      "newNotification",
      async (notif) =>
        await queryClient.invalidateQueries({
          queryKey: ["notifications"],
        })
      // dispatch(setNotifications([notif, ...notifications]))
    );
    socket.on("notificationDeleted", ({ id }) =>
      dispatch(deleteNotification(id))
    );

    return () => socket.disconnect();
  }, [tripId, token, dispatch, notifications]);

  useEffect(() => {
    const markAllAsRead = async () => {
      if (notifications.length > 0) {
        const unread = notifications.filter((n) => !n.isRead);
        if (unread.length > 0) {
          try {
            await Promise.all(
              unread.map((notif) => markAsReadService(notif.id, token))
            );
            unread.forEach((notif) => dispatch(markAsRead(notif.id)));
          } catch (error) {
            console.error("Error marking all notifications as read:", error);
          }
        }
      }
    };

    markAllAsRead();
  }, [notifications, token, dispatch]);

  const handleDelete = async (notifId) => {
    try {
      await deleteNotificationService(notifId, token);
      dispatch(deleteNotification(notifId));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };
  const getNotificationIcon = (type) => {
    switch (type) {
      case "chat":
        return <Megaphone className="w-4 h-4 text-blue-600" />;
      case "itinerary":
        return <NotepadText className="w-4 h-4 text-green-600" />;
      case "trip":
        return <User className="w-4 h-4 text-purple-600" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case "expense":
        return <CreditCard className="w-4 h-4 text-orange-600" />;
      case "poll":
        return <BarChart3 className="w-4 h-4 text-pink-600" />; // new color + icon
      default:
        return <ActivityIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 30) return "just now";
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton />
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <History className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">
                Trip Activity Log
              </h1>
              <p className="text-xl text-slate-600">
                All the latest updates for {activeTrip?.trip_occasion}{" "}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications list */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-center text-slate-500 py-4">
              No notifications found
            </p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                // onClick={() => handleMarkRead(item.id)}
                className={`flex items-start gap-3 p-4 bg-white border-slate-100 hover:border-slate-200 rounded-lg border transition-colors`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
    ${
      item.type === "chat"
        ? "bg-blue-100"
        : item.type === "itinerary"
        ? "bg-green-100"
        : item.type === "trip"
        ? "bg-purple-100"
        : item.type === "payment"
        ? "bg-yellow-100"
        : item.type === "expense"
        ? "bg-orange-100"
        : item.type === "poll"
        ? "bg-pink-100"
        : "bg-slate-100"
    }`}
                >
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      !item.isRead ? "text-slate-600" : "text-slate-800"
                    }`}
                  >
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
                {/* {hasAdminAccess && ( */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {/* )} */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
