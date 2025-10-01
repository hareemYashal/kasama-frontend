// // ACHPaymentForm.jsx - Complete Single Component Solution
// import React, { useState, useEffect } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
// import {useSelector} from "react-redux";

// // Create stripe promise outside component to avoid recreating on every render
// const stripePromise = loadStripe('pk_test_51S7hKeHFhVZ9uprZzkiHLQT6O5lWwtAO71T7mZfnkVcDvYbKvQGEjecGdZRKYV3iFkSrLoPdt5PcTRr4ELGN4iyt00NP7RBBjS');

// // Inner form component that uses Stripe hooks
// const ACHPaymentFormInner = () => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState(null);
//   const [customerName, setCustomerName] = useState("");
//   const [customerEmail, setCustomerEmail] = useState("");

//   const BASE_URL = import.meta.env.VITE_API_URL;
//   const token = useSelector((s) => s.user.token);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       console.error("Stripe has not loaded yet");
//       return;
//     }

//     // Validate form inputs
//     if (!customerName || !customerEmail) {
//       setError("Please fill in all required fields");
//       return;
//     }

//     setProcessing(true);
//     setError(null);

//     try {
//       // 1. Create a PaymentIntent on your server
//       const endpoint = `${BASE_URL}/payment/add-payment-intent`;
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: token ? { "Authorization": `Bearer ${token}` } : {},
//         body: ({ amount: 2000 }), // $20.00
//       });

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.status}`);
//       }

//       const { clientSecret } = await response.json();

//       // 2. Collect bank account details
//       const { paymentIntent, error: collectError } = await stripe.collectBankAccountForPayment({
//         clientSecret: clientSecret,
//         params: {
//           payment_method_type: "us_bank_account",
//           payment_method_data: {
//             billing_details: {
//               name: customerName,
//               email: customerEmail,
//             },
//           },
//         },
//       });

//       if (collectError) {
//         setError(collectError.message);
//         setProcessing(false);
//         return;
//       }

//       // 3. Confirm the payment if required
//       if (paymentIntent.status === "requires_confirmation") {
//         const { error: confirmError } = await stripe.confirmUsBankAccountPayment(clientSecret);

//         if (confirmError) {
//           setError(confirmError.message);
//         } else {
//           // Payment is processing
//           alert("Payment initiated successfully!");
//           // Reset form
//           setCustomerName("");
//           setCustomerEmail("");
//         }
//       }
//     } catch (err) {
//       console.error("Payment error:", err);
//       setError(err.message || "An unexpected error occurred.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
//       <div style={{ marginBottom: '1rem' }}>
//         <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem' }}>
//           Full Name *
//         </label>
//         <input
//           type="text"
//           id="name"
//           value={customerName}
//           onChange={(e) => setCustomerName(e.target.value)}
//           required
//           style={{
//             width: '100%',
//             padding: '0.5rem',
//             border: '1px solid #ccc',
//             borderRadius: '4px'
//           }}
//           placeholder="John Doe"
//         />
//       </div>

//       <div style={{ marginBottom: '1rem' }}>
//         <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
//           Email Address *
//         </label>
//         <input
//           type="email"
//           id="email"
//           value={customerEmail}
//           onChange={(e) => setCustomerEmail(e.target.value)}
//           required
//           style={{
//             width: '100%',
//             padding: '0.5rem',
//             border: '1px solid #ccc',
//             borderRadius: '4px'
//           }}
//           placeholder="john.doe@example.com"
//         />
//       </div>

//       <button
//         type="submit"
//         disabled={!stripe || processing}
//         style={{
//           width: '100%',
//           padding: '0.75rem',
//           backgroundColor: processing ? '#6c757d' : '#007bff',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           fontSize: '1rem',
//           cursor: !stripe || processing ? 'not-allowed' : 'pointer'
//         }}
//       >
//         {processing ? "Processing..." : "Pay with Bank Account"}
//       </button>

//       {error && (
//         <div style={{
//           marginTop: '1rem',
//           padding: '0.75rem',
//           backgroundColor: '#f8d7da',
//           color: '#721c24',
//           border: '1px solid #f5c6cb',
//           borderRadius: '4px'
//         }}>
//           {error}
//         </div>
//       )}

//       {!stripe && (
//         <div style={{
//           marginTop: '1rem',
//           padding: '0.75rem',
//           backgroundColor: '#fff3cd',
//           color: '#856404',
//           border: '1px solid #ffeaa7',
//           borderRadius: '4px'
//         }}>
//           Loading payment system...
//         </div>
//       )}
//     </form>
//   );
// };

// // Main wrapper component that provides Elements context
// const ACHPaymentForm = () => {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Prevent hydration issues by only rendering on client
//   if (!mounted) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '200px'
//       }}>
//         Loading payment form...
//       </div>
//     );
//   }

//   return (
//     <Elements stripe={stripePromise}>
//       <ACHPaymentFormInner />
//     </Elements>
//   );
// };

// export default ACHPaymentForm;


"use client"

// ACHPaymentForm.jsx - Complete Single Component Solution with Custom Styling
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { useSelector } from "react-redux"

// Create stripe promise outside component to avoid recreating on every render
const stripePromise = loadStripe(
  "pk_test_51S7hKeHFhVZ9uprZzkiHLQT6O5lWwtAO71T7mZfnkVcDvYbKvQGEjecGdZRKYV3iFkSrLoPdt5PcTRr4ELGN4iyt00NP7RBBjS",
)

// Custom CSS styles for the form
const formStyles = {
  container: {
    maxWidth: "500px",
    margin: "2rem auto",
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e1e5e9",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "1rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease-in-out",
    outline: "none",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#4299e1",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
  },
  button: {
    width: "100%",
    padding: "1rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#4299e1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  buttonHover: {
    backgroundColor: "#3182ce",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(49, 130, 206, 0.3)",
  },
  buttonDisabled: {
    backgroundColor: "#a0aec0",
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
  error: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    border: "1px solid #feb2b2",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  loading: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#feebc8",
    color: "#dd6b20",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    fontSize: "0.875rem",
    textAlign: "center",
  },
  success: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#c6f6d5",
    color: "#276749",
    border: "1px solid #9ae6b4",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  infoText: {
    fontSize: "0.875rem",
    color: "#718096",
    textAlign: "center",
    marginTop: "1rem",
    lineHeight: "1.5",
  },
}

// Stripe Elements appearance configuration
const elementsAppearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#4299e1",
    colorBackground: "#fafafa",
    colorText: "#2d3748",
    colorDanger: "#e53e3e",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    spacingUnit: "6px", // Increased from 4px to 6px for more spacing
    borderRadius: "8px",
    fontSizeBase: "16px", // Increased from 1rem to explicit 16px
    fontSizeSm: "14px", // Added for smaller text
    fontSizeLg: "18px", // Added for larger text
  },
  rules: {
    ".ModalContent": {
      maxWidth: "600px",
      width: "90vw",
    },
    ".Modal": {
      maxWidth: "600px",
    },
    ".PickerContainer": {
      minWidth: "500px",
    },
    ".Input": {
      padding: "16px 20px",
      border: "2px solid #e2e8f0",
      backgroundColor: "#fafafa",
      transition: "all 0.2s ease-in-out",
      boxShadow: "none",
      fontSize: "16px",
    },
    ".Input:focus": {
      borderColor: "#4299e1",
      backgroundColor: "#ffffff",
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
    },
    ".Input--invalid": {
      borderColor: "#e53e3e",
      backgroundColor: "#fff5f5",
    },
    ".Label": {
      fontSize: "15px",
      fontWeight: "500",
      color: "#2d3748",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    ".Error": {
      fontSize: "14px",
      color: "#e53e3e",
      marginTop: "6px",
    },
    ".Tab": {
      border: "2px solid #e2e8f0",
      borderRadius: "8px",
      padding: "16px 20px",
      fontSize: "16px",
    },
    ".Tab--selected": {
      borderColor: "#4299e1",
      backgroundColor: "#ebf8ff",
    },
    ".PickerItem": {
      padding: "16px 20px",
      fontSize: "16px",
      minHeight: "64px",
    },
    ".PickerItem-label": {
      fontSize: "16px",
      fontWeight: "500",
    },
    ".PickerItem-sublabel": {
      fontSize: "14px",
      marginTop: "4px",
    },
  },
}

// Inner form component that uses Stripe hooks
const ACHPaymentFormInner = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [inputFocus, setInputFocus] = useState({
    name: false,
    email: false,
  })

  const BASE_URL = import.meta.env.VITE_API_URL
  const token = useSelector((s) => s.user.token)

  const handleInputFocus = (field) => {
    setInputFocus((prev) => ({ ...prev, [field]: true }))
  }

  const handleInputBlur = (field) => {
    setInputFocus((prev) => ({ ...prev, [field]: false }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      console.error("Stripe has not loaded yet")
      return
    }

    // Validate form inputs
    if (!customerName || !customerEmail) {
      setError("Please fill in all required fields")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError("Please enter a valid email address")
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Create a PaymentIntent on your server
      const endpoint = `${BASE_URL}/payment/add-payment-intent`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2000 }), // $20.00
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const { clientSecret } = await response.json()

      // 2. Collect bank account details
      const { paymentIntent, error: collectError } = await stripe.collectBankAccountForPayment({
        clientSecret: clientSecret,
        params: {
          payment_method_type: "us_bank_account",
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail,
            },
          },
        },
      })

      if (collectError) {
        setError(collectError.message)
        setProcessing(false)
        return
      }

      // 3. Confirm the payment if required
      if (paymentIntent.status === "requires_confirmation") {
        const { error: confirmError } = await stripe.confirmUsBankAccountPayment(clientSecret)

        if (confirmError) {
          setError(confirmError.message)
        } else {
          // Payment is processing
          setSuccess(true)
          // Reset form
          setCustomerName("")
          setCustomerEmail("")
        }
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setProcessing(false)
    }
  }

  const getInputStyle = (field) => ({
    ...formStyles.input,
    ...(inputFocus[field] ? formStyles.inputFocus : {}),
    ...(error && !customerName && field === "name" ? { borderColor: "#e53e3e" } : {}),
    ...(error && !customerEmail && field === "email" ? { borderColor: "#e53e3e" } : {}),
  })

  const getButtonStyle = () => ({
    ...formStyles.button,
    ...(!processing && stripe ? formStyles.buttonHover : {}),
    ...(processing || !stripe ? formStyles.buttonDisabled : {}),
  })

  return (
    <div style={formStyles.container}>
      <h2 style={formStyles.title}>Bank Account Payment</h2>

      <form onSubmit={handleSubmit}>
        <div style={formStyles.formGroup}>
          <label htmlFor="name" style={formStyles.label}>
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onFocus={() => handleInputFocus("name")}
            onBlur={() => handleInputBlur("name")}
            required
            style={getInputStyle("name")}
            placeholder="John Doe"
            disabled={processing}
          />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="email" style={formStyles.label}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            onFocus={() => handleInputFocus("email")}
            onBlur={() => handleInputBlur("email")}
            required
            style={getInputStyle("email")}
            placeholder="john.doe@example.com"
            disabled={processing}
          />
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          style={getButtonStyle()}
          onMouseEnter={(e) => {
            if (!processing && stripe) {
              e.target.style.backgroundColor = formStyles.buttonHover.backgroundColor
              e.target.style.transform = formStyles.buttonHover.transform
            }
          }}
          onMouseLeave={(e) => {
            if (!processing && stripe) {
              e.target.style.backgroundColor = formStyles.button.backgroundColor
              e.target.style.transform = "none"
            }
          }}
        >
          {processing ? "Processing..." : "Pay with Bank Account"}
        </button>

        <div style={formStyles.infoText}>
          Secure payment processed by Stripe. Your financial information is encrypted and secure.
        </div>

        {error && <div style={formStyles.error}>⚠️ {error}</div>}

        {success && (
          <div style={formStyles.success}>
            ✅ Payment initiated successfully! Please check your email for confirmation.
          </div>
        )}

        {!stripe && <div style={formStyles.loading}>🔄 Loading secure payment system...</div>}
      </form>
    </div>
  )
}

// Main wrapper component that provides Elements context
const ACHPaymentForm = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration issues by only rendering on client
  if (!mounted) {
    return (
      <div style={formStyles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={formStyles.loading}>Loading payment form...</div>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: elementsAppearance }}>
      <ACHPaymentFormInner />
    </Elements>
  )
}

export default ACHPaymentForm
