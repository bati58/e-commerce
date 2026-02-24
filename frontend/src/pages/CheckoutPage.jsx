import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useCart } from "../state/CartContext.jsx";
import apiClient from "../utils/apiClient.js";

const SHIPPING_FEE = 10;
const TAX_RATE = 0.05;
const SHIPPING_STORAGE_KEY = "mern_checkout_shipping";
const GUEST_ORDERS_KEY = "mern_guest_orders";

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const getUnitPrice = (item) => Number(item.discountedPrice ?? item.price ?? 0);

const readShippingFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [serverSubtotal, setServerSubtotal] = useState(0);

  const savedShipping = useMemo(() => readShippingFromStorage(), []);
  const [formValues, setFormValues] = useState({
    fullName: savedShipping?.fullName || user?.name || "",
    email: savedShipping?.email || user?.email || "",
    phone: savedShipping?.phone || "",
    address: savedShipping?.address || "",
    city: savedShipping?.city || "",
    zip: savedShipping?.zip || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [errors, setErrors] = useState({});

  const itemsSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + getUnitPrice(item) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (user) {
      setFormValues((previous) => ({
        ...previous,
        fullName: previous.fullName || user.name || "",
        email: previous.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setServerSubtotal(itemsSubtotal);
      setValidationMessage("Guest checkout: cart total verified locally.");
      return;
    }

    const validateCart = async () => {
      try {
        const items = cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        }));
        const response = await apiClient.post("/cart/validate", { items });
        setServerSubtotal(Number(response.data.total || 0));
        setValidationMessage("Cart validated and ready for secure checkout.");
      } catch (error) {
        console.error(error);
        setServerSubtotal(itemsSubtotal);
        setValidationMessage("Live validation unavailable. Showing local totals.");
      }
    };

    validateCart();
  }, [cartItems, itemsSubtotal, user]);

  const shipping = cartItems.length > 0 ? SHIPPING_FEE : 0;
  const tax = serverSubtotal * TAX_RATE;
  const orderTotal = serverSubtotal + shipping + tax;
  const estimatedDelivery = useMemo(() => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 6);
    const formatOptions = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, formatOptions)} - ${end.toLocaleDateString(
      undefined,
      formatOptions
    )}`;
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
    setErrors((previous) => ({ ...previous, paymentMethod: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formValues.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!formValues.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s()]{8,20}$/.test(formValues.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!formValues.address.trim()) nextErrors.address = "Address is required.";
    if (!formValues.city.trim()) nextErrors.city = "City is required.";
    if (!formValues.zip.trim()) {
      nextErrors.zip = "Zip code is required.";
    } else if (!/^[A-Za-z0-9 -]{3,10}$/.test(formValues.zip.trim())) {
      nextErrors.zip = "Enter a valid zip code.";
    }

    if (!user) {
      if (!formValues.email.trim()) {
        nextErrors.email = "Email is required for guest checkout.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
        nextErrors.email = "Enter a valid email address.";
      }
    }

    if (!paymentMethod) nextErrors.paymentMethod = "Select a payment method.";

    return nextErrors;
  };

  const persistShipping = () => {
    const payload = {
      fullName: formValues.fullName.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      address: formValues.address.trim(),
      city: formValues.city.trim(),
      zip: formValues.zip.trim(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(payload));
    }
  };

  const placeGuestOrder = () => {
    if (typeof window === "undefined") return;

    const guestOrder = {
      id: `guest-${Date.now()}`,
      createdAt: new Date().toISOString(),
      shippingAddress: {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        address: formValues.address.trim(),
        city: formValues.city.trim(),
        zip: formValues.zip.trim(),
      },
      paymentMethod,
      products: cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: getUnitPrice(item),
        image: item.image,
      })),
      pricing: {
        items: serverSubtotal,
        shipping,
        tax,
        total: orderTotal,
      },
      status: "pending",
      isGuest: true,
    };

    let existingOrders = [];
    try {
      const raw = localStorage.getItem(GUEST_ORDERS_KEY) || "[]";
      const parsed = JSON.parse(raw);
      existingOrders = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(error);
      existingOrders = [];
    }

    const nextOrders = [guestOrder, ...existingOrders];
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(nextOrders));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSummaryError("");

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    persistShipping();
    setIsPlacingOrder(true);

    try {
      if (user) {
        const items = cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        }));

        await apiClient.post("/orders", {
          products: items,
          total: Number(orderTotal.toFixed(2)),
        });

        clearCart();
        navigate("/orders");
      } else {
        placeGuestOrder();
        clearCart();
        navigate("/products");
      }
    } catch (error) {
      console.error(error);
      setSummaryError(error.response?.data?.message || "Unable to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <section className="container checkout-page">
      <div className="checkout-layout">
        <CheckoutForm
          user={user}
          values={formValues}
          errors={errors}
          paymentMethod={paymentMethod}
          isPlacingOrder={isPlacingOrder}
          onFieldChange={handleFieldChange}
          onPaymentChange={handlePaymentChange}
          onSubmit={handleSubmit}
          onLoginClick={() =>
            navigate("/login", { state: { from: { pathname: "/checkout" } } })
          }
        />

        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          <p className="checkout-estimate">Estimated delivery: {estimatedDelivery}</p>

          <div className="checkout-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="checkout-item-row">
                <p>
                  {item.name} x {item.quantity}
                </p>
                <strong>{formatPrice(getUnitPrice(item) * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-summary-lines">
            <p>
              <span>Items</span>
              <strong>{formatPrice(serverSubtotal)}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>{formatPrice(shipping)}</strong>
            </p>
            <p>
              <span>Tax</span>
              <strong>{formatPrice(tax)}</strong>
            </p>
            <p className="checkout-total-line">
              <span>Total</span>
              <strong>{formatPrice(orderTotal)}</strong>
            </p>
          </div>

          <div className="checkout-secure-badge">Secure Payment Enabled</div>
          {validationMessage ? <p className="checkout-helper">{validationMessage}</p> : null}
          {summaryError ? <p className="error">{summaryError}</p> : null}

          <button
            type="submit"
            form="checkout-form"
            className="btn-primary checkout-place-order-btn"
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? "Placing order..." : "Place Order"}
          </button>
        </aside>
      </div>
    </section>
  );
};

export default CheckoutPage;
