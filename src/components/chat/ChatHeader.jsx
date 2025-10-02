import {
  ArrowLeft,
  MessageCircle,
  WifiOff,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import {useState, useRef, useEffect} from "react";

import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {totalParticipantsService} from "@/services/participant";
import {useNavigate} from "react-router-dom";
import BackButton from "../ui/BackButton";
const ChatHeader = () => {
  const tripId = useSelector((s) => s.trips.activeTripId);
  const token = useSelector((s) => s.user.token);
  const authUser = useSelector((s) => s.user.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const authUerId = authUser?.id;
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {data: activeTripData} = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const activeTrip = activeTripData?.data?.activeTrip;

  const {data: participantsData} = useQuery({
    queryKey: ["totalParticipantsService"],
    queryFn: () => totalParticipantsService(token, tripId),
    enabled: !!token && !!tripId,
  });
  const totalParticipant = participantsData?.data?.participants;
  const tripParticipantsNumber =
    participantsData?.data?.participants?.length || 0;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  console.log("totalParticipant", totalParticipant);
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-3 md:p-6 flex items-center justify-between gap-2 md:gap-4 flex-shrink-0 z-10">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        {/* <button
          className="inline-flex items-center justify-center gap-2 border h-9 rounded-md bg-white/80 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm flex-shrink-0"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button> */}
        <BackButton />

        <MessageCircle className="w-4 h-4 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <h1 className="text-sm md:text-xl font-bold text-slate-800 truncate">
            Group Chat
          </h1>
          <p className="text-xs md:text-sm text-slate-500 truncate">
            {activeTrip?.trip_occasion}
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1 md:gap-2 text-xs md:text-sm flex-shrink-0 relative"
        ref={dropdownRef}
      >
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors "
        >
          <Users className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">
            {tripParticipantsNumber} members
          </span>
          {isDropdownOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {/* <div className="flex items-center gap-1 text-blue-600">
          <WifiOff className="w-3 h-3 md:w-4 md:h-4" />
        </div> */}

        {/* Dropdown Participants List */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  Group Members
                </h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {tripParticipantsNumber} participants in this trip
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <div className="p-4 space-y-3">
                {totalParticipant?.map((participant) => (
                  <div
                    key={participant.user?.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {participant?.user?.Profile?.profile_photo_url ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={`${participant?.user?.Profile.profile_photo_url}`}
                          alt={participant.user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-600 font-semibold text-sm leading-none bg-gray-300 p-3 rounded-full flex items-center justify-center w-10 h-10">
                        {/* {"U"} */}
                        <User className="w-4 h-4" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {participant.user?.name}
                        </span>
                        {participant.user?.id === authUerId && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {participant.trip_role || "Member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
