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
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { loginService, loginWithGoogleService } from "@/services/auth";
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
import { useGoogleLogin } from "@react-oauth/google";
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
          console.log("ssssssssssssssssssssss", res?.data);

          localStorage.setItem("selectedTripId", res?.data?.data?.trip?.id); // save in localStorage
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

  const googleLogin = useGoogleLogin({
    // prompt: "consent", // optional
    onSuccess: async (tokenResponse) => {
      // tokenResponse has access_token; but better to request id_token by exchange on backend?
      // @react-oauth/google can give you access_token. We can call Google token info endpoint
      // on the backend to get user info. For easier flow, ask for 'id_token' using redirect-based,
      // but this approach is widely used: send access_token to backend and backend verifies via google APIs.
      try {
        // send access token to backend
        const resp = await loginWithGoogleService({
          access_token: tokenResponse.access_token,
        });

        console.log('GOOGLEresp', resp)
        // success flow identical to your current loginService success:
        toast.success(resp.data.message || "Login Successful");
        dispatch(setToken(resp.data.data.token));
        dispatch(setUserRed(resp.data.data.user));
        localStorage.setItem("user", JSON.stringify(resp.data.data.user));
        localStorage.setItem("token", JSON.stringify(resp.data.data.token));
        queryClient.invalidateQueries(["getActiveTripData"]);
        // handle invite flow (same as existing)
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
                headers: { Authorization: `Bearer ${resp.data.data.token}` },
              }
            );
            toast.success(
              res.data.message || "You’ve successfully joined the trip!"
            );
            localStorage.setItem("selectedTripId", res?.data?.data?.trip?.id);
          } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to join trip");
          } finally {
            localStorage.removeItem("inviteData");
            navigate("/mytrips");
          }
        } else {
          navigate("/mytrips");
        }
      } catch (err) {
        console.error("Google login failed:", err);
        toast.error(err?.response?.data?.message || "Google login failed");
      }
    },
    onError: (err) => {
      console.error("Google login error:", err);
      toast.error("Google sign-in was cancelled or failed");
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
    queryFn: () => getTripService(tripId),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10 text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <div className="text-center pb-8">
          {/* <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-8"> */}
          <div className="flex items-center justify-center">

            <img
              src="/assets/kasama-logo1.jpg"
              alt="Kasama Logo"
              className="w-50 h-16 rounded-full"
            />
          </div>{" "}
          {/* </div> */}
          <div className="space-y-2 sm:space-y-3">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome to Kasama
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm sm:text-base font-medium">
              Sign in to continue
            </CardDescription>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-black bg-destructive/10 border border-destructive/20 rounded-md">
                {errors.general}
              </div>
            )}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
              >
                <div className=" transition-transform duration-200 -ml-4">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                </div>
                <span>Continue with Google</span>
              </button>
              {/* <button className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group">
                <div className=" transition-transform duration-200 ">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    ></path>
                  </svg>
                </div>
                <span>Continue with Facebook</span>
              </button> */}
            </div>
            <div className="relative !my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  data-orientation="horizontal"
                  role="none"
                  className="shrink-0 h-[1px] w-full bg-slate-200"
                ></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                  or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-3">
                <Label
                  className="flex justify-center items-center"
                  htmlFor="email"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={
                      errors.email
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  className="flex justify-center items-center"
                  htmlFor="password"
                >
                  Password
                </Label>
                <div className="relative space-y-3">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`pr-10 ${errors.password
                        ? "border-destructive focus:ring-destructive"
                        : ""
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-6 !mt-0 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

              <Button
                type="submit"
                className="inline-flex items-center justify-center gap-2 !mt-4 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-4 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between !mt-2">
            <div className="flex items-center justify-between">
              <Link to="/forgotPassword">
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Need an account?{" "}
              <Link to="/register">
                <button className="text-black font-medium transition-colors">
                  Sign up
                </button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
