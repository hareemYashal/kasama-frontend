import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, UserCircle, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    profile_photo_url: '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // Load dummy user data
  const loadUserData = async () => {
    setLoading(true);
    try {
      const currentUser = {
        id: 1,
        full_name: "Alex Morgan",
        phone_number: "123-456-7890",
        emergency_contact_name: "Jamie",
        emergency_contact_phone: "987-654-3210",
        emergency_contact_relationship: "Friend",
        profile_photo_url: "",
        trip_role: "admin", // or "participant"
      };
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name,
        phone_number: currentUser.phone_number,
        emergency_contact_name: currentUser.emergency_contact_name,
        emergency_contact_phone: currentUser.emergency_contact_phone,
        emergency_contact_relationship: currentUser.emergency_contact_relationship,
        profile_photo_url: currentUser.profile_photo_url,
      });
      setPreviewUrl(currentUser.profile_photo_url);
    } catch (error) {
      console.error("Error loading user data:", error);
      navigate(createPageUrl("Home"));
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Profile saved successfully! (dummy data)");

      if (user?.trip_role === "admin") {
        navigate(createPageUrl("Dashboard"));
      } else {
        navigate(createPageUrl("ParticipantDashboard"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCircle className="w-6 h-6 text-blue-600" />
              My Profile
            </CardTitle>
            <CardDescription>Update your personal information and emergency contacts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <img
                  src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=random`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-1">
                  <Label htmlFor="profile_photo">Profile Photo</Label>
                  <Input id="profile_photo" type="file" onChange={handleFileChange} accept="image/*" className="mt-1" />
                  <p className="text-xs text-slate-500 mt-1">Upload a new photo to update your avatar.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" value={formData.full_name} onChange={handleFormChange} />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input id="phone_number" value={formData.phone_number} onChange={handleFormChange} />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-semibold text-slate-700">Emergency Contact</h3>
                <p className="text-sm text-slate-500">This information will be visible to the trip admin.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input id="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleFormChange} />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input id="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleFormChange} />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_contact_relationship">Relationship to Emergency Contact</Label>
                <Input
                  id="emergency_contact_relationship"
                  placeholder="e.g., mother, spouse, friend, sibling"
                  value={formData.emergency_contact_relationship}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={saving} className="px-8 bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
