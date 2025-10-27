import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getTripService } from "@/services/trip";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, Users } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { useEffect } from "react";
import { toUTCDate } from "@/lib/utils";

const TripInvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const tripId = searchParams.get("trip_id");
  const code = searchParams.get("code");
  useEffect(() => {
    if (!tripId || !code) {
      toast.error("Invalid link");
      navigate("/mytrips", { replace: true });
    }
  }, [tripId, code, navigate]);
  const { data: activeTripData, isLoading: isLoadingActiveTrip } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
    enabled: !!tripId,
  });

  const invitedTripData = activeTripData?.data?.activeTrip;

  const handleJoinTrip = async () => {
    if (!tripId || !code) return;

    if (token && user) {
      try {
        const res = await axiosInstance.post(
          `/participant/joinViaInvite`,
          { tripId, inviteCode: code },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(res.data.message);
        console.log("res?.data?.data?.id", res);
        localStorage.setItem("selectedTripId", res?.data?.data?.trip?.id); // save in localStorage
        navigate("/mytrips");
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to join trip";
        toast.error(msg);
        navigate("/mytrips");
      }
    } else {
      // Not logged in → redirect to register
      localStorage.setItem("inviteData", JSON.stringify({ tripId, code }));
      navigate(`/register?trip_id=${tripId}&code=${code}`);
    }
  };

  if (isLoadingActiveTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  if (!invitedTripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative app-preview">
      <div className="flex flex-col w-full h-full" id="app-demo">
        <div className="bg-white w-full min-h-full overflow-auto">
          <div id="component-preview-container">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm max-w-2xl w-full">
                <div className="p-8">
                  <div className="flex justify-center items-center">
                    <img
                      src="/assets/kasama-logo1.png"
                      alt="Kasama Logo"
                      className="w-80"
                    />
                  </div>
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      You're Invited!
                    </h1>
                    <p className="text-lg text-slate-600">
                      Join the trip to {invitedTripData.destination}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-3">
                      {invitedTripData.trip_occasion}
                    </h2>
                    <div className="flex items-center gap-4 text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{invitedTripData.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {format(
                            toUTCDate(invitedTripData.start_date),
                            "MMM d"
                          )}{" "}
                          -{" "}
                          {format(
                            toUTCDate(invitedTripData.end_date),
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-slate-800 mb-2">
                        Welcome Message:
                      </h3>
                      <p className="text-slate-600 italic">
                        "{invitedTripData.welcome_message}"
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={handleJoinTrip}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold"
                    >
                      <Users className="w-4 h-4" />
                      Sign Up & Join Trip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripInvitePage;
