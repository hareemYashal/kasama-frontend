"use client"

// ManualACHPaymentForm.tsx - Manual Bank Account Entry for ACH Payments
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, useStripe } from "@stripe/react-stripe-js"
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
  select: {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "1rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease-in-out",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
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
  helperText: {
    fontSize: "0.75rem",
    color: "#718096",
    marginTop: "0.25rem",
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
    spacingUnit: "6px",
    borderRadius: "8px",
    fontSizeBase: "16px",
  },
}

// Inner form component that uses Stripe hooks
const ManualACHPaymentFormInner = () => {
  const stripe = useStripe()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    accountHolderName: "",
    email: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "checking",
  })
  const [inputFocus, setInputFocus] = useState({})

  const BASE_URL = import.meta.env.VITE_API_URL
  const token = useSelector((s) => s.user.token)

  const handleInputFocus = (field) => {
    setInputFocus((prev) => ({ ...prev, [field]: true }))
  }

  const handleInputBlur = (field) => {
    setInputFocus((prev) => ({ ...prev, [field]: false }))
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Validate routing number (must be 9 digits)
  const validateRoutingNumber = (routing) => {
    const cleaned = routing.replace(/\D/g, "")
    return cleaned.length === 9
  }

  // Validate account number (typically 4-17 digits)
  const validateAccountNumber = (account) => {
    const cleaned = account.replace(/\D/g, "")
    return cleaned.length >= 4 && cleaned.length <= 17
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe) {
      console.error("Stripe has not loaded yet")
      return
    }

    // Validate form inputs
    if (!formData.accountHolderName || !formData.email || !formData.routingNumber || !formData.accountNumber) {
      setError("Please fill in all required fields")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    // Validate routing number
    if (!validateRoutingNumber(formData.routingNumber)) {
      setError("Routing number must be exactly 9 digits")
      return
    }

    // Validate account number
    if (!validateAccountNumber(formData.accountNumber)) {
      setError("Account number must be between 4 and 17 digits")
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

      // 2. Confirm the payment with manually entered bank account details
      const { error: confirmError } = await stripe.confirmUsBankAccountPayment(clientSecret, {
        payment_method: {
          us_bank_account: {
            routing_number: formData.routingNumber.replace(/\D/g, ""),
            account_number: formData.accountNumber.replace(/\D/g, ""),
            account_holder_type: "individual",
            account_type: formData.accountType,
          },
          billing_details: {
            name: formData.accountHolderName,
            email: formData.email,
          },
        },
      })

      if (confirmError) {
        setError(confirmError.message)
      } else {
        // Payment is processing
        setSuccess(true)
        // Reset form
        setFormData({
          accountHolderName: "",
          email: "",
          routingNumber: "",
          accountNumber: "",
          accountType: "checking",
        })
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
  })

  const getButtonStyle = () => ({
    ...formStyles.button,
    ...(!processing && stripe ? formStyles.buttonHover : {}),
    ...(processing || !stripe ? formStyles.buttonDisabled : {}),
  })

  return (
    <div style={formStyles.container}>
      <h2 style={formStyles.title}>Manual Bank Account Payment</h2>

      <form onSubmit={handleSubmit}>
        <div style={formStyles.formGroup}>
          <label htmlFor="accountHolderName" style={formStyles.label}>
            Account Holder Name *
          </label>
          <input
            type="text"
            id="accountHolderName"
            value={formData.accountHolderName}
            onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
            onFocus={() => handleInputFocus("accountHolderName")}
            onBlur={() => handleInputBlur("accountHolderName")}
            required
            style={getInputStyle("accountHolderName")}
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
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onFocus={() => handleInputFocus("email")}
            onBlur={() => handleInputBlur("email")}
            required
            style={getInputStyle("email")}
            placeholder="john.doe@example.com"
            disabled={processing}
          />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="routingNumber" style={formStyles.label}>
            Routing Number *
          </label>
          <input
            type="text"
            id="routingNumber"
            value={formData.routingNumber}
            onChange={(e) => handleInputChange("routingNumber", e.target.value)}
            onFocus={() => handleInputFocus("routingNumber")}
            onBlur={() => handleInputBlur("routingNumber")}
            required
            maxLength={9}
            style={getInputStyle("routingNumber")}
            placeholder="110000000"
            disabled={processing}
          />
          <div style={formStyles.helperText}>9-digit bank routing number</div>
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="accountNumber" style={formStyles.label}>
            Account Number *
          </label>
          <input
            type="text"
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
            onFocus={() => handleInputFocus("accountNumber")}
            onBlur={() => handleInputBlur("accountNumber")}
            required
            maxLength={17}
            style={getInputStyle("accountNumber")}
            placeholder="000123456789"
            disabled={processing}
          />
          <div style={formStyles.helperText}>4-17 digit account number</div>
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="accountType" style={formStyles.label}>
            Account Type *
          </label>
          <select
            id="accountType"
            value={formData.accountType}
            onChange={(e) => handleInputChange("accountType", e.target.value)}
            style={formStyles.select}
            disabled={processing}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
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
            ✅ Payment initiated successfully! Please check your email for verification.
          </div>
        )}

        {!stripe && <div style={formStyles.loading}>🔄 Loading secure payment system...</div>}
      </form>
    </div>
  )
}

// Main wrapper component that provides Elements context
const ManualACHPaymentForm = () => {
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
      <ManualACHPaymentFormInner />
    </Elements>
  )
}

export default ManualACHPaymentForm
