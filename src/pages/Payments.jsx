import React, { useState, useEffect } from "react";
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

export default function Payments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [contribution, setContribution] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allContributions, setAllContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment method states (trip-scoped)
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [methodType, setMethodType] = useState("ach"); // Default to ACH (cheaper)
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auto-pay states (stored in localStorage per trip)
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [recurringPaymentDay, setRecurringPaymentDay] = useState("monday"); // New state

  // Pay for friend states - enhanced with real-time data
  const [selectedFriend, setSelectedFriend] = useState("");
  const [friendPaymentAmount, setFriendPaymentAmount] = useState("");
  const [processingFriendPayment, setProcessingFriendPayment] = useState(false);
  const [selectedFriendContribution, setSelectedFriendContribution] =
    useState(null);

  // One-time payment states
  const [oneTimeAmount, setOneTimeAmount] = useState("");
  const [processingOneTimePayment, setProcessingOneTimePayment] =
    useState(false);

  // Withdrawal states
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("standard"); // 'standard' or 'instant'
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [fundsWithdrawn, setFundsWithdrawn] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    if (trip?.id) {
      loadTripScopedPreferences();
    }
  }, [trip]);

  // Enhanced useEffect to handle friend selection with real-time data
  useEffect(() => {
    if (selectedFriend) {
      const friendContrib = allContributions.find(
        (c) => c.user_id === selectedFriend
      );
      setSelectedFriendContribution(friendContrib);
      // Pre-fill with their remaining amount if exists and greater than 0
      if (friendContrib && friendContrib.amount_remaining > 0) {
        setFriendPaymentAmount(friendContrib.amount_remaining.toFixed(2));
      } else {
        setFriendPaymentAmount("0.00"); // Or empty string, depending on desired UX
      }
    } else {
      setSelectedFriendContribution(null);
      setFriendPaymentAmount("");
    }
  }, [selectedFriend, allContributions]); // Depend on allContributions to update if data changes

  // const loadPaymentData = async () => {
  //   try {
  //     const currentUser = await User.me();
  //     setUser(currentUser);

  //     if (!currentUser.current_trip_id) {
  //       navigate(createPageUrl("Home"));
  //       return;
  //     }

  //     const currentTrip = await Trip.get(currentUser.current_trip_id);
  //     setTrip(currentTrip);

  //     // Load user's contribution
  //     const userContributions = await Contribution.filter({
  //       trip_id: currentTrip.id,
  //       user_id: currentUser.id
  //     });

  //     if (userContributions.length > 0) {
  //       setContribution(userContributions[0]);
  //     }

  //     // Load all participants for "pay for friend" feature
  //     const allParticipants = await User.filter({ current_trip_id: currentTrip.id });
  //     setParticipants(allParticipants.filter(p => p.id !== currentUser.id));

  //     // Load all contributions for withdrawal calculations and friend payment details
  //     const tripContributions = await Contribution.filter({ trip_id: currentTrip.id });
  //     setAllContributions(tripContributions);

  //     // Check if funds have been withdrawn (mock state for now)
  //     const withdrawalStatus = localStorage.getItem(`kasama_funds_withdrawn_${currentTrip.id}`);
  //     setFundsWithdrawn(withdrawalStatus === 'true');

  //     // Load mock payment method (for development)
  //     loadMockPaymentMethod(currentTrip.id);

  //   } catch (error) {
  //     console.error("Error loading payment data:", error);
  //     navigate(createPageUrl("Home"));
  //   }
  //   setLoading(false);
  // };
  const loadPaymentData = async () => {
    try {
      // DUMMY LOGIC START
      const isDev = process.env.NODE_ENV === "development";

      const mockUser = {
        id: "user_123",
        full_name: "Alice Smith",
        current_trip_id: "trip_456",
        trip_role: "admin",
      };

      const mockTrip = {
        id: "trip_456",
        name: "Mock Island Getaway",
      };

      const mockContribution = {
        id: "contrib_1",
        trip_id: "trip_456",
        user_id: "user_123",
        goal_amount: 500,
        amount_paid: 150,
        amount_remaining: 350,
      };

      const mockParticipants = [
        { id: "user_234", full_name: "Bob Jones" },
        { id: "user_345", full_name: "Clara Wu" },
      ];

      const mockAllContributions = [
        mockContribution,
        {
          id: "contrib_2",
          trip_id: "trip_456",
          user_id: "user_234",
          goal_amount: 500,
          amount_paid: 300,
          amount_remaining: 200,
        },
        {
          id: "contrib_3",
          trip_id: "trip_456",
          user_id: "user_345",
          goal_amount: 500,
          amount_paid: 500,
          amount_remaining: 0,
        },
      ];

      if (isDev) {
        setUser(mockUser);
        setTrip(mockTrip);
        setContribution(mockContribution);
        setParticipants(mockParticipants);
        setAllContributions(mockAllContributions);
        setFundsWithdrawn(false);
        loadMockPaymentMethod(mockTrip.id);
        setLoading(false);
        return;
      }
      // DUMMY LOGIC END

      // REAL LOGIC (only runs if not in development)
      const currentUser = await User.me();
      setUser(currentUser);

      if (!currentUser.current_trip_id) {
        navigate(createPageUrl("Home"));
        return;
      }

      const currentTrip = await Trip.get(currentUser.current_trip_id);
      setTrip(currentTrip);

      const userContributions = await Contribution.filter({
        trip_id: currentTrip.id,
        user_id: currentUser.id,
      });

      if (userContributions.length > 0) {
        setContribution(userContributions[0]);
      }

      const allParticipants = await User.filter({
        current_trip_id: currentTrip.id,
      });
      setParticipants(allParticipants.filter((p) => p.id !== currentUser.id));

      const tripContributions = await Contribution.filter({
        trip_id: currentTrip.id,
      });
      setAllContributions(tripContributions);

      const withdrawalStatus = localStorage.getItem(
        `kasama_funds_withdrawn_${currentTrip.id}`
      );
      setFundsWithdrawn(withdrawalStatus === "true");

      loadMockPaymentMethod(currentTrip.id);
    } catch (error) {
      console.error("Error loading payment data:", error);
      navigate(createPageUrl("Home"));
    }

    setLoading(false);
  };

  const loadMockPaymentMethod = (tripId) => {
    const savedMethod = localStorage.getItem(`kasama_payment_method_${tripId}`);
    if (savedMethod) {
      setPaymentMethod(JSON.parse(savedMethod));
    }
  };

  const loadTripScopedPreferences = () => {
    if (!trip?.id) return;

    const savedAutoPlay = localStorage.getItem(
      `kasama_autopay_enabled_${trip.id}`
    );
    const savedFrequency = localStorage.getItem(
      `kasama_payment_frequency_${trip.id}`
    );
    const savedRecurringDay = localStorage.getItem(
      `kasama_recurring_day_${trip.id}`
    ); // Load new state

    if (savedAutoPlay) setAutoPayEnabled(JSON.parse(savedAutoPlay));
    if (savedFrequency) setPaymentFrequency(savedFrequency);
    if (savedRecurringDay) setRecurringPaymentDay(savedRecurringDay); // Set new state
  };

  const saveTripScopedPreferences = (autopay, frequency, recurringDay) => {
    if (!trip?.id) return;

    localStorage.setItem(
      `kasama_autopay_enabled_${trip.id}`,
      JSON.stringify(autopay)
    );
    localStorage.setItem(`kasama_payment_frequency_${trip.id}`, frequency);
    localStorage.setItem(`kasama_recurring_day_${trip.id}`, recurringDay); // Save new state
  };

  const handleAddPaymentMethod = async () => {
    // Mock adding payment method (will be replaced with Stripe integration)
    const mockPaymentMethod = {
      id: `pm_mock_${Date.now()}`,
      type: methodType,
      last4: methodType === "ach" ? "4455" : "1234",
      brand: methodType === "ach" ? "Wells Fargo Checking" : "Visa",
      trip_id: trip.id,
    };

    // Save to localStorage (trip-scoped)
    localStorage.setItem(
      `kasama_payment_method_${trip.id}`,
      JSON.stringify(mockPaymentMethod)
    );
    setPaymentMethod(mockPaymentMethod);
    setShowPaymentModal(false);

    // Log activity
    const firstName = user.full_name.split(" ")[0];
    await TripActivity.create({
      trip_id: trip.id,
      user_id: user.id,
      user_first_name: firstName,
      action_type: "PAYMENT_METHOD_UPDATE",
      description: `${firstName} added a payment method.`,
      metadata: {}, // Added metadata field
    });
  };

  const handleAutoPayToggle = async (enabled) => {
    setAutoPayEnabled(enabled);
    saveTripScopedPreferences(enabled, paymentFrequency, recurringPaymentDay); // Pass new state

    // Log activity
    const firstName = user.full_name.split(" ")[0];
    await TripActivity.create({
      trip_id: trip.id,
      user_id: user.id,
      user_first_name: firstName,
      action_type: "PAYMENT_METHOD_UPDATE",
      description: enabled
        ? `${firstName} enabled auto-pay.`
        : `${firstName} disabled auto-pay.`,
      metadata: {}, // Added metadata field
    });
  };

  const handleFrequencyChange = (frequency) => {
    setPaymentFrequency(frequency);
    saveTripScopedPreferences(autoPayEnabled, frequency, recurringPaymentDay); // Pass new state
  };

  const handleRecurringDayChange = (day) => {
    // New function
    setRecurringPaymentDay(day);
    saveTripScopedPreferences(autoPayEnabled, paymentFrequency, day);
  };

  const calculateAutoPayAmount = () => {
    if (!contribution || contribution.amount_remaining <= 0) return 0;

    const remaining = contribution.amount_remaining;
    // Assuming trip duration is roughly 4 weeks for weekly, 2 payments for biweekly.
    // This is a simplification; in a real app, trip start/end dates would be used.
    switch (paymentFrequency) {
      case "weekly":
        return remaining / 4;
      case "biweekly":
        return remaining / 2;
      case "monthly":
        return remaining; // Pay off in one go if monthly
      default:
        return 0;
    }
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

  // Enhanced friend payment with cost breakdown
  const calculateFriendPaymentBreakdown = () => {
    const amount = parseFloat(friendPaymentAmount) || 0;
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

  const handlePayForFriend = async () => {
    if (
      !selectedFriend ||
      !friendPaymentAmount ||
      !paymentMethod ||
      !selectedFriendContribution
    ) {
      alert(
        "Please select a friend, enter an amount, and ensure you have a payment method added"
      );
      return;
    }

    const amount = parseFloat(friendPaymentAmount);
    if (amount <= 0 || amount > selectedFriendContribution.amount_remaining) {
      alert(
        `Please enter a valid amount not exceeding ${selectedFriendContribution.amount_remaining.toFixed(
          2
        )}`
      );
      return;
    }

    setProcessingFriendPayment(true);

    // Mock payment processing (will be replaced with Stripe)
    setTimeout(async () => {
      try {
        // Find friend's contribution
        // The selectedFriendContribution state is already holding the correct object
        // const friendContribution = allContributions.find(c => c.user_id === selectedFriend);

        // Update friend's contribution
        const newAmountPaid = selectedFriendContribution.amount_paid + amount;
        const newAmountRemaining = Math.max(
          0,
          selectedFriendContribution.goal_amount - newAmountPaid
        );

        await Contribution.update(selectedFriendContribution.id, {
          amount_paid: newAmountPaid,
          amount_remaining: newAmountRemaining,
        });

        // Log this transaction
        const payerFirstName = user.full_name.split(" ")[0];
        const recipient = participants.find((p) => p.id === selectedFriend);
        const recipientFirstName = recipient.full_name.split(" ")[0];
        await TripActivity.create({
          trip_id: trip.id,
          user_id: user.id,
          user_first_name: payerFirstName,
          action_type: "PAID_FOR_FRIEND",
          description: `${payerFirstName} paid $${amount.toFixed(
            2
          )} on behalf of ${recipientFirstName}.`,
          metadata: {
            amount: amount,
            recipient_id: selectedFriend,
            recipient_name: recipient.full_name,
          },
        });

        // Refresh data
        loadPaymentData();

        // Reset form
        setSelectedFriend("");
        setFriendPaymentAmount("");
        setSelectedFriendContribution(null); // Clear selected friend's contribution info
      } catch (error) {
        console.error("Error processing friend payment:", error);
      }
      setProcessingFriendPayment(false);
    }, 2000); // Mock 2-second processing time
  };

  const handleOneTimePayment = async () => {
    if (!oneTimeAmount || !paymentMethod || !contribution) {
      alert(
        "Please enter an amount and ensure you have a payment method added"
      );
      return;
    }

    const amount = parseFloat(oneTimeAmount);
    if (amount <= 0 || amount > contribution.amount_remaining) {
      alert("Please enter a valid amount not exceeding your remaining balance");
      return;
    }

    setProcessingOneTimePayment(true);

    // Mock payment processing (will be replaced with Stripe)
    setTimeout(async () => {
      try {
        const breakdown = calculateOneTimePaymentBreakdown();

        // Update user's contribution
        const newAmountPaid = contribution.amount_paid + amount;
        const newAmountRemaining = Math.max(
          0,
          contribution.goal_amount - newAmountPaid
        );

        await Contribution.update(contribution.id, {
          amount_paid: newAmountPaid,
          amount_remaining: newAmountRemaining,
        });

        // Log this transaction
        const firstName = user.full_name.split(" ")[0];
        await TripActivity.create({
          trip_id: trip.id,
          user_id: user.id,
          user_first_name: firstName,
          action_type: "MADE_PAYMENT",
          description: `${firstName} contributed $${amount.toFixed(
            2
          )} toward the trip.`,
          metadata: { amount },
        });

        // Log transaction (in real implementation, this would go to a Transaction entity)
        console.log("Transaction Log:", {
          user_id: user.id,
          trip_id: trip.id,
          payment_amount: amount,
          stripe_fee: breakdown.stripeFee,
          kasama_fee: breakdown.kasamaFee,
          total_charged: breakdown.totalCharge,
          payment_method: paymentMethod.type,
          timestamp: new Date().toISOString(),
          type: "one_time_payment",
        });

        // Refresh data and reset form
        loadPaymentData();
        setOneTimeAmount("");
      } catch (error) {
        console.error("Error processing one-time payment:", error);
      }
      setProcessingOneTimePayment(false);
    }, 2000); // Mock 2-second processing time
  };

  const calculateWithdrawalBreakdown = () => {
    const totalContributed = allContributions.reduce(
      (sum, c) => sum + c.amount_paid,
      0
    );
    // This is a simplification. Ideally, transaction fees would be stored per transaction.
    // For now, assuming an average fee for calculation purposes.
    const transactionCount = allContributions.length;

    // Mock Stripe processing fees (2.9% + 30¢ per card transaction, 0.8% per ACH)
    // Assuming mostly card payments for aggregate calculation
    const estimatedStripeFees =
      totalContributed * 0.029 + transactionCount * 0.3;

    // Kasama platform fee ($1 per contribution)
    const kasamaFee = transactionCount * 1.0;

    // Stripe payout fee
    const payoutFee =
      payoutMethod === "instant" ? Math.min(totalContributed * 0.01, 10) : 0.25;

    const netAmount =
      totalContributed - estimatedStripeFees - kasamaFee - payoutFee;

    return {
      totalContributed,
      stripeFees: estimatedStripeFees,
      kasamaFee,
      payoutFee,
      netAmount: Math.max(0, netAmount),
    };
  };

  const handleWithdrawFunds = async () => {
    if (user?.trip_role !== "admin" || fundsWithdrawn) return;

    setProcessingWithdrawal(true);

    // Mock withdrawal processing (will be replaced with Stripe Connect)
    setTimeout(async () => {
      // Mark funds as withdrawn
      localStorage.setItem(`kasama_funds_withdrawn_${trip.id}`, "true");
      setFundsWithdrawn(true);

      // Log withdrawal
      const firstName = user.full_name.split(" ")[0];
      const breakdown = calculateWithdrawalBreakdown();
      await TripActivity.create({
        trip_id: trip.id,
        user_id: user.id,
        user_first_name: firstName,
        action_type: "WITHDREW_FUNDS",
        description: `Admin withdrew $${breakdown.netAmount.toFixed(
          2
        )} from the trip fund.`,
        metadata: { amount: breakdown.netAmount },
      });

      setShowWithdrawalModal(false);
      setProcessingWithdrawal(false);
    }, 3000); // Mock 3-second processing time
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user?.trip_role === "admin";
  const autoPayAmount = calculateAutoPayAmount();
  const withdrawalBreakdown = calculateWithdrawalBreakdown();
  const friendBreakdown = calculateFriendPaymentBreakdown();

  return (
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
              <h1 className="text-3xl font-bold text-slate-800">Payments</h1>
              <p className="text-slate-600">
                Manage your contributions for {trip.destination}
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          {contribution && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-500">Your Goal</p>
                  <p className="text-2xl font-bold text-slate-800">
                    ${contribution.goal_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${contribution.amount_paid.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Remaining</p>
                  <p className="text-2xl font-bold text-coral-600">
                    ${contribution.amount_remaining.toFixed(2)}
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
            {!paymentMethod ? (
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
                        Choose your preferred payment method for this trip
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            methodType === "ach"
                              ? "border-green-500 bg-green-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => setMethodType("ach")}
                        >
                          <div className="flex items-center gap-3">
                            <Banknote className="w-5 h-5 text-slate-600" />
                            <div>
                              <h4 className="font-semibold">
                                Bank (ACH) - Recommended
                              </h4>
                              <p className="text-sm text-slate-500">
                                0.8% fee, capped at $5
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-green-700 mt-2 font-medium">
                            💡 Save money on fees — pay with your bank account
                          </p>
                        </div>

                        <div
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            methodType === "card"
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300"
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
                        Add {methodType === "ach" ? "Bank Account" : "Card"}
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
                  <Button
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
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. One-Time Payment */}
        {paymentMethod && contribution && contribution.amount_remaining > 0 && (
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
                      max={contribution.amount_remaining}
                      placeholder="0.00"
                      value={oneTimeAmount}
                      onChange={(e) => setOneTimeAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum: ${contribution.amount_remaining.toFixed(2)}
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
                        <span>${parseFloat(oneTimeAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kasama Platform Fee:</span>
                        <span>$1.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Stripe Fee:</span>
                        <span>{`$${calculateOneTimePaymentBreakdown().stripeFee.toFixed(
                          2
                        )}`}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        (
                        {paymentMethod.type === "ach"
                          ? "0.8% (capped at $5)"
                          : "2.9% + 30¢"}{" "}
                        for {paymentMethod.type === "ach" ? "ACH" : "card"})
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-green-600">
                        <span>Total You'll Be Charged Today:</span>
                        <span>{`$${calculateOneTimePaymentBreakdown().totalCharge.toFixed(
                          2
                        )}`}</span>
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
                  processingOneTimePayment
                }
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {processingOneTimePayment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                Pay ${oneTimeAmount || "0.00"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 3. Auto-Pay Setup - Enhanced with recurring day selection */}
        {paymentMethod && contribution && contribution.amount_remaining > 0 && (
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
                        <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
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
                        <SelectItem value="wednesday">Wednesday</SelectItem>
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
                    ${autoPayAmount.toFixed(2)} every {paymentFrequency} on{" "}
                    {recurringPaymentDay}s until your goal is met
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-charged to your {paymentMethod.brand} ****{" "}
                    {paymentMethod.last4}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* 4. Pay for a Friend - Enhanced with real-time data and cost breakdown */}
        {paymentMethod && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Pay for a Friend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants.length > 0 ? (
                <>
                  <div>
                    <Label>Select Participant</Label>
                    <Select
                      value={selectedFriend}
                      onValueChange={setSelectedFriend}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a friend" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map((participant) => {
                          const participantContrib = allContributions.find(
                            (c) => c.user_id === participant.id
                          );
                          return (
                            <SelectItem
                              key={participant.id}
                              value={participant.id}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span>{participant.full_name}</span>
                                <span className="text-xs text-slate-500 ml-4">
                                  Owes: $
                                  {participantContrib?.amount_remaining?.toFixed(
                                    2
                                  ) || "0.00"}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFriendContribution && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        {
                          participants.find((p) => p.id === selectedFriend)
                            ?.full_name
                        }
                        's Contribution Status
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Goal Amount:</span>
                          <p className="font-semibold">
                            ${selectedFriendContribution.goal_amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Amount Paid:</span>
                          <p className="font-semibold text-green-600">
                            ${selectedFriendContribution.amount_paid.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">
                            Amount Remaining:
                          </span>
                          <p className="font-semibold text-coral-600">
                            $
                            {selectedFriendContribution.amount_remaining.toFixed(
                              2
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Percent Paid:</span>
                          <p className="font-semibold">
                            {(
                              (selectedFriendContribution.amount_paid /
                                selectedFriendContribution.goal_amount) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label>Amount to Pay</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={selectedFriendContribution?.amount_remaining || 0}
                        placeholder="0.00"
                        value={friendPaymentAmount}
                        onChange={(e) => setFriendPaymentAmount(e.target.value)}
                        className="pl-10"
                        disabled={!selectedFriend}
                      />
                    </div>
                    {selectedFriend && (
                      <p className="text-xs text-slate-500 mt-1">
                        Maximum: $
                        {selectedFriendContribution?.amount_remaining?.toFixed(
                          2
                        ) || "0.00"}
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
                            <span>Stripe Processing Fee:</span>
                            <span>${friendBreakdown.stripeFee.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            (
                            {paymentMethod.type === "ach"
                              ? "0.8% (capped at $5)"
                              : "2.9% + 30¢"}{" "}
                            for {paymentMethod.type === "ach" ? "ACH" : "card"})
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
                      processingFriendPayment
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {processingFriendPayment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    Pay ${friendPaymentAmount || "0.00"} for{" "}
                    {selectedFriend &&
                      participants.find((p) => p.id === selectedFriend)
                        ?.full_name}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    There are no other participants to pay for yet.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Invite friends to the trip to use this feature.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 5. Withdraw Funds (Admin Only) */}
        {isAdmin && (
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Withdraw Funds
                <Badge className="bg-coral-100 text-coral-800">
                  Admin Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500">Total Collected</p>
                  <p className="text-xl font-bold text-green-600">
                    ${withdrawalBreakdown.totalContributed.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500">Stripe Fees</p>
                  <p className="text-lg font-semibold text-slate-600">
                    ${withdrawalBreakdown.stripeFees.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500">Kasama Fee</p>
                  <p className="text-lg font-semibold text-slate-600">
                    ${withdrawalBreakdown.kasamaFee.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500">Available</p>
                  <p className="text-xl font-bold text-green-600">
                    ${withdrawalBreakdown.netAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {!fundsWithdrawn ? (
                <Dialog
                  open={showWithdrawalModal}
                  onOpenChange={setShowWithdrawalModal}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={withdrawalBreakdown.netAmount <= 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Confirm Withdrawal</DialogTitle>
                      <DialogDescription>
                        Choose your payout method and review the final amount
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Payout Method</Label>
                        <Select
                          value={payoutMethod}
                          onValueChange={setPayoutMethod}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              Standard ACH (2-3 days) - $0.25 fee
                            </SelectItem>
                            <SelectItem value="instant">
                              Instant Payout (minutes) - 1% fee, max $10
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-slate-600">
                          You will receive{" "}
                          <span className="font-bold text-green-600">
                            $
                            {calculateWithdrawalBreakdown().netAmount.toFixed(
                              2
                            )}
                          </span>{" "}
                          after all fees
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {payoutMethod === "instant"
                            ? "Funds available within minutes"
                            : "Funds available in 2-3 business days"}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowWithdrawalModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleWithdrawFunds}
                        disabled={processingWithdrawal}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingWithdrawal ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        Confirm Withdrawal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">
                    Funds Already Withdrawn
                  </p>
                  <p className="text-sm text-gray-500">
                    You have already withdrawn the available funds for this trip
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500 text-center">
                Payouts are processed securely through Stripe Connect
              </p>
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
                All payment data is processed securely through Stripe. Kasama
                never stores your card numbers, bank details, or other sensitive
                information. Your payment preferences are stored locally on your
                device only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
