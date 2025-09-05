import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Save, Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { updateTripService, getTripByIdService } from "@/services/trip";
import { toast } from "sonner";

export default function ManageTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    occasion: "",
    destination: "",
    start_date: "",
    end_date: "",
    booking_deadline_weeks: "",
    welcome_message: "",
  });
  const [tripImageFile, setTripImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);

  // 🔹 Fetch trip details
  const { data: tripData, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripByIdService(tripId, token),
    enabled: !!tripId && !!token,
  });

  useEffect(() => {
    if (tripData) {
      console.log("tripData", tripData);

      setFormData({
        occasion: tripData?.trip_occasion || "",
        destination: tripData?.destination || "",
        start_date: tripData?.start_date
          ? tripData?.start_date.split("T")[0]
          : "",
        end_date: tripData?.end_date ? tripData?.end_date.split("T")[0] : "",
        booking_deadline_weeks: tripData?.booking_deadline?.toString() || "",
        welcome_message: tripData?.welcome_message || "",
      });

      if (tripData?.image) {
        setPreviewUrl(tripData?.image);
      }
    }
  }, [tripData]);

  console.log("tripData", tripData);
  console.log("formData", formData);
  // 🔹 Update trip mutation
  const { mutate, isLoading: isMutating } = useMutation({
    mutationFn: ({ formDataToSend, tripId, token }) =>
      updateTripService(formDataToSend, tripId, token),
    onSuccess: (data) => {
      console.log("Trip Updated Successfully", data);
      setSaving(false);
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Error updating trip:", error);
      setSaving(false);
      toast.success("Failed to update trip. Please try again.");
    },
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPG, PNG, or WebP)");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB");

        e.target.value = "";
        return;
      }

      setTripImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const formDataToSend = new FormData();

    formDataToSend.append("trip_occasion", formData.occasion);
    formDataToSend.append("destination", formData.destination);
    formDataToSend.append("start_date", formData.start_date);
    formDataToSend.append("end_date", formData.end_date);
    formDataToSend.append("booking_deadline", formData.booking_deadline_weeks);
    formDataToSend.append("welcome_message", formData.welcome_message);

    if (tripImageFile) {
      formDataToSend.append("image", tripImageFile);
    }

    mutate({ formDataToSend, tripId, token });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Manage Trip</h1>
              <p className="text-slate-600">
                Update your trip details and image
              </p>
            </div>
          </div>

          {/* Trip Details Form */}
          <div className="space-y-6">
            {/* Trip Image Upload */}
            <Card className="border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Trip Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Trip preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="trip_image">Upload Trip Image</Label>
                    <Input
                      id="trip_image"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="mt-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Supported formats: JPG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="occasion">Trip Occasion</Label>
                <Input
                  id="occasion"
                  value={formData.occasion}
                  onChange={(e) => updateFormData("occasion", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) =>
                    updateFormData("destination", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData("end_date", e.target.value)}
                  min={formData.start_date}
                />
              </div>
            </div>

            <div>
              <Label>Booking Deadline</Label>
              <Select
                value={formData.booking_deadline_weeks}
                onValueChange={(value) =>
                  updateFormData("booking_deadline_weeks", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select booking deadline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 week before</SelectItem>
                  <SelectItem value="2">2 weeks before</SelectItem>
                  <SelectItem value="3">3 weeks before</SelectItem>
                  <SelectItem value="4">4 weeks before</SelectItem>
                  <SelectItem value="6">6 weeks before</SelectItem>
                  <SelectItem value="8">8 weeks before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Textarea
                id="welcome_message"
                value={formData.welcome_message}
                onChange={(e) =>
                  updateFormData("welcome_message", e.target.value)
                }
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={handleSubmit}
                disabled={saving || isMutating}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                {saving || isMutating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
