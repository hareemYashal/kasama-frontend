"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, UserPlus, User, Mail, Lock, Phone } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { registerService } from "@/services/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase and a number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerService,
    onSuccess: async (data) => {
      toast.success(data.message || "Registration successful!");
      console.log("REGISTERUSERdata--->", data);

      const tripId = new URLSearchParams(window.location.search).get("trip_id");
      const code = new URLSearchParams(window.location.search).get("code");

      if (tripId && code) {
        console.log("YESSS--->");

        try {
          // ✅ use axiosInstance only
          await axiosInstance.post(
            `/participant/joinViaInvite`,
            { tripId, inviteCode: code },
            { headers: { Authorization: `Bearer ${data.data.token}` } }
          );

          navigate("/login"); // go to My Trips after joining
        } catch (err) {
          console.error(err);
          // toast.error("Failed to join trip");
        }
      } else {
        navigate("/login"); // normal registration flow
      }
    },
    onError: (error) => {
      console.log("No--->");

      console.log("error", error);
      toast.error(error?.response?.data?.message || "Error in registration");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    mutate(formData);

    // mutate(formData, {
    //   onSuccess: async (data) => {
    //     toast.success(data.message || "Registration successful!");
    //     const tripId = new URLSearchParams(window.location.search).get(
    //       "trip_id"
    //     );
    //     const code = new URLSearchParams(window.location.search).get("code");

    //     if (tripId && code) {
    //       // Auto join trip after registration
    //       await axios.post(
    //         `${process.env.VITE_API_URL}/participant/joinViaInvite`,
    //         { tripId, userId: data.data.user?.id, inviteCode: code },
    //         { headers: { Authorization: `Bearer ${data.data.token}` } }
    //       );
    //       navigate(`/trip/${tripId}`);
    //     } else {
    //       navigate("/login");
    //     }
    //   },
    // });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fillSampleData = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      acceptTerms: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-serif font-black text-foreground">
            Join Us
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your account to get started
          </CardDescription>
          <button
            type="button"
            onClick={fillSampleData}
            className="text-xs text-secondary hover:text-secondary/80 transition-colors"
          >
            Fill sample data
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-10 ${
                    errors.name
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${
                    errors.email
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={`pl-10 ${
                    errors.phoneNumber
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`pl-10 pr-10 ${
                    errors.password
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`pl-10 pr-10 ${
                    errors.confirmPassword
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  handleInputChange("acceptTerms", checked)
                }
              />
              <div>
                <Label htmlFor="acceptTerms">
                  I agree to the{" "}
                  <button type="button" className="underline">
                    Terms and Conditions
                  </button>{" "}
                  and{" "}
                  <button type="button" className="underline">
                    Privacy Policy
                  </button>
                </Label>
                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">
                    {errors.acceptTerms}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center">
            <p>
              Already have an account?{" "}
              <Link to="/login">
                <button className="underline">Sign In</button>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
