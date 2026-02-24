import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useCart } from "../state/CartContext.jsx";

const CATEGORY_OPTIONS = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothes", value: "clothes" },
  { label: "Watches", value: "watch" },
  { label: "Socks", value: "socks" },
  { label: "Hats", value: "hat" },
  { label: "Eye Glasses", value: "glasses" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("USD");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = search.trim();
    navigate(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products");
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    navigate(category ? `/products?search=${encodeURIComponent(category)}` : "/products");
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const textLinkClassName = ({ isActive }) => `nav-text-link${isActive ? " active" : ""}`;
  const cartLinkClassName = ({ isActive }) => `icon-pill cart-link${isActive ? " active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-shell">
        <Link to="/" className="brand">
          My Shop
        </Link>

        <select className="nav-select" defaultValue="" onChange={handleCategoryChange}>
          <option value="">Categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <form className="nav-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="nav-search-btn">
            Search
          </button>
        </form>

        <button type="button" className="icon-pill" title="Wishlist coming soon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21c-.25 0-.5-.09-.7-.27C6.15 16.1 3 13.36 3 9.99A4.97 4.97 0 0 1 8 5a4.9 4.9 0 0 1 4 2.03A4.9 4.9 0 0 1 16 5a4.97 4.97 0 0 1 5 4.99c0 3.37-3.15 6.11-8.3 10.74-.2.18-.45.27-.7.27Z" />
          </svg>
          Wishlist
        </button>

        <NavLink to="/cart" className={cartLinkClassName}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 4h2l2.2 10.3A2 2 0 0 0 9.15 16H19a2 2 0 0 0 1.95-1.56L22 8H7.2" />
          </svg>
          Cart ({cartCount})
        </NavLink>

        <NavLink to="/products" className={textLinkClassName}>
          Products
        </NavLink>

        {user ? (
          <>
            <NavLink to="/account" className={textLinkClassName}>
              Account
            </NavLink>
            <NavLink to="/orders" className={textLinkClassName}>
              My Orders
            </NavLink>
            <button className="btn-secondary nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={textLinkClassName}>
              Login
            </NavLink>
            <NavLink to="/signup" className={textLinkClassName}>
              Sign Up
            </NavLink>
          </>
        )}

        <div className="nav-meta">
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="EN">EN</option>
            <option value="ES">ES</option>
          </select>
          <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
