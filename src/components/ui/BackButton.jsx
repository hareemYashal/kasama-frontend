// components/ui/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { createPageUrl } from "@/utils";

const BackButton = ({ closeModal }) => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.user.user);
  const activeTripId = useSelector((state) => state.trips.activeTripId);

  const tripId = activeTripId || JSON.parse(localStorage.getItem("activeTripId"));

  const handleClick = () => {
    if (closeModal) closeModal();

    if (tripId) {
      // Redirect to dashboard based on role
      const isAdmin =
        authUser?.trip_role === "creator" || authUser?.trip_role === "co-admin";
      const page = isAdmin ? "Dashboard" : "ParticipantDashboard";
      navigate(createPageUrl(page));
    } else {
      // Redirect to My Trips if no tripId
      navigate("/DashboardHome");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={handleClick}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {tripId ? "Back to Dashboard" : "Back to My Trips"}
      </Button>
    </div>
  );
};

export default BackButton;
