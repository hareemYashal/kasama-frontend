"use client";

import { useEffect, useState } from "react";
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
import {
  Eye,
  EyeOff,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { registerService } from "@/services/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { useGoogleLogin } from "@react-oauth/google";
import { loginWithGoogleService } from "@/services/auth"; // same service as in login
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUserRed } from "@/store/userSlice";
import { useQueryClient } from "@tanstack/react-query";

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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: registerService,
    onSuccess: async (data) => {
      toast.success(data.message || "Registration successful!");
      const tripId = new URLSearchParams(window.location.search).get("trip_id");
      const code = new URLSearchParams(window.location.search).get("code");

      if (tripId && code) {
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
      toast.error(error?.response?.data?.message || "Error in registration");
    },
  });

  const googleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const resp = await loginWithGoogleService({
          access_token: tokenResponse.access_token,
        });

        toast.success(resp.data.message || "Registration successful!");

        // Save user & token in Redux + localStorage
        dispatch(setToken(resp.data.data.token));
        dispatch(setUserRed(resp.data.data.user));
        localStorage.setItem("user", JSON.stringify(resp.data.data.user));
        localStorage.setItem("token", JSON.stringify(resp.data.data.token));

        queryClient.invalidateQueries(["getActiveTripData"]);

        // ✅ Handle invite link auto-join
        const tripId = new URLSearchParams(window.location.search).get(
          "trip_id"
        );
        const code = new URLSearchParams(window.location.search).get("code");

        if (tripId && code) {
          try {
            await axiosInstance.post(
              `/participant/joinViaInvite`,
              { tripId, inviteCode: code },
              { headers: { Authorization: `Bearer ${resp.data.data.token}` } }
            );
            toast.success("You’ve successfully joined the trip!");
          } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to join trip");
          } finally {
            navigate("/mytrips");
          }
        } else {
          navigate("/mytrips");
        }
      } catch (err) {
        console.error("Google registration failed:", err);
        toast.error(
          err?.response?.data?.message || "Google registration failed"
        );
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled or failed");
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

  useEffect(() => {
    if (user) {
      navigate("/mytrips");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10 text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <div className="space-y-2 sm:space-y-3 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2"
          >
            <ArrowLeft class="w-4 h-4" />
            Back to sign in
          </button>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 !mt-5">
            Create your account
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => googleRegister()}
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
          </div>
          <div className="relative !my-4">
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
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                className="flex justify-center items-center"
                htmlFor="name"
              >
                Full Name
              </Label>
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
              <Label
                className="flex justify-center items-center"
                htmlFor="email"
              >
                Email Address
              </Label>
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
              <Label
                className="flex justify-center items-center"
                htmlFor="phoneNumber"
              >
                Phone Number
              </Label>
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
              <Label
                className="flex justify-center items-center"
                htmlFor="password"
              >
                Password
              </Label>
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
              <Label
                className="flex justify-center items-center"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </Label>
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
                <Label
                  className="flex justify-center items-center gap-[3px]"
                  htmlFor="acceptTerms"
                >
                  <p className="text-[13px]">
                    I agree to the{" "}
                    <span className="underline cursor-pointer">
                      Terms and Conditions
                    </span>{" "}
                    and{" "}
                    <span className="underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </p>
                </Label>

                {errors.acceptTerms && (
                  <p className="text-sm text-destructive">
                    {errors.acceptTerms}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 !mt-4 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-4 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200"
            >
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center !mt-2">
            <p>
              Already have an account?{" "}
              <Link to="/login">
                <button className="underline">Sign In</button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
