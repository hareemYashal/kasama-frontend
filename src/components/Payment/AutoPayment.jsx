"use client";

import {useState} from "react";
import {useStripe, useElements, CardElement} from "@stripe/react-stripe-js";
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

const PaymentsModal = ({
  clientSecret,
  isOpen,
  setIsOpen,
  payload,
  setIsAutoPaymentLoading,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const authToken = useSelector((state) => state.user.token);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("CardElement not found");

      const {setupIntent, error: stripeError} = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {name: customerName, email: customerEmail},
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

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
        toast.success("Card saved and auto payment enabled!");
        setIsOpen(false);
      } else {
        toast.error("Failed to enable auto payment.");
      }
      console.log("Card setup successful!", setupIntent);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setIsAutoPaymentLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Save Card / Add Payment Method</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save a Payment Method</DialogTitle>
          <DialogDescription>
            Enter your card details to save it for future payments.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSaveCard}>
          <Input
            placeholder="Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
          />
          <div className="p-4 border rounded-md bg-gray-50">
            <CardElement options={{hidePostalCode: true}} />
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {success && (
            <p className="text-green-600">Card saved successfully!</p>
          )}

          <DialogFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentsModal;
