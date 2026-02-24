const PAYMENT_OPTIONS = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "paypal", label: "PayPal" },
  { id: "mobile-money", label: "Mobile Money" },
  { id: "bank-transfer", label: "Bank Transfer" },
];

const CheckoutForm = ({
  user,
  values,
  errors,
  paymentMethod,
  isPlacingOrder,
  onFieldChange,
  onPaymentChange,
  onSubmit,
  onLoginClick,
}) => {
  return (
    <form id="checkout-form" className="checkout-form-card" onSubmit={onSubmit} noValidate>
      <div className="checkout-section">
        <div className="checkout-section-head">
          <h2>Checkout</h2>
          {user ? (
            <p className="checkout-mode-badge">Signed in as {user.email}</p>
          ) : (
            <div className="checkout-mode-panel">
              <p>Guest checkout is active.</p>
              <button type="button" className="btn-link" onClick={onLoginClick}>
                Login for faster checkout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="checkout-section">
        <h3>Shipping Address</h3>
        <div className="checkout-fields">
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={values.fullName}
              autoComplete="name"
              onChange={onFieldChange}
              placeholder="Enter full name"
            />
            {errors.fullName ? <span className="field-error">{errors.fullName}</span> : null}
          </label>

          {!user ? (
            <label>
              Email
              <input
                type="email"
                name="email"
                value={values.email}
                autoComplete="email"
                onChange={onFieldChange}
                placeholder="Enter email"
              />
              {errors.email ? <span className="field-error">{errors.email}</span> : null}
            </label>
          ) : null}

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={values.phone}
              autoComplete="tel"
              onChange={onFieldChange}
              placeholder="Enter phone number"
            />
            {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
          </label>

          <label className="field-full">
            Address
            <input
              type="text"
              name="address"
              value={values.address}
              autoComplete="street-address"
              onChange={onFieldChange}
              placeholder="Street address"
            />
            {errors.address ? <span className="field-error">{errors.address}</span> : null}
          </label>

          <label>
            City
            <input
              type="text"
              name="city"
              value={values.city}
              autoComplete="address-level2"
              onChange={onFieldChange}
              placeholder="City"
            />
            {errors.city ? <span className="field-error">{errors.city}</span> : null}
          </label>

          <label>
            Zip Code
            <input
              type="text"
              name="zip"
              value={values.zip}
              autoComplete="postal-code"
              onChange={onFieldChange}
              placeholder="Zip"
            />
            {errors.zip ? <span className="field-error">{errors.zip}</span> : null}
          </label>
        </div>
      </div>

      <div className="checkout-section">
        <h3>Payment Method</h3>
        <div className="payment-method-list">
          {PAYMENT_OPTIONS.map((option) => (
            <label key={option.id} className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={paymentMethod === option.id}
                onChange={onPaymentChange}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.paymentMethod ? <span className="field-error">{errors.paymentMethod}</span> : null}
      </div>

      <div className="checkout-security-note">
        <strong>Secure Payment:</strong> Your transaction details are encrypted.
      </div>

      <button type="submit" className="checkout-hidden-submit" disabled={isPlacingOrder}>
        {isPlacingOrder ? "Placing order..." : "Place Order"}
      </button>
    </form>
  );
};

export default CheckoutForm;
