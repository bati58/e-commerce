import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext.jsx";
import apiClient from "../utils/apiClient.js";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    const validate = async () => {
      try {
        const items = cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        }));

        const validateRes = await apiClient.post("/cart/validate", { items });
        const { total: validatedTotal } = validateRes.data;
        setTotal(validatedTotal);
      } catch (error) {
        console.error(error);
        alert("Unable to validate cart. Please try again.");
        navigate("/cart");
      }
    };

    validate();
  }, [cartItems, navigate]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const items = cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      await apiClient.post("/orders", {
        products: items,
        total,
      });

      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <section className="container">
      <h1>Checkout</h1>
      <p>Total: ${total.toFixed(2)}</p>
      <button className="btn-primary" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Placing order..." : "Place Order"}
      </button>
    </section>
  );
};

export default CheckoutPage;

