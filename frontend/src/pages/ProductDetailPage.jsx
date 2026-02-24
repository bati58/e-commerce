import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../utils/apiClient.js";
import { useCart } from "../state/CartContext.jsx";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    apiClient
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <section className="container product-detail">
      <img src={product.image} alt={product.name} className="detail-image" />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="price">${product.price.toFixed(2)}</p>
        <button
          className="btn-primary"
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </section>
  );
};

export default ProductDetailPage;

