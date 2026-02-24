import { useMemo } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import { useCart } from "./state/CartContext.jsx";
import { formatUsdAndEtb } from "./utils/currency.js";

const App = () => {
  const { cartItems, cartToast } = useCart();
  const location = useLocation();

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.discountedPrice ?? item.price ?? 0) *
            Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const hideMobileCartBar = ["/cart", "/checkout"].includes(location.pathname);
  const showMobileCartBar = cartCount > 0 && !hideMobileCartBar;

  return (
    <div className={`app${showMobileCartBar ? " has-mobile-cart-bar" : ""}`}>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>
      {cartToast ? (
        <div className="cart-toast" role="status" aria-live="polite">
          {cartToast.message}
        </div>
      ) : null}
      {showMobileCartBar ? (
        <Link to="/cart" className="mobile-cart-bar" aria-label="Open cart">
          <div className="mobile-cart-bar-copy">
            <strong>{cartCount} items in cart</strong>
            <span>{formatUsdAndEtb(cartSubtotal)}</span>
          </div>
          <span className="mobile-cart-bar-action">View Cart</span>
        </Link>
      ) : null}
      <Footer />
    </div>
  );
};

export default App;
