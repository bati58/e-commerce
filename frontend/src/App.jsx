import { Routes, Route } from "react-router-dom";
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

const App = () => {
  const { cartToast } = useCart();

  return (
    <div className="app">
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
      <Footer />
    </div>
  );
};

export default App;
