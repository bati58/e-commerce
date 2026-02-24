import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../utils/apiClient.js";
import ProductCard from "../components/ProductCard.jsx";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(activeSearch);

  const fetchProducts = (searchValue) => {
    const params = searchValue ? { params: { search: searchValue } } : undefined;
    apiClient
      .get("/products", params)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    setSearch(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    fetchProducts(activeSearch);
  }, [activeSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    setSearchParams(trimmed ? { search: trimmed } : {});
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
