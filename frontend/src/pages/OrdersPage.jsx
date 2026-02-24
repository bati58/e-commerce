import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient.js";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiClient
      .get("/orders/my-orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span>Order #{order._id.substring(0, 8)}</span>
                <span>Status: {order.status}</span>
              </div>
              <ul>
                {order.products.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} (${item.price.toFixed(2)})
                  </li>
                ))}
              </ul>
              <p>Total: ${order.total.toFixed(2)}</p>
              <p>
                Placed on:{" "}
                {new Date(order.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrdersPage;

