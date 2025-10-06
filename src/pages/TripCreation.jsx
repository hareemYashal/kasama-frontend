import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {uploadToS3} from "@/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import {addWeeks, format} from "date-fns";
import {useMutation} from "@tanstack/react-query";
import {createTripService} from "@/services/trip";
import {useSelector} from "react-redux";
import {toast} from "sonner";

export default function TripCreation() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const token = useSelector((state) => state.user.token);
  console.log(token, "Hey I am the Token of Redux");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    trip_occasion: "",
    destination: "",
    start_date: "",
    end_date: "",
    booking_deadline: "",
    welcome_message: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(""); // preview image
  const [imgkey, setImgkey] = useState("");
  const [imgLoading, setImageLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };
  const handleImageChange = async (e) => {
    setImageLoading(true);
    const file = e.target.files[0];
    console.log(file, "");
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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

    setPreviewUrl(URL.createObjectURL(file));
    console.log(file, "ss");
    try {
      const uploadResult = await uploadToS3({
        file: file,
        BASE_URL,
        token,
        folder: "trip-images",
      });

      if (!uploadResult?.key) {
        toast.error("Failed to upload image.");
        return;
      }
      console.log(uploadResult, "I am the upload result");
      setImgkey(uploadResult.key);
      formData.image = uploadResult.key;

      const signedUrl = await getFileUrl(uploadResult.key);
      if (signedUrl) {
        setPreviewUrl(signedUrl);

        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to generate signed URL.");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Error uploading image.");
    } finally {
      setImageLoading(false);
    }
  };

  const generateInviteCode = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const {mutate, isLoading} = useMutation({
    mutationFn: (formData) => createTripService(formData, token),
    onSuccess: (data) => {
      console.log("Trip Created Successfully:", data);
      localStorage.setItem("selectedTripId", data?.data?.id); // save in localStorage

      toast.success(data.message);
      navigate("/mytrips");
    },
    onError: (error) => {
      console.error("Failed to Create Trip:", error);
      toast.error("Failed to create trip. Please try again.");
    },
  });

  const handleSubmit = () => {
    console.log(" Form Data:", formData);
    mutate(formData);
  };
  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.trip_occasion && formData.destination;
      case 2:
        return formData.start_date && formData.end_date;
      case 3:
        return formData.booking_deadline;
      case 4:
        return formData.welcome_message;
      default:
        return false;
    }
  };

  const steps = [
    {number: 1, title: "Trip Basics", icon: MapPin},
    {number: 2, title: "Dates", icon: Calendar},
    {number: 3, title: "Deadline", icon: CheckCircle},
    {number: 4, title: "Welcome", icon: MessageSquare},
  ];
  // useEffect(async () => {
  //   if (imgkey) {
  //     const getImage = await getFileUrl(imgkey);
  //     setPreviewUrl(getImage);
  //   }
  // }, [imgkey]);

  const getFileUrl = async (fileKey) => {
    const endpoint = `${BASE_URL}/files/signed-url/${fileKey}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();

    if (json?.success && json?.data?.url) {
      const result = json.data.url;
      return result;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2 md:mb-4">
            Create Your Trip
          </h1>
          <p className="text-base md:text-xl text-slate-600">
            You'll become the trip admin with full control
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex items-center space-x-2 md:space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div
                  className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-slate-300 text-slate-400"
                  }`}
                >
                  <step.icon className="w-3 h-3 md:w-5 md:h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-1 rounded transition-all duration-300 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 md:pb-8">
            <CardTitle className="text-xl md:text-2xl font-bold text-slate-800">
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-8">
            {/* Step 1: Trip Basics */}
            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <Label
                    htmlFor="trip_occasion"
                    className="text-sm font-semibold text-slate-700"
                  >
                    What's the occasion for this trip?
                  </Label>
                  <Input
                    id="trip_occasion"
                    placeholder="e.g., Bachelor Party"
                    value={formData.trip_occasion}
                    onChange={(e) =>
                      updateFormData("trip_occasion", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="destination"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Where are you going?
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Miami, FL"
                    value={formData.destination}
                    onChange={(e) =>
                      updateFormData("destination", e.target.value)
                    }
                    className="mt-2"
                  />
                </div>

                {/* 👇 Image Upload Field */}
                <div>
                  <Label
                    htmlFor="image"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Trip Image
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="mt-2"
                  />

                  {/* ✅ Preview */}
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Trip Preview"
                      className="mt-3 w-full h-48 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Dates */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label
                      htmlFor="start_date"
                      className="text-sm md:text-base font-semibold text-slate-700"
                    >
                      Trip Start Date
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        updateFormData("start_date", e.target.value)
                      }
                      className="mt-2 text-base md:text-lg py-4 md:py-6 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="end_date"
                      className="text-sm md:text-base font-semibold text-slate-700"
                    >
                      Trip End Date
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        updateFormData("end_date", e.target.value)
                      }
                      min={formData.start_date}
                      className="mt-2 text-base md:text-lg py-4 md:py-6 border-slate-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Booking Deadline */}
            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <Label className="text-sm md:text-base font-semibold text-slate-700">
                    When should you (as the admin) book the trip by?
                  </Label>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 mb-3 md:mb-4">
                    Choose how many weeks before the trip starts
                  </p>
                  <Select
                    value={formData.booking_deadline}
                    onValueChange={(value) =>
                      updateFormData("booking_deadline", value)
                    }
                  >
                    <SelectTrigger className="text-base md:text-lg py-4 md:py-6 border-slate-200 focus:border-blue-500">
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
              </div>
            )}

            {/* Step 4: Welcome Message */}
            {currentStep === 4 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <Label
                    htmlFor="welcome_message"
                    className="text-sm md:text-base font-semibold text-slate-700"
                  >
                    Welcome message for your group
                  </Label>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 mb-3 md:mb-4">
                    This will be the first thing participants see when they join
                  </p>
                  <Textarea
                    id="welcome_message"
                    placeholder="Welcome to our amazing trip! I'm excited to plan this adventure together. Let's make some unforgettable memories!"
                    value={formData.welcome_message}
                    onChange={(e) =>
                      updateFormData("welcome_message", e.target.value)
                    }
                    className="mt-2 text-sm md:text-lg py-3 md:py-4 border-slate-200 focus:border-blue-500 min-h-24 md:min-h-32"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 md:mt-12">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 md:px-8 py-3 text-sm md:text-base order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() || imgLoading}
                  className="px-6 md:px-8 py-3 text-sm md:text-base bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="px-8 md:px-12 py-3 text-sm md:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 order-1 sm:order-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <>
                      Create Trip
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
