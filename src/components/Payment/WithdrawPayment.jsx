import React, {useState, useMemo} from "react";
import {Download, TriangleAlert, DollarSign} from "lucide-react";
import {useMutation} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {withdrawPaymentService} from "@/services/trip";
import {toast} from "sonner";

const Withdraw = ({withDrawlAmount}) => {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  const {user, token} = useSelector((state) => state.user);
  const tripId = useSelector((state) => state.trips.activeTripId);

  const userId = user?.id;
  const availableBalance = useMemo(
    () => Number(withDrawlAmount) || 0,
    [withDrawlAmount]
  );

  const handleAmountChange = (e) => {
    const value = Number(e.target.value);
    setAmount(value > availableBalance ? availableBalance : value);
  };

  const {mutate: withdrawMutate, isPending} = useMutation({
    mutationFn: ({token, data}) => withdrawPaymentService(token, data),
    onSuccess: (data) => {
      if (data.onboardingUrl) {
        toast(
          "Complete Stripe onboarding to withdraw funds. Opening Stripe...",
          {type: "info"}
        );
        window.open(data.onboardingUrl, "_blank");
      } else {
        toast.success("Payment withdrawn successfully");
      }
    },
    onError: (error) => toast.error(error?.message || "An error occurred"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !purpose.trim()) return;

    const data = {tripId, userId, amount, description: purpose};
    withdrawMutate({token, data});
    //   console.log(data1,'aa')
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg text-card-foreground bg-white shadow-lg border border-slate-200">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold flex items-center gap-2 text-slate-800">
            <Download className="w-5 h-5 text-amber-600" />
            Withdraw Trip Funds
          </h3>
        </div>

        {/* Body */}
        <div className="p-6 pt-0 space-y-6">
          {/* Balance Card */}
          <div className="bg-amber-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">
                Available Balance:
              </span>
              <span className="text-2xl font-bold text-amber-600">
                ${availableBalance.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {/* Total funds collected from all participants */}
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">
                  Admin Responsibility
                </h4>
                <p className="text-sm text-red-700">
                  Only withdraw funds for legitimate trip expenses. Keep
                  receipts for transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Withdraw Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div>
              <label
                htmlFor="withdraw-amount"
                className="text-base font-semibold text-slate-700"
              >
                Withdrawal Amount
              </label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  id="withdraw-amount"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-lg font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Maximum available: ${availableBalance.toLocaleString()}
              </p>
            </div>

            {/* Purpose Textarea */}
            <div>
              <label
                htmlFor="purpose"
                className="text-base font-semibold text-slate-700"
              >
                Purpose/Description *
              </label>
              <textarea
                id="purpose"
                placeholder="e.g., Hotel booking deposit, Flight reservations..."
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be visible to all participants for transparency
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                !amount ||
                amount <= 0 ||
                amount > availableBalance ||
                !purpose.trim() ||
                isPending
              }
              className="inline-flex items-center justify-center gap-2 rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 w-full py-3 text-lg font-semibold bg-amber-600 hover:bg-amber-700"
            >
              {isPending
                ? "Processing..."
                : `Withdraw $${amount ? Number(amount).toFixed(2) : "0.00"}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
