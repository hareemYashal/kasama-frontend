import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

export default function TripInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);

  const tripId = searchParams.get("trip_id");
  const code = searchParams.get("code");

  useEffect(() => {
    if (!tripId || !code) return;

    if (token && user) {
      axiosInstance
        .post(
          `/participant/joinViaInvite`,
          { tripId, inviteCode: code },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          toast.success(res.data.message); // ✅ show any message
          navigate("/mytrips"); // ✅ always redirect
        })
        .catch((err) => {
          const msg = err.response?.data?.message || "Failed to join trip";
          toast.error(msg); // ✅ show error message
          navigate("/mytrips"); // ✅ still redirect
        });
    } else {
      localStorage.setItem("inviteData", JSON.stringify({ tripId, code }));
      navigate(`/register?trip_id=${tripId}&code=${code}`);
    }
  }, [tripId, code, token, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
