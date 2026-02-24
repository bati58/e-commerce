import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useCart } from "../state/CartContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">
          My Shop
        </Link>
        <nav>
          <NavLink to="/products">Products</NavLink>
        </nav>
      </div>
      <div className="navbar-right">
        <NavLink to="/cart" className="cart-link">
          Cart ({cartCount})
        </NavLink>
        {user ? (
          <>
            <NavLink to="/orders">My Orders</NavLink>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

