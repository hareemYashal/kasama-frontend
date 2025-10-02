
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
    <Elements stripe={stripePromise} >
      <ACHPaymentFormInner />
    </Elements>
  )
}

export default ACHPaymentForm
