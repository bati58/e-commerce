import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient.js";
import ProductCard from "../components/ProductCard.jsx";

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiClient
      .get("/products")
      .then((res) => setProducts(res.data.slice(0, 4)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="container">
      <h1>Welcome to My Shop</h1>
      <p>Modern e-commerce platform to get what you want!.</p>
      <h2>Featured Products</h2>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default HomePage;

