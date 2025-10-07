import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Bell} from "lucide-react";
import React, {useEffect} from "react";
import {ActivityIcon, History, Trash2} from "lucide-react";
import {useSelector, useDispatch} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import BackButton from "@/components/ui/BackButton";
import {
  getNotificationsService,
  deleteNotificationService,
  markAsReadService,
} from "@/services/notification";
import {io} from "socket.io-client";
import {
  setNotifications,
  markAsRead,
  deleteNotification,
} from "@/store/notificationSlice";
const MobileNotifications = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const dispatch = useDispatch();
  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const notifications = useSelector((state) => state.notifications.list);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  // Fetch notifications from API
  const {data} = useQuery({
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

    const socket = io(BASE_URL, {auth: {token}});
    socket.emit("joinTrip", tripId);

    socket.on("newNotification", (notif) =>
      dispatch(setNotifications([notif, ...notifications]))
    );
    socket.on("notificationDeleted", ({id}) =>
      dispatch(deleteNotification(id))
    );

    return () => socket.disconnect();
  }, [tripId, token, dispatch, notifications]);

  const handleMarkRead = async (notifId) => {
    try {
      await markAsReadService(notifId, token);
      dispatch(markAsRead(notifId));
    } catch (error) {
      console.error("Error marking notification as read", error);
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
    <div className="flex items-center gap-3 md:hidden block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <div className="relative">
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
                className="lucide lucide-bell w-4 h-4"
                data-source-location="layout:299:30"
                data-dynamic-content="false"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-[2px] right-[1.5px] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Bell className="w-3 h-3" />
            </span>
            <span className="text-sm font-medium text-slate-800">
              Recent Activity
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map((n, idx) => (
                <div
                  key={n.id || idx}
                  onClick={() => handleMarkRead(n.id)}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                    !n.isRead
                      ? "bg-slate-100 border-slate-200"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ActivityIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          !n.isRead ? "text-slate-600" : "text-slate-800"
                        }`}
                      >
                        {" "}
                        {n.message || n.title || n.text || "Notification"}
                      </p>
                      {(n.createdAt || n.created_at) && (
                        <p className="text-xs text-slate-500 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-slate-500">
                No recent activity
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileNotifications;
