"use client";

import {useState, useEffect, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {createPageUrl} from "@/utils";
import {Trip} from "@/api/entities";
import {User} from "@/api/entities";
import {Contribution} from "@/api/entities";
import {TripActivity} from "@/api/entities";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Switch} from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  DollarSign,
  ArrowLeft,
  Users,
  Banknote,
  Shield,
  Check,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {useQueryClient} from "@tanstack/react-query";
import {getPaymentRemainingsService} from "@/services/paynent";
import {useSelector} from "react-redux";
import {
  participantStatusUpdateService,
  participantTripCheck,
  totalParticipantsService,
} from "@/services/participant";
import {toast} from "sonner";
import {getTripService} from "@/services/trip";
// Import axiosInstance to fix undeclared variable error
// import axiosInstance from "@/services/axiosInstance"

export default function Payments() {
  const authToken = useSelector((state) => state.user.token);
  const authUser = useSelector((state) => state.user.user);
  const authTripId = useSelector((state) => state.trips.activeTripId);
  const authUerId = authUser?.id;

  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const user = authUser;
  const hasAdminAcess =
    user?.trip_role === "creator" || user?.trip_role === "co-admin";

  const {data: participantsData} = useQuery({
    queryKey: ["totalParticipantsService"],
    queryFn: () => totalParticipantsService(token, tripId),
    enabled: !!token && !!tripId,
  });
  const totalParticipant = participantsData?.data?.participants;
  const tripParticipantsNumber =
    participantsData?.data?.participants?.length || 0;
  console.log(totalParticipant, "totalParticipant");
  console.log(tripParticipantsNumber, "tripParticipantsNumber");
  const BASE_URL = import.meta.env.VITE_API_URL;

  console.log("authUser", authUser);
  const [requestText, setRequestText] = useState("Request");
  const [isInvited, setIsInvited] = useState(false); // ✅ default false
  const [paymentDetailData, setPaymentDetailData] = useState(null);
  const [contribution, setContribution] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [methodType, setMethodType] = useState("ach"); // Default to ACH (cheaper)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(null);
  const [oneTimeAmount, setOneTimeAmount] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendPaymentAmount, setFriendPaymentAmount] = useState("");
  const [processingFriendPayment, setProcessingFriendPayment] = useState(false);
  // const [friendBreakdown, setFriendBreakdown] = useState({
  //   amount: 0,
  //   stripeFee: 0,
  //   totalCharge: 0,
  // });

  // ✅ Instead of allContributions, use totalParticipant directly
  const selectedFriendContribution = totalParticipant?.find(
    (c) => c.userId === selectedFriend
  );

  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState("");
  const [recurringPaymentDay, setRecurringPaymentDay] = useState("");
  const [autoPayAmount, setAutoPayAmount] = useState(0);

  // Example handlers
  const handleAutoPayToggle = (enabled) => {
    setAutoPayEnabled(enabled);
    setShowPaymentModal(false);

    if (enabled && paymentDetailData?.remainings) {
      const amount = calculateAutoPayAmount(
        contribution?.remainings ?? paymentDetailData?.remainings,
        paymentFrequency
      );
      setAutoPayAmount(amount);
    } else {
      setAutoPayAmount(0);
    }
  };

  const handleSaveAutoPay = async () => {
    try {
      const payload = {
        tripId: trip?.id, // or contributionId, depending on your schema
        paymentMethodId: paymentMethod?.id,
        frequency: paymentFrequency,
        day: recurringPaymentDay,
        amount: autoPayAmount,
      };

      // NOTE: axiosInstance usage preserved per original logic
      // const res = await axiosInstance.post("/api/autopay/setup", payload)

      // if (res.data.success) {
      //   toast.success("Auto-Pay enabled successfully!")
      //   setAutoPayEnabled(true)
      // } else {
      //   toast.error("Failed to enable Auto-Pay")
      // }
    } catch (err) {
      toast.error("Something went wrong while setting up Auto-Pay");
      console.error(err);
    }
  };

  const handleFrequencyChange = (value) => {
    setPaymentFrequency(value);

    if (paymentDetailData?.remainings) {
      const amount = calculateAutoPayAmount(
        paymentDetailData.remainings,
        value
      );
      setAutoPayAmount(amount);
    }
  };

  const handleRecurringDayChange = (value) => {
    setRecurringPaymentDay(value);
  };

  const [processingOneTimePayment, setProcessingOneTimePayment] =
    useState(false);
  const {data: paymentData, isSuccess: isPaymentDataSuccess} = useQuery({
    queryKey: ["getPaymentRemainingsQuery", authTripId, authUerId],
    queryFn: () =>
      getPaymentRemainingsService(authToken, authTripId, authUerId),
    enabled: !!authToken && !!authTripId && !!authUerId,
  });
  console.log("paymentData", paymentData);

  const {data: savedPaymentMethodData} = useQuery({
    queryKey: ["getPaymentMethod", authUerId, authTripId],
    queryFn: async () => {
      const response = await fetch(
        `${BASE_URL}/payment/getPaymentMethod?userId=${authUerId}&tripId=${authTripId}`,
        {
          headers: {Authorization: `Bearer ${authToken}`},
        }
      );
      const result = await response.json();
      return result;
    },
    enabled: !!authToken && !!authUerId && !!authTripId,
  });

  useEffect(() => {
    if (paymentData?.data?.data) {
      const apiData = paymentData.data.data;
      console.log("paymentData", apiData);

      setPaymentDetailData(apiData);

      // keep `contribution` in sync for legacy UI
      setContribution({
        goal_amount: apiData.your_goal,
        amount_paid: apiData.amountPaid,
        amount_remaining: apiData.remainings,
      });
    }
  }, [isPaymentDataSuccess]);

  useEffect(() => {
    if (savedPaymentMethodData?.success && savedPaymentMethodData?.data) {
      const method = savedPaymentMethodData.data;
      setPaymentMethod({
        id: method.id,
        brand: method.brand,
        last4: method.last4,
        type: method.type,
        stripePaymentMethodId: method.stripePaymentMethodId,
      });
      setMethodType(method.type || "ach");
    }
  }, [savedPaymentMethodData]);

  const {data: isInvitedData, isSuccess: invitedSuccess} = useQuery({
    queryKey: ["participantTripCheckQuery", authToken, authUerId, authTripId],
    queryFn: () => participantTripCheck(authToken, authUerId, authTripId),
    enabled: !!authToken && !!authTripId && !!authUerId,
  });
  console.log("isInvitedData", isInvitedData);
  useEffect(() => {
    if (invitedSuccess) {
      setIsInvited(!!isInvitedData?.invitation);
    }
  }, [invitedSuccess, isInvitedData]);

  const {mutate: updateMutation, isPending} = useMutation({
    mutationFn: ({authToken, authUerId, authTripId, status}) =>
      participantStatusUpdateService(authToken, authUerId, authTripId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getAllRegisteredUsers"],
      });
      setRequestText("Wait for Approval");
    },
  });

  const handleRequest = () => {
    const status = "REQUESTED";
    updateMutation({authToken, authUerId, authTripId, status});
  };

  // -----------------------------

  useEffect(() => {
    const fetchPaymentRemainings = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/payment/getPaymentRemainings?tripId=${authTripId}&userId=${authUerId}`,
          {headers: {Authorization: `Bearer ${authToken}`}}
        );
        const result = await response.json();

        if (result.success) {
          console.log("fetchPaymentRemainings", result.data);
          setPaymentDetailData(result.data.data);
          setContribution((prev) => ({
            ...(prev || {}),
            amount_remaining: result.data.data.remainings,
          }));
        }
      } catch (err) {
        console.error("Error fetching remainings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentRemainings();
  }, [authTripId, authUerId, authToken]);

  const handleOneTimePayment = async () => {
    if (!oneTimeAmount || !paymentMethod || !contribution) {
      alert(
        "Please enter an amount and ensure you have a payment method added"
      );
      return;
    }

    const {amount, totalCharge} = calculateOneTimePaymentBreakdown();

    // Debug logs
    console.log("=== DEBUG ONE TIME PAYMENT ===");
    console.log("Raw oneTimeAmount (string):", oneTimeAmount);
    console.log(
      "Parsed oneTimeAmount (number):",
      Number.parseFloat(oneTimeAmount)
    );
    console.log("Breakdown.amount (base):", amount);
    console.log("Breakdown.totalCharge:", totalCharge);
    console.log("Remaining balance:", contribution.amount_remaining);

    // Safe parse
    const parsedAmount = Number.parseFloat(oneTimeAmount);

    // Validate using parsedAmount (not breakdown just yet)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }

    if (parsedAmount > contribution.amount_remaining) {
      alert(`Please enter a valid amount not exceeding your remaining balance`);
      return;
    }

    setProcessingOneTimePayment(true);

    try {
      // If ACH is selected, process via ACH (Plaid/Stripe bank account) flow
      if (paymentMethod?.type === "ach") {
        await processAchPayment({
          amount: parsedAmount,
          authToken,
          customerEmail: (authUser && authUser.email) || "",
          customerName:
            (authUser && (authUser.name || authUser.fullName)) || "",
          beneficiaryUserId: authUerId,
          payerUserId: authUerId,
          tripId: authTripId,
          baseAmount: parsedAmount,
          paymentType: "self",
        });
      } else {
        // Default: existing card checkout flow
        const response = await fetch(
          `${BASE_URL}/payment/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              userId: authUerId,
              tripId: authTripId,
              baseAmount: parsedAmount,
              totalCharge,
              paymentType: "self",
              hasAdminAcess: hasAdminAcess,
            }),
          }
        );

        const data = await response.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (error) {
      console.error("Error creating one-time payment session:", error);
      toast.error("Something went wrong while starting payment");
    }

    setProcessingOneTimePayment(false);
  };

  const handlePayForFriend = async () => {
    console.log("selectedFriend", selectedFriend);
    console.log("friendPaymentAmount", friendPaymentAmount);
    console.log("paymentMethod", paymentMethod);

    if (!selectedFriend || !friendPaymentAmount) {
      alert("Please select a participant and enter a valid amount");
      return;
    }

    const {totalCharge} = friendBreakdown;

    setProcessingFriendPayment(true);

    try {
      if (paymentMethod?.type === "ach") {
        await processAchPayment({
          amount: Number.parseFloat(friendPaymentAmount),
          authToken,
          customerEmail: (authUser && authUser.email) || "",
          customerName:
            (authUser && (authUser.name || authUser.fullName)) || "",
          beneficiaryUserId: selectedFriend,
          payerUserId: authUerId,
          tripId: authTripId,
          baseAmount: Number.parseFloat(friendPaymentAmount),
          paymentType: "participant",
        });
      } else {
        const response = await fetch(
          `${BASE_URL}/payment/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              paidBy: authUerId, // the actual payer
              userId: selectedFriend, // the credited participant (receiver)
              tripId: authTripId, // trip reference
              baseAmount: Number.parseFloat(friendPaymentAmount), // original amount
              totalCharge, // after any fees/charges
              paymentType: "participant", // "self" or "participant"
            }),
          }
        );

        const data = await response.json();
        if (data?.url) {
          window.location.href = data.url; // redirect to Stripe Checkout
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (err) {
      console.error("Error creating friend payment session:", err);
      alert("Something went wrong while starting payment");
    }

    setProcessingFriendPayment(false);
  };

  const handleAddPaymentMethod = async () => {
    let defaultPaymentMethod;

    if (methodType === "ach") {
      defaultPaymentMethod = {
        brand: "Bank Transfer (ACH)",
        last4: "6789",
        type: "ach",
        stripePaymentMethodId: "",
      };
    } else {
      defaultPaymentMethod = {
        brand: "Visa",
        last4: "4242",
        type: "card",
        stripePaymentMethodId: "",
      };
    }

    try {
      const response = await fetch(`${BASE_URL}/payment/savePaymentMethod`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId: authUerId,
          tripId: authTripId,
          stripePaymentMethodId: defaultPaymentMethod.stripePaymentMethodId,
          type: defaultPaymentMethod.type,
          brand: defaultPaymentMethod.brand,
          last4: defaultPaymentMethod.last4,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPaymentMethod({
          ...defaultPaymentMethod,
          id: result.data.id,
        });
        setShowPaymentModal(false);
        toast.success(
          paymentMethod
            ? "Payment method updated successfully!"
            : "Payment method added successfully!"
        );

        // Invalidate query to refetch
        queryClient.invalidateQueries({
          queryKey: ["getPaymentMethod", authUerId, authTripId],
        });
      } else {
        toast.error("Failed to save payment method");
      }
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast.error("Something went wrong while saving payment method");
    }
  };

  const handleChangePaymentMethod = () => {
    // Set methodType to current payment method type before opening modal
    if (paymentMethod?.type) {
      setMethodType(paymentMethod.type);
    }
    setShowPaymentModal(true);
  };

  const calculateStripeFee = (amount, paymentType = "card") => {
    if (paymentType === "ach") {
      // ACH: 0.8% capped at $5
      return Math.min(amount * 0.008, 5);
    } else {
      // Card: 2.9% + 30¢
      return amount * 0.029 + 0.3;
    }
  };
  const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  console.log(STRIPE_PUBLISHABLE_KEY, "STRIPE_PUBLISHABLE_KEY");

  // --- ACH (Plaid/Stripe US Bank Account) helpers ---
  const ensureStripeJsLoaded = () => {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }
      const existing = document.querySelector(
        'script[src="https://js.stripe.com/v3/"]'
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Stripe.js"))
        );
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Stripe.js"));
      document.body.appendChild(script);
    });
  };

  const processAchPayment = async ({
    amount,
    authToken,
    customerEmail,
    customerName,
    beneficiaryUserId,
    payerUserId,
    tripId,
    baseAmount,
    paymentType,
  }) => {
    try {
      await ensureStripeJsLoaded();
      console.log(STRIPE_PUBLISHABLE_KEY, "STRIPE_PUBLISHABLE_KEY");
      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      console.log(
        stripe,
        "stripe",
        STRIPE_PUBLISHABLE_KEY,
        "STRIPE_PUBLISHABLE_KEY"
      );

      // Create a PaymentIntent on the server sized to cents
      const createPiResponse = await fetch(
        `${BASE_URL}/payment/add-payment-intent`,
        {
          method: "POST",
          headers: authToken
            ? {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              }
            : {"Content-Type": "application/json"},
          body: JSON.stringify({
            // server expects amount in cents (controller uses Math.round(amount))
            amount: Math.round((amount || 0) * 100),
            userId: beneficiaryUserId,
            paidBy: payerUserId,
            tripId: tripId,
            baseAmount: baseAmount,
            paymentType: paymentType,
          }),
        }
      );

      if (!createPiResponse.ok) {
        throw new Error(`Server error: ${createPiResponse.status}`);
      }

      const {clientSecret} = await createPiResponse.json();

      const {paymentIntent, error: collectError} =
        await stripe.collectBankAccountForPayment({
          clientSecret,
          params: {
            payment_method_type: "us_bank_account",
            payment_method_data: {
              billing_details: {
                name: customerName || "Customer",
                email: customerEmail || "customer@example.com",
              },
            },
          },
        });

      if (collectError) {
        throw new Error(collectError.message);
      }

      if (paymentIntent?.status === "requires_confirmation") {
        const {error: confirmError} = await stripe.confirmUsBankAccountPayment(
          clientSecret
        );
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      toast.success(
        "ACH payment initiated successfully. Check your email for confirmation."
      );
      navigate("/dashboard");
    } catch (e) {
      console.error("ACH payment error", e);
      toast.error(e?.message || "Failed to process ACH payment");
      throw e;
    }
  };

  const calculateOneTimePaymentBreakdown = () => {
    const amount = Number.parseFloat(oneTimeAmount) || 0;
    const stripeFee = calculateStripeFee(amount, paymentMethod?.type || "card");
    const kasamaFee = 1.0; // Flat fee for Kasama platform
    const totalCharge = amount + stripeFee + kasamaFee;

    return {
      amount,
      stripeFee,
      kasamaFee,
      totalCharge,
    };
  };

  // inside your component
  const friendBreakdown = useMemo(() => {
    const amount = Number.parseFloat(friendPaymentAmount);
    if (!friendPaymentAmount || isNaN(amount) || amount <= 0) {
      return {amount: 0, stripeFee: 0, totalCharge: 0};
    }

    const platformFee = 1.0;
    const stripeFee = calculateStripeFee(amount, paymentMethod?.type || "card");
    const totalCharge = amount + platformFee + stripeFee;

    return {amount, stripeFee, totalCharge};
  }, [friendPaymentAmount, paymentMethod?.type]);

  const {data: tripData, isLoading: isLoadingTripData} = useQuery({
    queryKey: ["getTripService", tripId],
    queryFn: () => getTripService(tripId),
  });

  const calculateAutoPayAmount = (remaining, frequency) => {
    if (!remaining || remaining <= 0) return 0;

    // Define number of installments per frequency
    const installments =
      frequency === "weekly"
        ? 4 // e.g., next 4 weeks
        : frequency === "biweekly"
        ? 2 // next 2 biweekly periods
        : 1; // monthly -> 1 installment

    return Number.parseFloat((remaining / installments).toFixed(2));
  };

  const trip = tripData?.data?.activeTrip;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  console.log("paymentDetailData", paymentDetailData);

  const noExpensesAdded =
    paymentDetailData?.amountPaid === 0 &&
    paymentDetailData?.overpaid === 0 &&
    paymentDetailData?.remainings === 0 &&
    paymentDetailData?.your_goal === 0;

  console.log("noExpensesAdded", noExpensesAdded);

  return (
    <>
      {!isInvited ? (
        <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
              You are not added to this Trip
            </h2>
            <p className="mt-3 text-gray-600">
              Please request participation from the trip organizer.
            </p>
            <button
              onClick={handleRequest}
              disabled={isPending}
              className={`mt-6 px-6 py-2 rounded-xl transition text-white ${
                isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {requestText}
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back to Dashboard Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    createPageUrl(
                      hasAdminAcess ? "Dashboard" : "participantDashboard"
                    )
                  )
                }
                className="bg-white/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/60">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Payments
                  </h1>
                  <p className="text-slate-600">
                    Manage your contributions for {trip?.destination}
                  </p>
                </div>
              </div>

              {/* Payment Summary */}
              {paymentDetailData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-500">Your Goal</p>
                      <p className="text-2xl font-bold text-slate-800">
                        ${paymentDetailData?.your_goal?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Amount Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${paymentDetailData?.amountPaid?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Remaining</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${paymentDetailData?.remainings?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!noExpensesAdded && (
              <>
                {paymentDetailData?.remainings <= 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                        Payment Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <h3 className="text-2xl font-semibold text-slate-700 mb-2">
                        You've fully contributed to this trip!
                      </h3>
                      <p className="text-slate-600">
                        Your balance for this trip is $0.00. You're all set!
                      </p>
                    </CardContent>
                  </Card>
                )}
                {paymentDetailData?.remainings > 0 && (
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Manage Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {paymentDetailData?.remainings <= 0 ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                          <Check className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-700">
                              Payment Complete
                            </p>
                            <p className="text-sm text-green-600">
                              You have fully paid your share for this trip.
                            </p>
                          </div>
                        </div>
                      ) : !paymentMethod ? (
                        <div className="space-y-6">
                          <p className="text-slate-600">
                            Add a secure payment method for this trip
                          </p>
                          <Dialog
                            open={showPaymentModal}
                            onOpenChange={setShowPaymentModal}
                          >
                            <DialogTrigger asChild>
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Payment Method
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Add Payment Method</DialogTitle>
                                <DialogDescription>
                                  Choose a secure way to pay for this trip
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Credit/Debit Card */}
                                <div
                                  className={`p-4 border-2 rounded-xl cursor-pointer ${
                                    methodType === "card"
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-blue-300"
                                  }`}
                                  onClick={() => setMethodType("card")}
                                >
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-slate-600" />
                                    <div>
                                      <h4 className="font-semibold">
                                        Credit/Debit Card
                                      </h4>
                                      <p className="text-sm text-slate-500">
                                        2.9% + 30¢ per transaction
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* ACH Bank Transfer */}
                                <div
                                  className={`p-4 border-2 rounded-xl cursor-pointer ${
                                    methodType === "ach"
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-gray-200 hover:border-blue-300"
                                  }`}
                                  onClick={() => setMethodType("ach")}
                                >
                                  <div className="flex items-center gap-3">
                                    <Banknote className="w-5 h-5 text-slate-600" />
                                    <div>
                                      <h4 className="font-semibold">
                                        Bank Transfer (ACH)
                                      </h4>
                                      <p className="text-sm text-slate-500">
                                        0.8% fee (capped at $5)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowPaymentModal(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleAddPaymentMethod}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Add{" "}
                                  {methodType === "ach"
                                    ? "Bank Account"
                                    : "Card"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium">
                                  {paymentMethod.brand}
                                  {paymentMethod.type !== "ach" && (
                                    <> **** {paymentMethod.last4}</>
                                  )}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {paymentMethod.type === "ach"
                                    ? "Bank Account"
                                    : "Credit/Debit Card"}
                                </p>
                              </div>
                            </div>

                            <Dialog
                              open={showPaymentModal}
                              onOpenChange={setShowPaymentModal}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (paymentMethod?.type) {
                                      setMethodType(paymentMethod.type);
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-700 bg-transparent"
                                >
                                  Change
                                </Button>
                              </DialogTrigger>

                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>
                                    Change Payment Method
                                  </DialogTitle>
                                  <DialogDescription>
                                    Choose a different payment method for this
                                    trip
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  {/* Credit/Debit Card */}
                                  <div
                                    className={`p-4 border-2 rounded-xl cursor-pointer ${
                                      methodType === "card"
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300"
                                    }`}
                                    onClick={() => setMethodType("card")}
                                  >
                                    <div className="flex items-center gap-3">
                                      <CreditCard className="w-5 h-5 text-slate-600" />
                                      <div>
                                        <h4 className="font-semibold">
                                          Credit/Debit Card
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                          2.9% + 30¢ per transaction
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* ACH Bank Transfer */}
                                  <div
                                    className={`p-4 border-2 rounded-xl cursor-pointer ${
                                      methodType === "ach"
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300"
                                    }`}
                                    onClick={() => setMethodType("ach")}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Banknote className="w-5 h-5 text-slate-600" />
                                      <div>
                                        <h4 className="font-semibold">
                                          Bank Transfer (ACH)
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                          0.8% fee (capped at $5)
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowPaymentModal(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleAddPaymentMethod}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Update to{" "}
                                    {methodType === "ach"
                                      ? "Bank Account"
                                      : "Card"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. One-Time Payment */}
                {paymentMethod &&
                  paymentDetailData &&
                  paymentDetailData.remainings > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          Make a One-Time Payment
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label>Amount to Pay</Label>
                            <div className="relative mt-2">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={oneTimeAmount}
                                onChange={(e) => {
                                  const val = Number.parseFloat(e.target.value);
                                  if (isNaN(val) || val < 0) {
                                    setOneTimeAmount("");
                                    return;
                                  }
                                  setOneTimeAmount(val.toString());
                                }}
                                className="pl-10"
                              />
                            </div>

                            {/* Error message */}
                            {oneTimeAmount &&
                              (Number.parseFloat(oneTimeAmount) <= 0 ||
                                Number.parseFloat(oneTimeAmount) >
                                  paymentDetailData.remainings) && (
                                <p className="text-xs text-red-500 mt-1">
                                  {Number.parseFloat(oneTimeAmount) <= 0
                                    ? "Please enter a valid positive amount."
                                    : "Amount cannot exceed remaining balance."}
                                </p>
                              )}

                            <p className="text-xs text-slate-500 mt-1">
                              Maximum: $
                              {paymentDetailData.remainings.toFixed(2)}
                            </p>
                          </div>

                          {oneTimeAmount &&
                            Number.parseFloat(oneTimeAmount) > 0 && (
                              <div className="bg-slate-50 rounded-xl p-4">
                                <h4 className="font-semibold text-slate-800 mb-3">
                                  Payment Breakdown
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Payment Amount:</span>
                                    <span>
                                      $
                                      {Number.parseFloat(oneTimeAmount).toFixed(
                                        2
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Kasama Platform Fee:</span>
                                    <span>$1.00</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Estimated Stripe Fee:</span>
                                    <span>
                                      $
                                      {calculateOneTimePaymentBreakdown().stripeFee.toFixed(
                                        2
                                      )}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    (
                                    {paymentMethod.type === "ach"
                                      ? "0.8% (capped at $5)"
                                      : "2.9% + 30¢"}{" "}
                                    for{" "}
                                    {paymentMethod.type === "ach"
                                      ? "ACH"
                                      : "card"}
                                    )
                                  </div>
                                  <hr className="my-2" />
                                  <div className="flex justify-between font-bold text-green-600">
                                    <span>Total You'll Be Charged Today:</span>
                                    <span>
                                      $
                                      {calculateOneTimePaymentBreakdown().totalCharge.toFixed(
                                        2
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>

                        <Button
                          onClick={handleOneTimePayment}
                          disabled={
                            !oneTimeAmount ||
                            Number.parseFloat(oneTimeAmount) <= 0 ||
                            Number.parseFloat(oneTimeAmount) >
                              paymentDetailData.remainings ||
                            processingOneTimePayment
                          }
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processingOneTimePayment && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          )}
                          Pay $
                          {oneTimeAmount &&
                          Number.parseFloat(oneTimeAmount) > 0 &&
                          Number.parseFloat(oneTimeAmount) <=
                            paymentDetailData.remainings
                            ? calculateOneTimePaymentBreakdown().totalCharge.toFixed(
                                2
                              )
                            : "0.00"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
              </>
            )}

            {/* 3. Auto-Pay Setup - Enhanced with recurring day selection */}
            {paymentMethod &&
              paymentDetailData &&
              paymentDetailData.remainings > 0 && (
                <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Enable Auto-Pay
                      </h3>
                      <p className="text-sm text-slate-600">
                        Set up automatic recurring payments until your balance
                        is paid.
                      </p>
                    </div>
                    <Switch
                      checked={autoPayEnabled}
                      onCheckedChange={handleAutoPayToggle}
                    />
                  </div>

                  {autoPayEnabled && (
                    <div className="space-y-4">
                      {/* Frequency Select */}
                      <div>
                        <Label>Payment Frequency</Label>
                        <Select
                          value={paymentFrequency}
                          onValueChange={handleFrequencyChange}
                        >
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Recurring Day */}
                      {paymentFrequency && (
                        <div>
                          <Label>Recurring Day</Label>
                          <Select
                            value={recurringPaymentDay}
                            onValueChange={handleRecurringDayChange}
                          >
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue placeholder="Choose a day" />
                            </SelectTrigger>
                            <SelectContent>
                              {[...Array(28).keys()].map((d) => (
                                <SelectItem
                                  key={d + 1}
                                  value={(d + 1).toString()}
                                >
                                  Day {d + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Auto-Pay Amount */}
                      {autoPayAmount > 0 && (
                        <div className="bg-white rounded-xl p-4 border text-sm">
                          <p className="text-slate-600">
                            Each payment will be:{" "}
                            <span className="font-bold text-green-600">
                              ${autoPayAmount.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-slate-500 mt-1">
                            Based on your remaining balance of $
                            {paymentDetailData.remainings.toFixed(2)}.
                          </p>
                        </div>
                      )}

                      {/* Save Button */}
                      <Button
                        onClick={handleSaveAutoPay}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Save Auto-Pay Settings
                      </Button>
                    </div>
                  )}
                </div>
              )}

            {/* 4. Pay for a Friend - Enhanced with real-time data and cost breakdown */}
            {tripParticipantsNumber > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Pay for a Friend
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Participant</Label>
                    <Select
                      value={selectedFriend}
                      onValueChange={(val) => setSelectedFriend(val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a friend" />
                      </SelectTrigger>
                      <SelectContent>
                        {totalParticipant &&
                        totalParticipant.filter((p) => p.userId !== authUerId)
                          .length > 0 ? (
                          totalParticipant
                            .filter((p) => p.userId !== authUerId)
                            .map((p) => {
                              const isFullyPaid =
                                (p.paymentInfo?.remainings ?? 0) <= 0; // ✅ use remainings
                              return (
                                <SelectItem
                                  key={p.id}
                                  value={p.userId}
                                  disabled={isFullyPaid} // ✅ disable fully paid
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span>{p.user?.name}</span>
                                    <span className="text-xs text-slate-500 ml-4">
                                      Paid: $
                                      {p.paymentInfo?.amountPaid?.toFixed(2) ||
                                        0}{" "}
                                      / ${p.paymentInfo?.your_goal?.toFixed(2)}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })
                        ) : (
                          <div className="text-slate-500 text-sm px-2 py-1">
                            No participants found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFriendContribution && (
                    <div className="mt-3 text-sm text-slate-600">
                      <p>
                        <strong>Paid:</strong> $
                        {selectedFriendContribution.paymentInfo?.amountPaid?.toFixed(
                          2
                        ) || 0}
                      </p>
                      <p>
                        <strong>Goal:</strong> $
                        {selectedFriendContribution.paymentInfo?.your_goal?.toFixed(
                          2
                        )}
                      </p>
                      <p>
                        <strong>Remaining:</strong> $
                        {selectedFriendContribution.paymentInfo?.remainings?.toFixed(
                          2
                        )}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label>Amount to Pay</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        min="0"
                        max={
                          selectedFriendContribution?.paymentInfo?.remainings ||
                          0
                        } // ✅ block overpayment
                        placeholder="0.00"
                        value={friendPaymentAmount}
                        onChange={(e) => setFriendPaymentAmount(e.target.value)}
                        className="pl-10"
                        disabled={
                          !selectedFriend ||
                          (selectedFriendContribution?.paymentInfo
                            ?.remainings || 0) <= 0 // ✅ disable if fully paid
                        }
                      />
                    </div>
                    {selectedFriend && (
                      <p className="text-xs text-slate-500 mt-1">
                        Maximum: $
                        {selectedFriendContribution?.paymentInfo?.remainings?.toFixed(
                          2
                        )}
                      </p>
                    )}
                  </div>

                  {friendPaymentAmount &&
                    Number.parseFloat(friendPaymentAmount) > 0 &&
                    selectedFriendContribution && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h4 className="font-semibold text-slate-800 mb-3">
                          Payment Breakdown
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Contribution Amount:</span>
                            <span>${friendBreakdown.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Kasama Platform Fee:</span>
                            <span>$1.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estimated Stripe Fee:</span>
                            <span>${friendBreakdown.stripeFee.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {paymentMethod?.type === "ach"
                              ? "0.8% (capped at $5) for ACH"
                              : "2.9% + 30¢ for card"}
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between font-bold text-purple-600">
                            <span>Total You'll Be Charged:</span>
                            <span>
                              ${friendBreakdown.totalCharge.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  <Button
                    onClick={handlePayForFriend}
                    disabled={
                      !selectedFriend ||
                      !friendPaymentAmount ||
                      Number.parseFloat(friendPaymentAmount) <= 0 ||
                      (selectedFriendContribution?.paymentInfo?.remainings ||
                        0) <= 0 || // ✅ use remainings
                      Number.parseFloat(friendPaymentAmount) >
                        (selectedFriendContribution?.paymentInfo?.remainings ||
                          0) ||
                      processingFriendPayment
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {processingFriendPayment && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    Pay ${friendBreakdown?.totalCharge.toFixed(2)} for{" "}
                    {selectedFriendContribution?.user?.name}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Compliance Note */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-800">
                    Security & Compliance
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    All payment data is processed securely through Stripe.
                    Kasama never stores your card numbers, bank details, or
                    other sensitive information. Your payment preferences are
                    stored locally on your device only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
