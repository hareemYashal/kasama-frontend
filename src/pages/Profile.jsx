import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Save, UserCircle, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { getProfileService, saveProfileService } from "@/services/profile";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.user.token);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    phone_number: "",
    birthday: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    passport_number: "",
    passport_country: "",
    passport_expiration: "",
    profile_photo_url: "",
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfileService(token),
    enabled: !!token, // only fetch if token exists
  });

  // Update form when data arrives
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;

      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        phone_number: profile.phone_number || "",
        birthday: profile.birthday ? profile.birthday.split("T")[0] : "",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
        emergency_contact_relationship:
          profile.emergency_contact_relationship || "",
        passport_number: profile.passport_number || "",
        passport_country: profile.passport_country || "",
        passport_expiration: profile.passport_expiration
          ? profile.passport_expiration.split("T")[0]
          : "",
        profile_photo_url: profile.profile_photo_url || "",
      });

      if (profile.profile_photo_url) {
        setPreviewUrl(profile.profile_photo_url);
      }
    }
  }, [profileData]);

  // Save profile
  const queryClient = useQueryClient();

  const { mutate, isLoading: saving } = useMutation({
    mutationFn: (payload) => saveProfileService(payload, token),
    onSuccess: (res) => {
      toast.success(res.message || "Profile saved successfully");

      // 🔄 Invalidate cached profile so Layout refetches
      queryClient.invalidateQueries(["profile"]);

      navigate(createPageUrl("profile"));
    },
    onError: () => {
      toast.error("Failed to save profile");
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare multipart form data
    const payload = new FormData();

    // Append all text fields
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        payload.append(key, formData[key]);
      }
    });

    // Append image if selected
    if (profilePhotoFile) {
      payload.append("profile_photo", profilePhotoFile); // 👈 name must match backend field
    }

    mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="bg-white/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCircle className="w-6 h-6 text-blue-600" />
              My Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and emergency contacts.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <img
                  src={
                    previewUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      formData.full_name
                    )}&background=random`
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-1">
                  <Label htmlFor="profile_photo">Profile Photo</Label>
                  <Input
                    id="profile_photo"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Upload a new photo to update your avatar.
                  </p>
                </div>
              </div>

              {/* Full Name + Username */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name">Full Name (Private)</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ""}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username (Public)</Label>
                  <Input
                    id="username"
                    value={formData.username || ""}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Phone + Birthday */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel" // ✅ phone input
                    value={formData.phone_number || ""}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date" // ✅ date input
                    value={formData.birthday || ""}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-700">
                  Emergency Contact
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emergency_contact_name">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name || ""}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergency_contact_phone"
                    type="number" // ✅ phone input
                    value={formData.emergency_contact_phone || ""}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_contact_relationship">
                  Relationship to Emergency Contact
                </Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship || ""}
                  onChange={handleFormChange}
                />
              </div>

              {/* Travel Documents Section */}
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-700">
                  Travel Documents
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="passport_number">Passport Number</Label>
                  <Input
                    id="passport_number"
                    type="text"
                    value={formData.passport_number || ""}
                    onChange={handleFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="passport_country">Country of Issue</Label>
                  <Input
                    id="passport_country"
                    type="text"
                    value={formData.passport_country || ""}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="passport_expiration">Passport Expiration</Label>
                <Input
                  id="passport_expiration"
                  type="date"
                  value={formData.passport_expiration || ""}
                  onChange={handleFormChange}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
