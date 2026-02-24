import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import apiClient from "../utils/apiClient.js";
import { formatUsdAndEtb } from "../utils/currency.js";

const WISHLIST_STORAGE_KEY = "mern_wishlist_ids";
const SHIPPING_STORAGE_KEY = "mern_checkout_shipping";

const SIDEBAR_ITEMS = [
  { id: "dashboard", icon: "DB", label: "Dashboard" },
  { id: "profile", icon: "PR", label: "Profile" },
  { id: "orders", icon: "OR", label: "Orders" },
  { id: "tracking", icon: "TR", label: "Track Order" },
  { id: "wishlist", icon: "WL", label: "Wishlist" },
  { id: "addresses", icon: "AD", label: "Addresses" },
  { id: "payments", icon: "PM", label: "Payment Methods" },
  { id: "returns", icon: "RR", label: "Returns & Refunds" },
  { id: "settings", icon: "ST", label: "Settings" },
];

const SECTION_TITLES = {
  dashboard: "Recent Orders",
  profile: "Profile",
  orders: "Order History",
  tracking: "Track Order",
  wishlist: "Wishlist",
  addresses: "Saved Addresses",
  payments: "Payment Methods",
  returns: "Returns & Refunds",
  settings: "Settings",
};

const readJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.error(error);
    return fallback;
  }
};

const shortId = (value = "") => String(value).slice(0, 8).toUpperCase();

const formatDateTime = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatus = (value = "pending") =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const statusClassName = (value = "pending") =>
  `status-${String(value).trim().toLowerCase().replace(/\s+/g, "-")}`;

const AccountPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingMessage, setTrackingMessage] = useState("");
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promoUpdates: false,
    twoFactorAuth: false,
  });

  const wishlistIds = useMemo(() => {
    const stored = readJson(WISHLIST_STORAGE_KEY, []);
    return Array.isArray(stored) ? stored : [];
  }, []);

  const savedAddress = useMemo(() => {
    const stored = readJson(SHIPPING_STORAGE_KEY, null);
    return stored && typeof stored === "object" ? stored : null;
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setOrdersError("");

      try {
        const response = await apiClient.get("/orders/my-orders");
        if (!mounted) return;
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setOrders([]);
        setOrdersError(error.response?.data?.message || "Unable to load orders right now.");
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const deliveredCount = orders.filter(
      (order) => String(order.status || "").toLowerCase() === "delivered"
    ).length;
    const activeCount = orders.filter(
      (order) =>
        !["delivered", "cancelled"].includes(String(order.status || "").toLowerCase())
    ).length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    return {
      totalOrders: orders.length,
      deliveredCount,
      activeCount,
      totalSpent,
    };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const deliveredOrders = useMemo(
    () =>
      orders.filter(
        (order) => String(order.status || "").toLowerCase() === "delivered"
      ),
    [orders]
  );

  const handleTrackSubmit = (event) => {
    event.preventDefault();
    const query = trackingInput.trim().replace(/^#/, "").toLowerCase();

    if (!query) {
      setTrackedOrder(null);
      setTrackingMessage("Enter an order ID.");
      return;
    }

    const match = orders.find((order) => {
      const id = String(order._id || "").toLowerCase();
      return id.includes(query) || shortId(order._id).toLowerCase() === query;
    });

    if (!match) {
      setTrackedOrder(null);
      setTrackingMessage("No matching order found.");
      return;
    }

    setTrackedOrder(match);
    setTrackingMessage("");
    setActiveSection("tracking");
  };

  const togglePreference = (key) => {
    setPreferences((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const renderRecentOrderList = () => {
    if (loadingOrders) return <p className="account-empty">Loading orders...</p>;
    if (ordersError) return <p className="error">{ordersError}</p>;
    if (recentOrders.length === 0) {
      return (
        <p className="account-empty">
          You have no orders yet. Start exploring products to create your first order.
        </p>
      );
    }

    return (
      <ul className="account-order-mini-list">
        {recentOrders.map((order) => (
          <li key={order._id}>
            <div>
              <strong>Order #{shortId(order._id)}</strong>
              <p>{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="account-mini-right">
              <span className={`account-status ${statusClassName(order.status)}`}>
                {formatStatus(order.status)}
              </span>
              <strong>{formatUsdAndEtb(order.total)}</strong>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderDashboard = () => (
    <div className="account-section-stack">
      <div className="account-grid-stats">
        <article className="account-stat-card">
          <p>Total Orders</p>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className="account-stat-card">
          <p>Active Orders</p>
          <strong>{stats.activeCount}</strong>
        </article>
        <article className="account-stat-card">
          <p>Total Spent</p>
          <strong>{formatUsdAndEtb(stats.totalSpent)}</strong>
        </article>
      </div>

      <article className="account-card">
        <div className="account-card-head">
          <h3>Recent Orders</h3>
          <button type="button" className="btn-link" onClick={() => setActiveSection("orders")}>
            View all
          </button>
        </div>
        {renderRecentOrderList()}
      </article>

      <article className="account-card">
        <h3>Quick Access</h3>
        <div className="account-action-row">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setActiveSection("wishlist")}
          >
            Open Wishlist ({wishlistIds.length})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setActiveSection("addresses")}
          >
            Manage Addresses
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setActiveSection("tracking")}
          >
            Track an Order
          </button>
        </div>
      </article>
    </div>
  );

  const renderProfile = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Account Profile</h3>
        <div className="account-profile-grid">
          <div className="account-profile-item">
            <span>Full Name</span>
            <strong>{user?.name || "Guest User"}</strong>
          </div>
          <div className="account-profile-item">
            <span>Email Address</span>
            <strong>{user?.email || "Not available"}</strong>
          </div>
          <div className="account-profile-item">
            <span>Member ID</span>
            <strong>{user?._id ? shortId(user._id) : "N/A"}</strong>
          </div>
          <div className="account-profile-item">
            <span>Delivered Orders</span>
            <strong>{stats.deliveredCount}</strong>
          </div>
        </div>
      </article>

      <article className="account-card">
        <h3>Primary Contact</h3>
        {savedAddress ? (
          <p className="account-empty">
            {savedAddress.fullName}
            {" | "}
            {savedAddress.phone}
            {" | "}
            {savedAddress.address}, {savedAddress.city} {savedAddress.zip}
          </p>
        ) : (
          <p className="account-empty">
            No saved address yet. Add one during checkout to speed up future purchases.
          </p>
        )}
      </article>
    </div>
  );

  const renderOrders = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Order History</h3>
        {loadingOrders ? <p className="account-empty">Loading orders...</p> : null}
        {ordersError ? <p className="error">{ordersError}</p> : null}
        {!loadingOrders && !ordersError && orders.length === 0 ? (
          <p className="account-empty">No orders found.</p>
        ) : null}

        {!loadingOrders && !ordersError && orders.length > 0 ? (
          <div className="account-order-feed">
            {orders.map((order) => (
              <article key={order._id} className="account-order-card">
                <div className="account-order-head">
                  <div>
                    <strong>Order #{shortId(order._id)}</strong>
                    <p>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className={`account-status ${statusClassName(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <ul className="account-order-items">
                  {(order.products || []).map((item, index) => (
                    <li key={`${order._id}-${index}`}>
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <strong>{formatUsdAndEtb(Number(item.price || 0) * Number(item.quantity || 0))}</strong>
                    </li>
                  ))}
                </ul>
                <p className="account-order-total">Total: {formatUsdAndEtb(order.total)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );

  const renderTracking = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Track Order</h3>
        <form className="account-tracker-form" onSubmit={handleTrackSubmit}>
          <input
            type="text"
            placeholder="Enter order id (example: #12AB34CD)"
            value={trackingInput}
            onChange={(event) => setTrackingInput(event.target.value)}
          />
          <button type="submit" className="btn-primary">
            Track
          </button>
        </form>
        {trackingMessage ? <p className="account-empty">{trackingMessage}</p> : null}
      </article>

      {trackedOrder ? (
        <article className="account-card">
          <div className="account-order-head">
            <div>
              <strong>Order #{shortId(trackedOrder._id)}</strong>
              <p>{formatDateTime(trackedOrder.createdAt)}</p>
            </div>
            <span className={`account-status ${statusClassName(trackedOrder.status)}`}>
              {formatStatus(trackedOrder.status)}
            </span>
          </div>
          <p className="account-order-total">Total: {formatUsdAndEtb(trackedOrder.total)}</p>
        </article>
      ) : null}
    </div>
  );

  const renderWishlist = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Wishlist</h3>
        {wishlistIds.length === 0 ? (
          <p className="account-empty">
            Your wishlist is empty. Browse products and tap the heart icon to save items.
          </p>
        ) : (
          <>
            <p className="account-empty">
              You have {wishlistIds.length} saved item{wishlistIds.length > 1 ? "s" : ""}.
            </p>
            <div className="account-chip-list">
              {wishlistIds.map((id) => (
                <span key={id} className="account-chip">
                  #{shortId(id)}
                </span>
              ))}
            </div>
          </>
        )}
        <Link to="/products" className="account-link-inline">
          Browse products
        </Link>
      </article>
    </div>
  );

  const renderAddresses = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Saved Addresses</h3>
        {savedAddress ? (
          <div className="account-address-card">
            <p>{savedAddress.fullName}</p>
            <p>{savedAddress.phone}</p>
            <p>
              {savedAddress.address}, {savedAddress.city}
            </p>
            <p>{savedAddress.zip}</p>
            {savedAddress.email ? <p>{savedAddress.email}</p> : null}
          </div>
        ) : (
          <p className="account-empty">
            No saved addresses yet. Your shipping address will appear here after checkout.
          </p>
        )}
        <Link to="/checkout" className="account-link-inline">
          Go to checkout
        </Link>
      </article>
    </div>
  );

  const renderPayments = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Payment Methods</h3>
        <div className="account-payment-list">
          <div className="account-payment-card">
            <strong>Credit / Debit Card</strong>
            <p>Add and manage cards at checkout.</p>
          </div>
          <div className="account-payment-card">
            <strong>PayPal</strong>
            <p>Quick checkout with PayPal account.</p>
          </div>
          <div className="account-payment-card">
            <strong>Mobile Money</strong>
            <p>Alternative payment for mobile-first users.</p>
          </div>
          <div className="account-payment-card">
            <strong>Bank Transfer</strong>
            <p>Use direct transfer for high-value purchases.</p>
          </div>
        </div>
      </article>
    </div>
  );

  const renderReturns = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Returns & Refunds</h3>
        {deliveredOrders.length === 0 ? (
          <p className="account-empty">
            You do not have delivered orders eligible for return yet.
          </p>
        ) : (
          <ul className="account-order-mini-list">
            {deliveredOrders.slice(0, 4).map((order) => (
              <li key={order._id}>
                <div>
                  <strong>Order #{shortId(order._id)}</strong>
                  <p>Delivered on {formatDateTime(order.createdAt)}</p>
                </div>
                <strong>{formatUsdAndEtb(order.total)}</strong>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="account-card">
        <h3>Policy Highlights</h3>
        <ul className="account-policy-list">
          <li>Return window: 30 days from delivery.</li>
          <li>Refund method: original payment method.</li>
          <li>Typical refund time: 3-7 business days after inspection.</li>
        </ul>
      </article>
    </div>
  );

  const renderSettings = () => (
    <div className="account-section-stack">
      <article className="account-card">
        <h3>Notification Preferences</h3>
        <div className="account-settings-list">
          <label className="account-toggle-row">
            <input
              type="checkbox"
              checked={preferences.orderUpdates}
              onChange={() => togglePreference("orderUpdates")}
            />
            <span>Order updates</span>
          </label>
          <label className="account-toggle-row">
            <input
              type="checkbox"
              checked={preferences.promoUpdates}
              onChange={() => togglePreference("promoUpdates")}
            />
            <span>Promotions and offers</span>
          </label>
          <label className="account-toggle-row">
            <input
              type="checkbox"
              checked={preferences.twoFactorAuth}
              onChange={() => togglePreference("twoFactorAuth")}
            />
            <span>Enable two-factor authentication</span>
          </label>
        </div>
      </article>
    </div>
  );

  const renderSection = () => {
    if (activeSection === "profile") return renderProfile();
    if (activeSection === "orders") return renderOrders();
    if (activeSection === "tracking") return renderTracking();
    if (activeSection === "wishlist") return renderWishlist();
    if (activeSection === "addresses") return renderAddresses();
    if (activeSection === "payments") return renderPayments();
    if (activeSection === "returns") return renderReturns();
    if (activeSection === "settings") return renderSettings();
    return renderDashboard();
  };

  return (
    <section className="container account-page">
      <header className="account-header">
        <div>
          <p className="account-kicker">User Dashboard</p>
          <h1>{user?.name ? `${user.name}'s Account` : "My Account"}</h1>
          <p>Manage profile, orders, tracking, wishlist, addresses, payment methods, and returns.</p>
        </div>
      </header>

      <div className="account-layout">
        <aside className="account-sidebar" aria-label="Account navigation">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`account-nav-btn${activeSection === item.id ? " active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="account-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="account-content">
          <div className="account-content-head">
            <h2>{SECTION_TITLES[activeSection] || "Dashboard"}</h2>
            <p>{orders.length} total order records</p>
          </div>
          {renderSection()}
        </div>
      </div>
    </section>
  );
};

export default AccountPage;
