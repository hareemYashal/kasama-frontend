"use client";

import React, { useState } from "react";
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
import { Eye, EyeOff, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { loginService } from "@/services/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUserRed } from "@/store/userSlice";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveTripService, getTripService } from "@/services/trip";
import { setActiveTripId } from "@/store/tripSlice";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
export default function LoginPage({ onNavigate }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  console.log("Hey I am the User", user);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Logic
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: loginService,
    onSuccess: async (data) => {
      console.log("Login success:", data);
      toast.success(data.message);

      // ✅ save user/token in Redux + localStorage
      dispatch(setToken(data.data.token));
      dispatch(setUserRed(data.data.user));
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", JSON.stringify(data.data.token));

      queryClient.invalidateQueries(["getActiveTripData"]);

      // ✅ Check if invite exists
      const inviteData = JSON.parse(localStorage.getItem("inviteData"));
      if (inviteData?.tripId && inviteData?.code) {
        try {
          const res = await axiosInstance.post(
            `/participant/joinViaInvite`,
            {
              tripId: inviteData.tripId,
              inviteCode: inviteData.code,
            },
            {
              headers: { Authorization: `Bearer ${data.data.token}` },
            }
          );
          toast.success(
            res.data.message || "You’ve successfully joined the trip!"
          );
        } catch (err) {
          console.error(err);
          toast.error(err?.response?.data?.message || "Failed to join trip");
        } finally {
          localStorage.removeItem("inviteData"); // clear invite after use
          navigate("/mytrips");
        }
      } else {
        // normal flow
        navigate("/mytrips");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setErrors({ general: "Invalid email or password" });
      toast.error(error?.response?.data?.message || "Error Please Try again");
    },
  });

  // const { data: activeTripData, isSuccess: activeTripSuccess } = useQuery({
  //   queryKey: ["getActiveTripData"],
  //   queryFn: () => getActiveTripService(token),
  //   enabled: !!token,
  // });
  const tripId = useSelector((state) => state?.trips?.activeTripId);

  const { data: activeTripData, isLoading: activeTripSuccess } = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(token, tripId),
    enabled: !!token,
  });
  useEffect(() => {
    if (activeTripSuccess && activeTripData?.data?.activeTrip?.id) {
      // dispatch(setActiveTripId(activeTripData.data.activeTrip.id));
      localStorage.setItem(
        "activeTripId",
        JSON.stringify(activeTripData.data.activeTrip.id)
      );
    }
  }, [activeTripData, activeTripSuccess, dispatch]);
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    mutate(formData);
  };

  useEffect(() => {
    if (user) {
      navigate("/mytrips");
    }
  }, [user, navigate]);

  // --------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-serif font-black text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-black bg-destructive/10 border border-destructive/20 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={
                  errors.email
                    ? "border-destructive focus:ring-destructive"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`pr-10 ${
                    errors.password
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

            <div className="flex items-center justify-between">
              <Link to="/forgotPassword">
                <button
                  type="button"
                  className="text-sm text-black  transition-colors"
                >
                  Forgot Password?
                </button>
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5"
              disabled={isPending}
            >
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register">
                <button className="text-black   font-medium transition-colors">
                  Create Account
                </button>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
