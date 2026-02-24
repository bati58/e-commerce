import { Link } from "react-router-dom";
import { useCart } from "../state/CartContext.jsx";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="card">
      <Link to={`/products/${product._id}`}>
        <img src={product.image} alt={product.name} className="card-image" />
      </Link>
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="price">${product.price.toFixed(2)}</p>
        <button
          className="btn-primary"
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

