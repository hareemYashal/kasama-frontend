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
import {
  ArrowLeft,
  Settings,
  Save,
  Image as ImageIcon,
  SaveIcon,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { updateTripService, getTripByIdService } from "@/services/trip";
import { toast } from "sonner";
import { uploadToS3 } from "@/utils/utils";
import heic2any from "heic2any";

export default function ManageTrip() {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const CLIENT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB UX guard
  const API_UPLOAD_LIMIT_BYTES = 1024 * 1024; // ~1MB API gateway cap

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [url, setUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
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

  // 🔹 Update trip mutation
  const { mutate, isLoading: isMutating } = useMutation({
    mutationFn: ({ formDataToSend, tripId, token }) =>
      updateTripService(formDataToSend, tripId, token),
    onSuccess: (data) => {
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
  const getFileUrl = async (fileKey) => {
    const endpoint = `${BASE_URL}/files/signed-url/${fileKey}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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

  const compressImageForUpload = async (file, maxBytes = API_UPLOAD_LIMIT_BYTES) => {
    if (typeof window === "undefined") return file;
    if (!file?.type?.startsWith("image/")) return file;
    if (file.size <= maxBytes) return file;

    const loadImageFromFile = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const objectUrl = URL.createObjectURL(file);

    try {
      const imageElement = await loadImageFromFile(objectUrl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return file;
      }

      const MAX_DIMENSION = 1600;
      const largestSide = Math.max(imageElement.width, imageElement.height);
      const scale =
        largestSide > MAX_DIMENSION ? MAX_DIMENSION / largestSide : 1;

      const targetWidth = Math.max(1, Math.round(imageElement.width * scale));
      const targetHeight = Math.max(1, Math.round(imageElement.height * scale));

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

      const canvasToBlob = (quality) =>
        new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            quality
          );
        });

      let quality = 0.85;
      let blob = await canvasToBlob(quality);

      while (blob && blob.size > maxBytes && quality > 0.4) {
        quality -= 0.1;
        blob = await canvasToBlob(quality);
      }

      if (!blob || blob.size > maxBytes) {
        return null;
      }

      return new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, ".jpg"),
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        }
      );
    } catch (error) {
      console.error("Image compression failed:", error);
      return null;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };
  useEffect(() => {
    if (!previewUrl || previewUrl === "null") return;

    // ⚡ Skip fetching if it's already a full URL or blob URL
    if (previewUrl.startsWith("http") || previewUrl.startsWith("blob:")) {
      setUrl(previewUrl);
      return;
    }

    const fetchFileUrl = async () => {
      try {
        const ur = await getFileUrl(previewUrl);
        setUrl(ur);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFileUrl();
  }, [previewUrl]);

  const handleImageChange = async (e) => {
    try {
      setImageLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      // 🧩 Force-detect extension when type is missing
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      let mimeType = file.type;

      if (!mimeType) {
        if (fileExtension === "heic") mimeType = "image/heic";
        else if (fileExtension === "heif") mimeType = "image/heif";
        else if (fileExtension === "jpg" || fileExtension === "jpeg")
          mimeType = "image/jpeg";
        else if (fileExtension === "png") mimeType = "image/png";
        else if (fileExtension === "webp") mimeType = "image/webp";
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ];

      if (!allowedTypes.includes(mimeType)) {
        toast.error(
          "Please select a valid image (JPG, JPEG, PNG, WebP, HEIC, or HEIF)"
        );
        e.target.value = "";
        setImageLoading(false);
        return;
      }

      if (file.size > CLIENT_MAX_FILE_SIZE) {
        toast.error("Image file size must be less than 5MB");
        e.target.value = "";
        setImageLoading(false);
        return;
      }

      let fileToUpload = file;
      let previewURL = null;

      // ✅ HEIC/HEIF conversion with empty type handling
      if (["heic", "heif"].includes(fileExtension)) {
        try {
          // ✅ Force MIME if browser didn't detect it
          const heicFile = new File([file], file.name, { type: "image/heic" });

          // ✅ Convert HEIC/HEIF → JPEG using heic2any
          const convertedBlob = await heic2any({
            blob: heicFile,
            toType: "image/jpeg",
            quality: 0.9,
          });

          const blobItem = Array.isArray(convertedBlob)
            ? convertedBlob[0]
            : convertedBlob;

          if (!blobItem || !(blobItem instanceof Blob)) {
            throw new Error("Conversion failed: invalid blob");
          }

          // ✅ Create preview and File object
          previewURL = URL.createObjectURL(blobItem);
          setUrl(previewURL);

          fileToUpload = new File(
            [blobItem],
            file.name.replace(/\.[^/.]+$/, ".jpg"),
            {
              type: "image/jpeg",
            }
          );

          console.log("✅ Converted HEIC/HEIF → JPEG:", fileToUpload);
        } catch (err) {
          console.error("❌ HEIC conversion failed:", err);
          toast.error("Failed to convert HEIC/HEIF image.");
          setImageLoading(false);
          return;
        }
      } else {
        // ✅ For JPEG, PNG, WebP - use file directly (will be compressed if needed)
        fileToUpload = file;
        previewURL = URL.createObjectURL(file);
        setUrl(previewURL);
      }

      // ✅ Compress ALL images (JPEG, PNG, WebP, converted HEIC) against API upload limit (~1MB) before sending
      const compressedFile = await compressImageForUpload(fileToUpload);

      if (!compressedFile) {
        toast.error(
          "Image is too large. Please choose a smaller one (needs to be under 1MB after compression)."
        );
        e.target.value = "";
        setImageLoading(false);
        return;
      }

      fileToUpload = compressedFile;
      previewURL = URL.createObjectURL(fileToUpload);
      setUrl(previewURL);

      if (fileToUpload.size > API_UPLOAD_LIMIT_BYTES) {
        toast.error(
          "Image is too large. Please choose a smaller one (needs to be under 1MB after compression)."
        );
        e.target.value = "";
        setImageLoading(false);
        return;
      }

      // ✅ Upload to S3
      const uploadResult = await uploadToS3({
        file: fileToUpload,
        BASE_URL,
        token,
        folder: "trip-images",
      });

      if (!uploadResult?.key) {
        toast.error("Failed to upload image.");
        setImageLoading(false);
        return;
      }

      formData.image = uploadResult.key;
      setTripImageFile(uploadResult.key);

      // ✅ Get signed URL
      const signedUrl = await getFileUrl(uploadResult.key);
      if (signedUrl) {
        setPreviewUrl(signedUrl);
        // setUrl(signedUrl);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to generate signed URL.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image.");
    } finally {
      setImageLoading(false);
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
      formDataToSend.append("image", formData.image);
    }
    //
    mutate({ formDataToSend, tripId, token });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  console.log("url", url);
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
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-32 h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    {url ? (
                      <img
                        alt="Trip preview"
                        className="w-full h-full object-cover rounded-lg"
                        src={url}
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
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                      capture={false}
                      onChange={handleImageChange}
                      id="profile_photo"
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base cursor-pointer ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1 file:text-primary"
                    />

                    <p className="text-xs text-slate-500 mt-1">
                      Supported formats: JPG,JPEG, PNG, WebP, HEIC, or HEIF (max 5MB)
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
                  className="mt-2"
                  value={formData.occasion}
                  onChange={(e) => updateFormData("occasion", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  className="mt-2"
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
                  className="mt-2"
                  type="date"
                  value={
                    formData.start_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => updateFormData("start_date", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  className="mt-2"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData("end_date", e.target.value)}
                  min={
                    formData.start_date ||
                    new Date().toISOString().split("T")[0]
                  }
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <Label>Booking Deadline</Label>
                <p className="text-xs text-slate-500">
                  How many weeks before the trip starts should everyone book by?
                </p>
              </div>
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
              <div className="mb-4">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <p className="text-xs text-slate-500">
                  This message will be shown to participants when they join
                </p>
              </div>
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
                disabled={saving || isMutating || imageLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                <SaveIcon />{" "}
                {saving || isMutating || imageLoading
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
