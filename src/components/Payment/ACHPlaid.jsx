"use client"

import { useEffect, useState } from "react"
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useSelector } from "react-redux"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const formStyles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#1a202c",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#4a5568",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    transition: "border-color 0.2s",
    outline: "none",
  },
  inputFocus: {
    borderColor: "#4299e1",
    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
  },
  button: {
    width: "100%",
    padding: "0.875rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#4299e1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "1rem",
  },
  buttonHover: {
    backgroundColor: "#3182ce",
    transform: "translateY(-1px)",
  },
  buttonDisabled: {
    backgroundColor: "#a0aec0",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  infoText: {
    marginTop: "1rem",
    fontSize: "0.75rem",
    color: "#718096",
    textAlign: "center" ,
  },
  error: {
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#fed7d7",
    color: "#c53030",
    borderRadius: "8px",
    fontSize: "0.875rem",
  },
  success: {
    marginTop: "1rem",
    padding: "0.75rem",
    backgroundColor: "#c6f6d5",
    color: "#22543d",
    borderRadius: "8px",
    fontSize: "0.875rem",
  },
  loading: {
    color: "#4299e1",
    fontSize: "0.875rem",
    textAlign: "center" ,
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

    if (!customerName || !customerEmail) {
      setError("Please fill in all required fields")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      setError("Please enter a valid email address")
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(false)

    try {
      const endpoint = `${BASE_URL}/payment/add-payment-intent`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2000 }),
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const { clientSecret } = await response.json()

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

      if (paymentIntent.status === "requires_confirmation") {
        const { error: confirmError } = await stripe.confirmUsBankAccountPayment(clientSecret)

        if (confirmError) {
          setError(confirmError.message)
        } else {
          setSuccess(true)
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
    <Elements stripe={stripePromise}>
      <ACHPaymentFormInner />
    </Elements>
  )
}

export default ACHPaymentForm
