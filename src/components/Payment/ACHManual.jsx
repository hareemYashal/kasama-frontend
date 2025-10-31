"use client";

import {useState} from "react";
import {useStripe} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useSelector} from "react-redux";
import {toast} from "sonner";

const ACHPaymentsModal = ({
  clientSecret,
  isOpen,
  setIsOpen,
  payload,
  setIsAutoPaymentLoading,
}) => {
  const stripe = useStripe();
  const authToken = useSelector((state) => state.user.token);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const authUser = useSelector((state) => state.user.user);

  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveACH = async (e) => {
    e.preventDefault();
    if (!stripe) return;

    setLoading(true);
    setError(null);

    try {
      // Confirm SetupIntent with manual ACH info
      const {setupIntent, error: stripeError} =
        await stripe.confirmUsBankAccountSetup(clientSecret, {
          payment_method: {
            us_bank_account: {
              account_number: accountNumber,
              routing_number: routingNumber,
              account_holder_type: "individual",
            },
            billing_details: {
              name: authUser?.name || "",
              email: authUser?.email || "",
            },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      // Notify backend to enable auto-payment
      const response = await fetch(
        `${BASE_URL}/payment/complete-setup-intent-and-enable-auto-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({...payload, setupIntentId: setupIntent.id}),
        }
      );
      const result = await response.json();

      if (result) {
        window.open(result.verification_url, "_blank");

        toast.success(
          "Bank account saved! Please verify micro-deposits to enable ACH payments."
        );
        setIsOpen(false);
      } else {
        toast.error("Failed to enable ACH auto-payment.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setIsAutoPaymentLoading(false);
    }
  };

  const onClose =async()=>{
    setIsOpen(false)
    setIsAutoPaymentLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button>Save Bank Account / Add ACH</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save a Bank Account</DialogTitle>
          <DialogDescription>
            Enter your bank details to save for future ACH payments.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSaveACH}>
          <Input
            placeholder="Account Holder Name"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            required
          />
          <Input
            placeholder="Routing Number"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            required
          />
          <Input
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />

          {error && <p className="text-red-600">{error}</p>}
          {success && (
            <p className="text-green-600">Bank account saved successfully!</p>
          )}

          <DialogFooter className="flex justify-end">
            <Button
              type="submit"
              disabled={
                loading ||
                !accountHolderName ||
                !accountNumber ||
                !routingNumber
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {"Save Bank Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ACHPaymentsModal;
