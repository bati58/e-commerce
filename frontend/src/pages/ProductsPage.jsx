import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient.js";
import ProductCard from "../components/ProductCard.jsx";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchProducts = () => {
    const params = search ? { params: { search } } : undefined;
    apiClient
      .get("/products", params)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <section className="container">
      <div className="page-header">
        <h1>All Products</h1>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default ProductsPage;

