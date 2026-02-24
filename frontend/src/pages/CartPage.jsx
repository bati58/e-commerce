import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="container">
        <h1>Your Cart</h1>
        <p>Your cart is empty. Start shopping!</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section className="container">
      <h1>Your Cart</h1>
      <div className="cart-grid">
        <div>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
                <div className="cart-item-controls">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item._id, Number(e.target.value))
                    }
                  />
                  <button
                    className="btn-link"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <p>Total: ${total.toFixed(2)}</p>
          <button className="btn-primary" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </section>
  );
};

export default CartPage;

