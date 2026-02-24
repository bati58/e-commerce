import { Link } from "react-router-dom";
import { useCart } from "../state/CartContext.jsx";
import { formatUsdAndEtb } from "../utils/currency.js";

const clampRating = (value) => {
  if (Number.isNaN(value)) return 4;
  return Math.max(1, Math.min(5, value));
};

const getStarLabel = (rating) => {
  const rounded = Math.round(clampRating(rating));
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
};

const ProductCard = ({
  product,
  variant = "default",
  showWishlist = false,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const { addToCart } = useCart();

  const isCatalog = variant === "catalog";
  const originalPrice = Number(product.originalPrice ?? product.price ?? 0);
  const discountPercent = Number(product.discountPercent ?? 0);
  const discountedPrice = Number(
    product.discountedPrice ??
      (discountPercent > 0
        ? originalPrice - (originalPrice * discountPercent) / 100
        : originalPrice)
  );
  const finalPrice = Number(discountedPrice.toFixed(2));
  const rating = clampRating(Number(product.rating ?? 4.2));
  const ratingCount = Number(product.ratingCount ?? 0);
  const shortDescription =
    product.shortDescription ??
    product.description?.slice(0, 95) ??
    "Premium quality product for your lifestyle.";

  const hasDiscount = discountPercent > 0 && finalPrice < originalPrice;

  const handleWishlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product._id);
    }
  };

  return (
    <article className={`card product-card${isCatalog ? " catalog-card" : ""}`}>
      <div className="card-media">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="card-image"
            loading={isCatalog ? "lazy" : "eager"}
            decoding="async"
          />
        </Link>

        {showWishlist ? (
          <button
            type="button"
            className={`wishlist-btn${isWishlisted ? " active" : ""}`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
        ) : null}
      </div>

      <div className="card-body">
        <Link to={`/products/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        {isCatalog ? <p className="product-short-description">{shortDescription}</p> : null}

        {isCatalog ? (
          <p className="rating-row">
            <span className="rating-stars">{getStarLabel(rating)}</span>
            <span className="rating-value">{rating.toFixed(1)}</span>
            <span className="rating-count">({ratingCount})</span>
          </p>
        ) : null}

        {isCatalog ? (
          <div className="price-stack">
            <p className="price-current">{formatUsdAndEtb(finalPrice)}</p>
            {hasDiscount ? (
              <>
                <p className="price-original">{formatUsdAndEtb(originalPrice)}</p>
                <p className="discount-chip">-{discountPercent}%</p>
              </>
            ) : null}
          </div>
        ) : (
          <p className="price">{formatUsdAndEtb(originalPrice)}</p>
        )}

        <button
          className="btn-primary"
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
