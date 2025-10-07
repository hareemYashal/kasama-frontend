import React, {useState, useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {createPageUrl} from "@/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Calendar,
  Users,
  Settings,
  History,
  AlertTriangle,
  MessageCircle,
  HelpCircle,
  MessageSquare,
  UserCog,
  CreditCard,
  Bell,
  Send,
  Archive,
  Info,
  Shield, // Added Shield icon
  Briefcase,
  Lightbulb, // Added Briefcase icon
} from "lucide-react";

import {useDispatch} from "react-redux";
import {setUserRed} from "./../store/userSlice";
import {useSelector} from "react-redux";
import {setActiveTripId} from "@/store/tripSlice";
import {getTripService} from "@/services/trip";
import {useQuery} from "@tanstack/react-query";
import {Badge} from "@/components/ui/badge";
import {getProfileService} from "@/services/profile";
import BackButton from "@/components/ui/BackButton";
import {getNotificationsService} from "@/services/notification";
import {addNotification} from "@/store/notificationSlice";
import {io} from "socket.io-client";
import {
  setNotifications,
  markAsRead,
  deleteNotification,
} from "@/store/notificationSlice";
import MobileNotifications from "@/components/dashboard/MobileNotifications";
const BASE_URL = import.meta.env.VITE_API_URL;

export default function Layout({children, currentPageName}) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  console.log("hey I am the user from  layout", user);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const tripId = useSelector((state) => state.trips.activeTripId);
  // Optional: local fetch for recent notifications (fallback if store does not hold list)

  const location = useLocation();
  const navigate = useNavigate();

  const token = useSelector((state) => state.user.token);

  const {data: tripData, isLoading: isLoadingTripData} = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const tdata = tripData?.data?.activeTrip;
  console.log("tripDatagetTripService", tripData);
  console.log("tripId-=-=-=->", tripId);
  useEffect(() => {
    // Skip authentication check for public pages
    const publicPages = ["Home", "JoinTrip", "ExpediaTeaser"];
    if (publicPages.includes(currentPageName)) {
      setLoading(false);
      return;
    }

    loadDummyUserAndTrip();
  }, [currentPageName]);

  const {data: profileData, isLoading} = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfileService(token),
    enabled: !!token, // only fetch if token exists
  });
  const [userProfileData, setUerProfileData] = useState({
    username: "",
    profile_photo_url: "",
  });
  // Update form when data arrives
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      setUerProfileData({
        username: profile.username || "",
        profile_photo_url: profile.profile_photo_url || "",
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (!tripId || !token) return;

    const socket = io(BASE_URL, {auth: {token}});
    socket.emit("joinTrip", tripId);

    socket.on("newNotification", (notif) => {
      dispatch(addNotification(notif)); // updates unreadCount globally
    });

    return () => socket.disconnect();
  }, [tripId, token, dispatch]);

  const loadDummyUserAndTrip = () => {
    const dummyUser = {
      id: 1,
      name: "Admin User",
      trip_role: "admin", // or "participant" if needed
      current_trip_id: 123,
    };

    const dummyTrip = {
      id: 123,
      name: "Sample Trip",
      destination: "Paris",
    };

    // setUser(dummyUser);
    setTrip(dummyTrip);

    // Redirect based on role and page
    if (currentPageName === "Home") {
      if (dummyUser.trip_role === "admin") {
        navigate(createPageUrl("Dashboard"));
      } else {
        navigate(createPageUrl("ParticipantDashboard"));
      }
    }

    if (
      !dummyUser.current_trip_id &&
      (currentPageName === "Dashboard" ||
        currentPageName === "ParticipantDashboard")
    ) {
      navigate(createPageUrl("MyTrips"));
    }

    setLoading(false);
  };

  console.log("userProfileData", userProfileData);
  const hasAdminAccess =
    user?.trip_role === "creator" || user?.trip_role === "co-admin";

  // Navigation items based on role

  const adminNavItems = [
    {title: "Dashboard", url: createPageUrl("Dashboard"), icon: MapPin},
    {
      title: "Trip Settings",
      url: createPageUrl("ManageTrip"),
      icon: Settings,
    },
    {title: "Participants", url: createPageUrl("Participants"), icon: Users},
    // {
    //   title: "Participants Invitation",
    //   url: createPageUrl("ParticipantsManagment"),
    //   icon: Users,
    // },
    {title: "Expenses", url: createPageUrl("Expenses"), icon: CreditCard},
    {title: "Itinerary", url: createPageUrl("Itinerary"), icon: Calendar},
    {title: "Make a Payment", url: createPageUrl("Payments"), icon: Send},
    {title: "Notifications", url: createPageUrl("Notifications"), icon: Bell},
  ];

  const participantNavItems = [
    {
      title: "Dashboard",
      url: createPageUrl("ParticipantDashboard"),
      icon: MapPin,
    },
    {title: "Participants", url: createPageUrl("Participants"), icon: Users},
    // { title: "Itinerary", url: createPageUrl("Itinerary"), icon: Calendar },
    {title: "Make a Payment", url: createPageUrl("Payments"), icon: Send},
    {title: "Notifications", url: createPageUrl("Notifications"), icon: Bell},
  ];
  const {data: notificationsData} = useQuery({
    queryKey: ["notifications", tripId, token],
    queryFn: () => getNotificationsService(tripId, token),
    enabled: !!token && !!tripId,
  });
  useEffect(() => {
    if (notificationsData?.notifications) {
      dispatch(setNotifications(notificationsData.notifications));
    }
  }, [notificationsData, dispatch]);
  const notifications =
    notificationsData?.notifications || notificationsData?.data || [];
  const commonNavItems = [
    {
      title: "Tips for Using Kasama",
      url: createPageUrl("Tips"),
      icon: Lightbulb,
    },
    {title: "Help", url: createPageUrl("Help"), icon: HelpCircle},
    {title: "Feedback", url: createPageUrl("Feedback"), icon: MessageSquare},
  ];
  let navigationItems = [];

  if (hasAdminAccess) {
    navigationItems = adminNavItems;
  } else if (user?.trip_role === "participant") {
    navigationItems = participantNavItems;
  } else {
    navigationItems = [];
  }
  console.log("navigationItems", navigationItems);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't show sidebar for certain pages
  const hideSidebarPages = ["Home", "JoinTrip", "ExpediaTeaser"];
  if (hideSidebarPages.includes(currentPageName)) {
    return <div className="min-h-screen">{children}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("activeTripId");
    dispatch(setUserRed(null));
    dispatch(setActiveTripId(null));
    navigate("/");
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <style>
          {`
            :root {
              --primary-ocean: #0B1426;
              --accent-coral: #FF6B6B;
              --success-sage: #E8F5E8;
              --warm-cream: #FDFBF7;
              --charcoal: #2D3748;
            }
          `}
        </style>

        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="">
              <div className="flex flex-col justify-center gap-2 -mt-2 items-start">
                <img
                  src="/assets/kasama-logo1.jpg"
                  alt="Kasama Logo"
                  className="w-50 h-16 rounded-full"
                />
                {/* <div> */}
                {/* <h2 className="font-bold text-xl text-slate-800">Kasama</h2> */}
                {/* <p className="text-sm text-slate-500">Group Travel Planning</p> */}
                {/* </div> */}
              </div>
            </div>
            {tdata && tripId && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700">
                  {tdata.trip_occasion}
                </p>
                <p className="text-xs text-slate-500">{tdata.destination}</p>
                <div className="flex items-center gap-1 mt-3">
                  <Badge
                    className={`inline-flex items-center rounded-full border px-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-primary/80 font-medium text-xs py-0.5 ${
                      user?.trip_role === "creator"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : user?.trip_role === "co-admin"
                        ? "bg-orange-100 text-orange-800 border-orange-200"
                        : "bg-blue-200 hover:bg-blue-50 text-blue-700 transition-all"
                    }`}
                  >
                    <span className="mr-1.5">
                      {user?.trip_role === "creator" ? (
                        // Crown SVG for Admin
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
                          className="lucide lucide-crown w-3 h-3"
                        >
                          <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                          <path d="M5 21h14"></path>
                        </svg>
                      ) : user?.trip_role === "co-admin" ? (
                        // Smaller crown or different icon for Co-Admin
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
                          className="lucide lucide-crown w-3 h-3"
                        >
                          <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7-5.5-4h7z"></path>
                        </svg>
                      ) : (
                        // User SVG for Participant
                        <Shield className="w-3 h-3" />
                      )}
                    </span>
                    {user?.trip_role === "creator"
                      ? "Admin"
                      : user?.trip_role === "co-admin"
                      ? "Co-Admin"
                      : "Participant"}
                  </Badge>
                </div>
              </div>
            )}
          </SidebarHeader>

          <SidebarContent className="p-3">
            {/* My Trips - Top of Sidebar - Admin Only */}
            {/* {hasAdminAccess && ( */}
            <SidebarGroup className="mb-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-1 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200"
                    >
                      <Link
                        to={createPageUrl("MyTrips")}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Archive className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-purple-700">
                          My Trips
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* // )} */}
            {tripId && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Trip Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                            location.pathname === item.url
                              ? "bg-blue-50 text-blue-700 shadow-sm"
                              : ""
                          } ${item.title === "Notifications" ? "hidden md:flex" : ""}`}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3 px-4 py-3"
                          >
                            <div className="relative">
                              <item.icon className="w-4 h-4" />
                              {item.title === "Notifications" &&
                                unreadCount > 0 && (
                                  <span className="absolute -top-[2px] right-[1.5px] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Support
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Expedia Partnership at the TOP of Support section */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                    >
                      <Link
                        to={createPageUrl("ExpediaTeaser")}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-blue-700">
                          Expedia Partnership
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    <p className="text-xs text-center text-blue-500 font-medium -mt-1 pb-1">
                      (Coming Soon)
                    </p>
                  </SidebarMenuItem>

                  {/* Rest of Support items */}
                  {commonNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : ""
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                  {/* Policies Link */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                        location.pathname === createPageUrl("Policies")
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : ""
                      }`}
                    >
                      <Link
                        to={createPageUrl("Policies")}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Policies</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* About Kasama Modal Trigger */}
                  <SidebarMenuItem>
                    <Dialog>
                      <DialogTrigger asChild>
                        <SidebarMenuButton className="hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 rounded-xl mb-1 flex items-center gap-3 px-4 py-3 w-full text-left">
                          <Info className="w-4 h-4" />
                          <span className="font-medium">About Kasama</span>
                        </SidebarMenuButton>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-slate-800">
                            Why We Created Kasama
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4 text-slate-700">
                          <p>
                            <em>Kasama</em> is a Filipino word that means{" "}
                            <strong>
                              "companion," "ally," or "someone who is with you."
                            </strong>
                          </p>
                          <p>
                            In Filipino, the phrase <strong>"magkasama"</strong>{" "}
                            means <strong>"together"</strong> — side by side,
                            united, with no one left behind.
                          </p>
                          <p>That meaning is at the heart of this platform.</p>
                          <p>
                            <strong>Kasama</strong> was created to make group
                            travel easier, more transparent, and more meaningful
                            — especially for those who value shared experiences.
                            It helps friends, families, and communities{" "}
                            <strong>
                              plan trips, track contributions, manage expenses,
                              and coordinate itineraries — all in one place.
                            </strong>
                          </p>
                          <p>
                            Inspired by the spirit of{" "}
                            <strong>Filipino culture</strong> — where
                            hospitality, loyalty, and togetherness are a way of
                            life — Kasama is more than an app. It's a reminder
                            that the journey is better when we go through it{" "}
                            <strong>magkasama</strong>.
                          </p>
                        </div>
                        <DialogFooter className="flex-col items-center justify-center text-center border-t pt-4 space-y-1 sm:justify-center">
                          <p className="text-[11px] text-slate-400 font-light italic">
                            Dedicated to Lotus aka "Dodi Girl" — 10/11/2009 –
                            01/17/2025
                          </p>
                          <p className="text-[11px] text-slate-400 font-light italic">
                            "Jesus said to him, 'I am the way, the truth, and
                            the life.' – John 14:6"
                          </p>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {hasAdminAccess && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-red-500 uppercase tracking-wider px-3 py-2">
                  Danger Zone
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-xl text-red-600"
                      >
                        <Link
                          to={createPageUrl("CancelTrip")}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Cancel Trip</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <Link
              to={createPageUrl("Profile")}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              {/* Avatar */}
              <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center overflow-hidden">
                {userProfileData?.profile_photo_url ? (
                  <img
                    src={userProfileData.profile_photo_url}
                    alt={userProfileData.username || user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-600 font-semibold text-sm leading-none">
                    {userProfileData?.username?.charAt(0) ||
                      user?.name?.charAt(0) ||
                      "U"}
                  </span>
                )}
              </div>

              {/* Name & label */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">
                  {userProfileData.username
                    ? userProfileData.username
                    : user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">My Profile</p>
              </div>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          {location.pathname !== "/chat" && (
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-xl transition-all duration-200 md:hidden" />
                <h1 className="text-xl font-bold text-slate-800">Kasama</h1>
              </div>

              <MobileNotifications
                notifications={notifications}
                unreadCount={unreadCount}
              />
              {location.pathname === createPageUrl("Profile") && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Logout
                </button>
              )}
            </header>
          )}

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}