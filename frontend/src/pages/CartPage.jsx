import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext.jsx";
import { formatUsdAndEtb } from "../utils/currency.js";
import { getCurrentPrice, getOriginalPrice } from "../utils/pricing.js";

const SHIPPING_FEE = 10;
const TAX_RATE = 0.05;

const PROMO_CODES = {
  SAVE10: { type: "percent", value: 10, label: "10% off subtotal" },
  SAVE20: { type: "fixed", value: 20, label: `${formatUsdAndEtb(20)} off subtotal` },
  FREESHIP: { type: "shipping", value: SHIPPING_FEE, label: "Free shipping" },
};

const getUnitPrice = (item) => getCurrentPrice(item);

const getOriginalUnitPrice = (item) => getOriginalPrice(item);

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState("");

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + getUnitPrice(item) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const productSavings = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const originalTotal = getOriginalUnitPrice(item) * Number(item.quantity || 0);
        const discountedTotal = getUnitPrice(item) * Number(item.quantity || 0);
        return sum + Math.max(0, originalTotal - discountedTotal);
      }, 0),
    [cartItems]
  );

  const shippingBase = cartItems.length > 0 ? SHIPPING_FEE : 0;
  let promoDiscount = 0;
  let shippingDiscount = 0;

  if (appliedPromo) {
    if (appliedPromo.type === "percent") {
      promoDiscount = (subtotal * appliedPromo.value) / 100;
    }
    if (appliedPromo.type === "fixed") {
      promoDiscount = appliedPromo.value;
    }
    if (appliedPromo.type === "shipping") {
      shippingDiscount = appliedPromo.value;
    }
  }

  promoDiscount = Math.min(subtotal, promoDiscount);
  shippingDiscount = Math.min(shippingBase, shippingDiscount);

  const shipping = Math.max(0, shippingBase - shippingDiscount);
  const taxableAmount = Math.max(0, subtotal - promoDiscount);
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + shipping + tax;
  const totalSavings = productSavings + promoDiscount + shippingDiscount;

  const estimatedDelivery = useMemo(() => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() + 4);
    end.setDate(end.getDate() + 7);

    const startLabel = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const endLabel = end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return `${startLabel} - ${endLabel}`;
  }, []);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleQuantityChange = (item, nextQuantity) => {
    const stockLimit =
      Number(item.stock) > 0 ? Number(item.stock) : Number.MAX_SAFE_INTEGER;
    const safeQuantity = Math.max(1, Math.min(stockLimit, nextQuantity));
    updateQuantity(item._id, safeQuantity);
  };

  const handlePromoSubmit = (event) => {
    event.preventDefault();
    const normalized = promoCode.trim().toUpperCase();

    if (!normalized) {
      setPromoMessage("Enter a promo code first.");
      return;
    }

    const promo = PROMO_CODES[normalized];
    if (!promo) {
      setPromoMessage("Invalid promo code.");
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo({ code: normalized, ...promo });
    setPromoMessage(`Promo ${normalized} applied: ${promo.label}`);
  };

  const clearPromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoMessage("");
  };

  if (cartItems.length === 0) {
    return (
      <section className="container cart-page">
        <div className="cart-empty-card">
          <h1>Your Cart is Empty</h1>
          <p>Add products to see pricing, delivery estimates, and checkout options.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container cart-page">
      <header className="cart-head">
        <h1>Your Cart ({itemCount} Items)</h1>
        <p className="delivery-note">Estimated delivery: {estimatedDelivery}</p>
      </header>

      <div className="cart-layout">
        <section className="cart-table-card">
          <div className="cart-table-head">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Remove</span>
          </div>

          <div className="cart-table-body">
            {cartItems.map((item) => {
              const unitPrice = getUnitPrice(item);
              const lineTotal = unitPrice * Number(item.quantity || 0);
              const variantLabel = [item.selectedColor, item.selectedStorage]
                .filter(Boolean)
                .join(" / ");

              return (
                <article key={item._id} className="cart-row">
                  <div className="cart-product-cell">
                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                    <div>
                      <h3>{item.name}</h3>
                      {variantLabel ? <p>{variantLabel}</p> : null}
                    </div>
                  </div>

                  <p className="cart-price-cell">{formatUsdAndEtb(unitPrice)}</p>

                  <div className="cart-qty-cell">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item, Number(item.quantity || 1) - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock ? Number(item.stock) : undefined}
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(item, Number(event.target.value) || 1)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item, Number(item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-total-cell">{formatUsdAndEtb(lineTotal)}</p>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    X
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="order-summary-card">
          <h2>Order Summary</h2>

          <div className="summary-lines">
            <p>
              <span>Subtotal</span>
              <strong>{formatUsdAndEtb(subtotal)}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>{formatUsdAndEtb(shipping)}</strong>
            </p>
            <p>
              <span>Tax</span>
              <strong>{formatUsdAndEtb(tax)}</strong>
            </p>
            <p className="summary-total">
              <span>Total</span>
              <strong>{formatUsdAndEtb(total)}</strong>
            </p>
          </div>

          <p className="summary-saving">You save {formatUsdAndEtb(totalSavings)} on this order</p>

          <form className="promo-form" onSubmit={handlePromoSubmit}>
            <label htmlFor="promo-input">Promo Code</label>
            <div className="promo-row">
              <input
                id="promo-input"
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
              />
              <button type="submit" className="btn-secondary">
                Apply
              </button>
            </div>
          </form>

          {promoMessage ? (
            <p className={`promo-message ${appliedPromo ? "success" : "error"}`}>
              {promoMessage}
            </p>
          ) : null}

          {appliedPromo ? (
            <button type="button" className="btn-link promo-clear-btn" onClick={clearPromo}>
              Remove promo ({appliedPromo.code})
            </button>
          ) : null}

          <button className="btn-primary checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </section>
  );
};

export default CartPage;
