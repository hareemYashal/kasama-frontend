import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trip } from "@/api/entities";
import { User } from "@/api/entities";
import { Contribution } from "@/api/entities";
import { TripActivity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Download,
  Banknote,
  Shield,
  Check,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPaymentRemainingsService } from "@/services/paynent";
import { setToken } from "@/store/userSlice";
import { useSelector } from "react-redux";
import {
  participantStatusUpdateService,
  participantTripCheck,
  totalParticipantsService,
} from "@/services/participant";

export default function Payments() {
  const authToken = useSelector((state) => state.user.token);
  const authUser = useSelector((state) => state.user.user);
  const authTripId = useSelector((state) => state.trips.activeTripId);
  const authUerId = authUser?.id;

  const tripId = useSelector((state) => state.trips.activeTripId);
  const token = useSelector((state) => state.user.token);

  const { data: participantsData } = useQuery({
    queryKey: ["totalParticipantsService"],
    queryFn: () => totalParticipantsService(token, tripId),
    enabled: !!token && !!tripId,
  });
  let totalParticipant = participantsData?.data?.participants;
  let tripParticipantsNumber =
    participantsData?.data?.participants?.length || 0;
  console.log(totalParticipant, "totalParticipant");
  console.log(tripParticipantsNumber, "tripParticipantsNumber");

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

  const [processingOneTimePayment, setProcessingOneTimePayment] =
    useState(false);
  const { data: paymentData, isSuccess: isPaymentDataSuccess } = useQuery({
    queryKey: ["getPaymentRemainingsQuery", authTripId, authUerId],
    queryFn: () =>
      getPaymentRemainingsService(authToken, authTripId, authUerId),
    enabled: !!authToken && !!authTripId && !!authUerId,
  });
  console.log("paymentData", paymentData);

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

  const { data: isInvitedData, isSuccess: invitedSuccess } = useQuery({
    queryKey: ["participantTripCheckQuery", authToken, authUerId, authTripId],
    queryFn: () => participantTripCheck(authToken, authUerId, authTripId),
    enabled: !!authToken && !!authTripId && !!authUerId,
  });

  useEffect(() => {
    if (invitedSuccess) {
      setIsInvited(!!isInvitedData?.invitation);
    }
  }, [invitedSuccess, isInvitedData]);

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: ({ authToken, authUerId, authTripId, status }) =>
      participantStatusUpdateService(authToken, authUerId, authTripId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getAllRegisteredUsers"],
      });
      setRequestText("Wait for Approval");
    },
  });

  const handleRequest = () => {
    let status = "REQUESTED";
    updateMutation({ authToken, authUerId, authTripId, status });
  };

  // -----------------------------

  useEffect(() => {
    const fetchPaymentRemainings = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:4000/payment/getPaymentRemainings?tripId=${authTripId}&userId=${authUerId}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const result = await response.json();

        if (result.success) {
          console.log("fetchPaymentRemainings", result.data);

          // 🔑 set both paymentInfo + contribution from API
          setPaymentInfo(result.data.data);
          setContribution((prev) => ({
            ...(prev || {}), // keep goal_amount, amount_paid if already set
            amount_remaining: result.data.data.remainings, // adjust if API shape differs
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

    const { amount, totalCharge } = calculateOneTimePaymentBreakdown();

    // Debug logs
    console.log("=== DEBUG ONE TIME PAYMENT ===");
    console.log("Raw oneTimeAmount (string):", oneTimeAmount);
    console.log("Parsed oneTimeAmount (number):", parseFloat(oneTimeAmount));
    console.log("Breakdown.amount (base):", amount);
    console.log("Breakdown.totalCharge:", totalCharge);
    console.log("Remaining balance:", contribution.amount_remaining);

    // Safe parse
    const parsedAmount = parseFloat(oneTimeAmount);

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
      const response = await fetch(
        "http://127.0.0.1:4000/payment/create-checkout-session",
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
          }),
        }
      );

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating one-time payment session:", error);
      alert("Something went wrong while starting payment");
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

    const { totalCharge } = friendBreakdown;

    setProcessingFriendPayment(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:4000/payment/create-checkout-session",
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
            baseAmount: parseFloat(friendPaymentAmount), // original amount
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
    } catch (err) {
      console.error("Error creating friend payment session:", err);
      alert("Something went wrong while starting payment");
    }

    setProcessingFriendPayment(false);
  };

  const handleAddPaymentMethod = () => {
    const defaultCard = {
      brand: "Visa",
      last4: "4242",
      type: "card",
    };
    setPaymentMethod(defaultCard);
    setShowPaymentModal(false);
    localStorage.setItem(
      `kasama_payment_method_${authTripId}`,
      JSON.stringify(defaultCard)
    );
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
  const calculateOneTimePaymentBreakdown = () => {
    const amount = parseFloat(oneTimeAmount) || 0;
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
    const amount = parseFloat(friendPaymentAmount);
    if (!friendPaymentAmount || isNaN(amount) || amount <= 0) {
      return { amount: 0, stripeFee: 0, totalCharge: 0 };
    }

    const platformFee = 1.0;
    const stripeFee = 0.029 * amount + 0.3;
    const totalCharge = amount + platformFee + stripeFee;

    return { amount, stripeFee, totalCharge };
  }, [friendPaymentAmount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  console.log("paymentDetailData", paymentDetailData);
  // const isAdmin = user?.trip_role === "admin";
  // const autoPayAmount = calculateAutoPayAmount();
  // const withdrawalBreakdown = calculateWithdrawalBreakdown();
  // const friendBreakdown = calculateFriendPaymentBreakdown();

  // const token = useSelector((state) => state.user.token);
  // const tripId = useSelector((state) => state.trips.activeTripId);
  // const userData = useSelector((state) => state.user.user);
  // let userId = userData?.id;
  return (
    <>
      {!isInvited ? (
        <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
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
                onClick={() => navigate(createPageUrl("Dashboard"))}
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
                    Manage your contributions for
                    {/* {trip?.destination} */}
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
                        ${paymentDetailData?.your_goal}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Amount Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${paymentDetailData?.amountPaid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Remaining</p>
                      <p className="text-2xl font-bold text-coral-600">
                        ${paymentDetailData?.remainings}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Manage Payment Method */}
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
                            Add a secure credit/debit card for this trip
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div
                            className="p-4 border-2 rounded-xl cursor-pointer border-blue-500 bg-blue-50"
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
                            Add Card
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
                            {paymentMethod.brand} **** {paymentMethod.last4}
                          </p>
                          <p className="text-sm text-slate-500">
                            {paymentMethod.type === "ach"
                              ? "Bank Account"
                              : "Credit/Debit Card"}
                          </p>
                        </div>
                      </div>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem(
                            `kasama_payment_method_${trip.id}`
                          );
                          setPaymentMethod(null);
                        }}
                      >
                        Change
                      </Button> */}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                              const val = parseFloat(e.target.value);
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
                          (parseFloat(oneTimeAmount) <= 0 ||
                            parseFloat(oneTimeAmount) >
                              paymentDetailData.remainings) && (
                            <p className="text-xs text-red-500 mt-1">
                              {parseFloat(oneTimeAmount) <= 0
                                ? "Please enter a valid positive amount."
                                : "Amount cannot exceed remaining balance."}
                            </p>
                          )}

                        <p className="text-xs text-slate-500 mt-1">
                          Maximum: ${paymentDetailData.remainings.toFixed(2)}
                        </p>
                      </div>

                      {oneTimeAmount && parseFloat(oneTimeAmount) > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <h4 className="font-semibold text-slate-800 mb-3">
                            Payment Breakdown
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Payment Amount:</span>
                              <span>
                                ${parseFloat(oneTimeAmount).toFixed(2)}
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
                              {paymentMethod.type === "ach" ? "ACH" : "card"})
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
                        parseFloat(oneTimeAmount) <= 0 ||
                        parseFloat(oneTimeAmount) >
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
                      parseFloat(oneTimeAmount) > 0 &&
                      parseFloat(oneTimeAmount) <= paymentDetailData.remainings
                        ? calculateOneTimePaymentBreakdown().totalCharge.toFixed(
                            2
                          )
                        : "0.00"}
                    </Button>
                  </CardContent>
                </Card>
              )}

            {/* 3. Auto-Pay Setup - Enhanced with recurring day selection */}
            {/* {paymentMethod &&
              contribution &&
              contribution.amount_remaining > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        Auto-Pay Setup
                      </div>
                      <Switch
                        checked={autoPayEnabled}
                        onCheckedChange={handleAutoPayToggle}
                      />
                    </CardTitle>
                  </CardHeader>
                  {autoPayEnabled && (
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Payment Frequency</Label>
                          <Select
                            value={paymentFrequency}
                            onValueChange={handleFrequencyChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">
                                Every 2 Weeks
                              </SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Select recurring payment day</Label>
                          <Select
                            value={recurringPaymentDay}
                            onValueChange={handleRecurringDayChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">
                                Wednesday
                              </SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-slate-600">
                          ${autoPayAmount.toFixed(2)} every {paymentFrequency}{" "}
                          on {recurringPaymentDay}s until your goal is met
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Auto-charged to your {paymentMethod.brand} ****{" "}
                          {paymentMethod.last4}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )} */}

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
                        {totalParticipant
                          // ✅ Filter out logged-in user
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
                                    {p.paymentInfo?.amountPaid?.toFixed(2) || 0}{" "}
                                    / ${p.paymentInfo?.your_goal?.toFixed(2)}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
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
                        {selectedFriendContribution?.paymentInfo?.remainings?.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {friendPaymentAmount &&
                    parseFloat(friendPaymentAmount) > 0 &&
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
                            ("2.9% + 30¢" for card)
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
                      parseFloat(friendPaymentAmount) <= 0 ||
                      (selectedFriendContribution?.paymentInfo?.remainings ||
                        0) <= 0 || // ✅ use remainings
                      parseFloat(friendPaymentAmount) >
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
