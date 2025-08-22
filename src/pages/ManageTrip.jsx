import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trip } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { TripActivity } from "@/api/entities";
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
import {
  ArrowLeft,
  Settings,
  Save,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { addWeeks, format } from "date-fns";

export default function ManageTrip() {
  // const navigate = useNavigate();
  // const [user, setUser] = useState(null);
  // const [trip, setTrip] = useState(null);
  // const [formData, setFormData] = useState({
  //   occasion: '',
  //   destination: '',
  //   start_date: '',
  //   end_date: '',
  //   booking_deadline_weeks: '',
  //   welcome_message: '',
  //   trip_image_url: ''
  // });
  // const [tripImageFile, setTripImageFile] = useState(null);
  // const [previewUrl, setPreviewUrl] = useState('');
  // const [loading, setLoading] = useState(true);
  // const [saving, setSaving] = useState(false);
  // const [uploadingImage, setUploadingImage] = useState(false);

  // useEffect(() => {
  //   loadTripData();
  // }, []);

  // const loadTripData = async () => {
  //   try {
  //     const currentUser = await User.me();
  //     setUser(currentUser);

  //     if (!currentUser.current_trip_id || currentUser.trip_role !== 'admin') {
  //       navigate(createPageUrl("Dashboard"));
  //       return;
  //     }

  //     const currentTrip = await Trip.get(currentUser.current_trip_id);
  //     setTrip(currentTrip);

  //     // Calculate weeks between start date and booking deadline
  //     const startDate = new Date(currentTrip.start_date);
  //     const deadlineDate = new Date(currentTrip.booking_deadline);
  //     const weeksDiff = Math.round((startDate - deadlineDate) / (7 * 24 * 60 * 60 * 1000));

  //     setFormData({
  //       occasion: currentTrip.occasion || '',
  //       destination: currentTrip.destination || '',
  //       start_date: currentTrip.start_date || '',
  //       end_date: currentTrip.end_date || '',
  //       booking_deadline_weeks: weeksDiff.toString() || '2',
  //       welcome_message: currentTrip.welcome_message || '',
  //       trip_image_url: currentTrip.trip_image_url || ''
  //     });
  //     setPreviewUrl(currentTrip.trip_image_url || '');

  //   } catch (error) {
  //     console.error("Error loading trip data:", error);
  //     navigate(createPageUrl("Home"));
  //   }
  //   setLoading(false);
  // };

  // const updateFormData = (field, value) => {
  //   setFormData(prev => ({ ...prev, [field]: value }));
  // };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     // Validate file type
  //     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  //     if (!allowedTypes.includes(file.type)) {
  //       alert('Please select a valid image file (JPG, PNG, or WebP)');
  //       return;
  //     }

  //     // Validate file size (max 5MB)
  //     if (file.size > 5 * 1024 * 1024) {
  //       alert('Image file size must be less than 5MB');
  //       return;
  //     }

  //     setTripImageFile(file);
  //     setPreviewUrl(URL.createObjectURL(file));
  //   }
  // };

  // const handleSave = async () => {
  //   setSaving(true);
  //   try {
  //     let imageUrl = formData.trip_image_url;
  //     const adminFirstName = user.full_name.split(' ')[0];

  //     // Check for welcome message change before upload/update
  //     if (formData.welcome_message !== trip.welcome_message) {
  //       await TripActivity.create({
  //           trip_id: trip.id,
  //           user_id: user.id,
  //           user_first_name: adminFirstName,
  //           action_type: 'UPDATED_WELCOME_MESSAGE',
  //           description: `${adminFirstName} updated the trip welcome message.`,
  //           metadata: {}
  //       });
  //     }

  //     // Upload new image if selected
  //     if (tripImageFile) {
  //       setUploadingImage(true);
  //       try {
  //         const uploadResult = await UploadFile({ file: tripImageFile });
  //         if (uploadResult && uploadResult.file_url) {
  //           imageUrl = uploadResult.file_url;
  //           // Log photo change
  //           await TripActivity.create({
  //               trip_id: trip.id,
  //               user_id: user.id,
  //               user_first_name: adminFirstName,
  //               action_type: 'UPDATED_TRIP_PHOTO',
  //               description: `${adminFirstName} updated the trip photo.`,
  //               metadata: {}
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Error uploading image:", error);
  //         alert('Failed to upload image. Please try again.');
  //         setSaving(false);
  //         setUploadingImage(false);
  //         return;
  //       }
  //       setUploadingImage(false);
  //     }

  //     // Calculate booking deadline based on start date
  //     let deadlineDate = '';
  //     if (formData.start_date && formData.booking_deadline_weeks) {
  //       const startDate = new Date(formData.start_date);
  //       const weeksBeforeInt = parseInt(formData.booking_deadline_weeks);
  //       deadlineDate = format(addWeeks(startDate, -weeksBeforeInt), 'yyyy-MM-dd');
  //     }

  //     await Trip.update(trip.id, {
  //       occasion: formData.occasion,
  //       destination: formData.destination,
  //       start_date: formData.start_date,
  //       end_date: formData.end_date,
  //       booking_deadline: deadlineDate,
  //       welcome_message: formData.welcome_message,
  //       trip_image_url: imageUrl
  //     });

  //     // Auto-redirect to dashboard after successful save
  //     navigate(createPageUrl("Dashboard"));

  //   } catch (error) {
  //     console.error("Error saving trip:", error);
  //   }
  //   setSaving(false);
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [formData, setFormData] = useState({
    occasion: "",
    destination: "",
    start_date: "",
    end_date: "",
    booking_deadline_weeks: "",
    welcome_message: "",
    trip_image_url: "",
  });
  const [tripImageFile, setTripImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const dummyUser = {
    id: 1,
    full_name: "John Doe",
    current_trip_id: 123,
    trip_role: "admin",
  };

  const dummyTrip = {
    id: 123,
    occasion: "Birthday Getaway",
    destination: "Bali",
    start_date: "2025-09-01",
    end_date: "2025-09-10",
    booking_deadline: "2025-08-15",
    welcome_message: "Get ready for a tropical adventure!",
    trip_image_url: "",
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setUser(dummyUser);

      if (!dummyUser.current_trip_id || dummyUser.trip_role !== "admin") {
        navigate("/dashboard");
        return;
      }

      setTrip(dummyTrip);

      const startDate = new Date(dummyTrip.start_date);
      const deadlineDate = new Date(dummyTrip.booking_deadline);
      const weeksDiff = Math.round(
        (startDate - deadlineDate) / (7 * 24 * 60 * 60 * 1000)
      );

      setFormData({
        occasion: dummyTrip.occasion,
        destination: dummyTrip.destination,
        start_date: dummyTrip.start_date,
        end_date: dummyTrip.end_date,
        booking_deadline_weeks: weeksDiff.toString(),
        welcome_message: dummyTrip.welcome_message,
        trip_image_url: dummyTrip.trip_image_url,
      });

      setPreviewUrl(dummyTrip.trip_image_url);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPG, PNG, or WebP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size must be less than 5MB");
        return;
      }
      setTripImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    let imageUrl = formData.trip_image_url;

    if (tripImageFile) {
      setUploadingImage(true);
      // Simulate image upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      imageUrl = "https://example.com/fake-uploaded-image.jpg";
      setUploadingImage(false);
    }

    let deadlineDate = "";
    if (formData.start_date && formData.booking_deadline_weeks) {
      const startDate = new Date(formData.start_date);
      const weeksBeforeInt = parseInt(formData.booking_deadline_weeks);
      deadlineDate = format(addWeeks(startDate, -weeksBeforeInt), "yyyy-MM-dd");
    }

    console.log("Saving trip with data:", {
      ...formData,
      trip_image_url: imageUrl,
      booking_deadline: deadlineDate,
    });

    setTimeout(() => {
      setSaving(false);
      navigate("/dashboard");
    }, 1000);
  };

  if (loading) {
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

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="occasion"
                  className="text-base font-semibold text-slate-700"
                >
                  Trip Occasion
                </Label>
                <Input
                  id="occasion"
                  placeholder="e.g., Bachelor Party, Family Reunion"
                  value={formData.occasion}
                  onChange={(e) => updateFormData("occasion", e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="destination"
                  className="text-base font-semibold text-slate-700"
                >
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Miami, FL or Tokyo, Japan"
                  value={formData.destination}
                  onChange={(e) =>
                    updateFormData("destination", e.target.value)
                  }
                  className="mt-2 border-slate-200"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="start_date"
                  className="text-base font-semibold text-slate-700"
                >
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                  className="mt-2 border-slate-200"
                />
              </div>

              <div>
                <Label
                  htmlFor="end_date"
                  className="text-base font-semibold text-slate-700"
                >
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData("end_date", e.target.value)}
                  min={formData.start_date}
                  className="mt-2 border-slate-200"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold text-slate-700">
                Booking Deadline
              </Label>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                How many weeks before the trip starts should everyone book by?
              </p>
              <Select
                value={formData.booking_deadline_weeks}
                onValueChange={(value) =>
                  updateFormData("booking_deadline_weeks", value)
                }
              >
                <SelectTrigger className="border-slate-200">
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
              <Label
                htmlFor="welcome_message"
                className="text-base font-semibold text-slate-700"
              >
                Welcome Message
              </Label>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                This message will be shown to participants when they join
              </p>
              <Textarea
                id="welcome_message"
                placeholder="Welcome to our amazing trip! I'm excited to plan this adventure together..."
                value={formData.welcome_message}
                onChange={(e) =>
                  updateFormData("welcome_message", e.target.value)
                }
                className="mt-2 border-slate-200 min-h-32"
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={handleSave}
                disabled={saving || uploadingImage}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                {saving || uploadingImage ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {uploadingImage
                  ? "Uploading Image..."
                  : saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
