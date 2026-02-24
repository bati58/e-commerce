import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../utils/apiClient.js";
import { useCart } from "../state/CartContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { formatUsdAndEtb } from "../utils/currency.js";
import { applyGlobalProductDiscount, getDiscountPercent } from "../utils/pricing.js";

const CATEGORY_KEYWORDS = {
  Electronics: [
    "laptop",
    "phone",
    "camera",
    "airpods",
    "tablet",
    "monitor",
    "speaker",
    "headphone",
    "tv",
    "charger",
    "mouse",
    "keyboard",
  ],
  Fashion: ["shirt", "hoodie", "jean", "jacket", "shoe", "sneaker", "dress", "pant", "clothes"],
  Accessories: ["watch", "sock", "hat", "cap", "beanie", "glass", "sunglass", "wallet", "belt"],
};

const REVIEW_COMMENTS = [
  "Build quality is excellent and performance is exactly as expected.",
  "Delivery was fast, packaging was secure, and setup was simple.",
  "Great value for the price. I would definitely buy this again.",
  "Comfort and finish are solid. Looks even better in person.",
];

const REVIEWERS = ["Olivia", "Noah", "Emma", "Liam", "Sophia", "Mason", "Ava", "Lucas"];

const hashString = (input) => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const inferCategory = (name = "", description = "") => {
  const text = `${name} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }
  return "Lifestyle";
};

const inferBrand = (name = "") => {
  const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const first = cleaned.split(/\s+/).find(Boolean);
  if (!first || first.length < 2) return "Generic";
  return `${first.charAt(0).toUpperCase()}${first.slice(1)}`;
};

const getStars = (rating) => {
  const rounded = Math.max(1, Math.min(5, Math.round(Number(rating) || 4)));
  return `${"*".repeat(rounded)}${"-".repeat(5 - rounded)}`;
};

const toTitleCase = (value = "") =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const buildEnhancedProduct = (product) => {
  const seed = hashString(`${product._id || ""}${product.name || ""}`);
  const category = inferCategory(product.name, product.description);
  const brand = product.brand || inferBrand(product.name);
  const rating = Number((product.rating ?? Math.min(5, 4 + (seed % 8) / 10)).toFixed(1));
  const reviewCount = Number(product.reviewCount ?? 85 + (seed % 470));
  const discountPercent = Number(
    product.discountPercent ?? (seed % 4 === 0 ? 0 : [10, 12, 15, 18, 20][seed % 5])
  );
  const originalPrice = Number(product.price || 0);
  const baseCurrentPrice = Number(
    (
      product.discountedPrice ??
      (discountPercent > 0
        ? originalPrice - (originalPrice * discountPercent) / 100
        : originalPrice)
    ).toFixed(2)
  );
  const currentPrice = applyGlobalProductDiscount(baseCurrentPrice);
  const effectiveDiscountPercent = getDiscountPercent(originalPrice, currentPrice);

  const colorOptions =
    product.colors?.length > 0
      ? product.colors
      : category === "Electronics"
      ? ["Black", "Silver", "Blue"]
      : ["Black", "White", "Brown"];

  const storageOptions =
    product.storageOptions?.length > 0
      ? product.storageOptions
      : category === "Electronics"
      ? ["256GB", "512GB", "1TB"]
      : ["Standard", "Premium"];

  const galleryImages =
    product.images?.length > 0
      ? product.images
      : [product.image, product.image, product.image].filter(Boolean);

  const skuSeed = (seed % 90000) + 10000;
  const specs = {
    Brand: brand,
    Category: category,
    SKU: `SKU-${skuSeed}`,
    Material: category === "Fashion" ? "Premium cotton blend" : "Engineered composite",
    Warranty: "12 Months",
    "In The Box": "Product unit, quick guide, safety card",
  };

  const reviewItems = Array.from({ length: 4 }, (_, index) => {
    const commentSeed = seed + index * 3;
    return {
      id: `${product._id}-review-${index}`,
      name: REVIEWERS[commentSeed % REVIEWERS.length],
      rating: Number((3.8 + (commentSeed % 12) / 10).toFixed(1)),
      comment: REVIEW_COMMENTS[commentSeed % REVIEW_COMMENTS.length],
      date: `2026-0${(index % 4) + 1}-1${index}`,
      photos: [
        `https://picsum.photos/seed/${product._id}-review-${index}-1/220/150`,
        `https://picsum.photos/seed/${product._id}-review-${index}-2/220/150`,
      ],
    };
  });

  return {
    ...product,
    category,
    brand,
    rating,
    reviewCount,
    discountPercent: effectiveDiscountPercent,
    originalPrice,
    discountedPrice: baseCurrentPrice,
    baseCurrentPrice,
    currentPrice,
    colors: colorOptions,
    storageOptions,
    galleryImages,
    specs,
    reviewItems,
    inStock: Number(product.stock || 0) > 0,
  };
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([apiClient.get(`/products/${id}`), apiClient.get("/products")])
      .then(([detailResponse, listResponse]) => {
        if (!mounted) return;
        setProduct(detailResponse.data);
        setAllProducts(Array.isArray(listResponse.data) ? listResponse.data : []);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const detailedProduct = useMemo(
    () => (product ? buildEnhancedProduct(product) : null),
    [product]
  );

  const relatedProducts = useMemo(() => {
    if (!detailedProduct) return [];
    return allProducts
      .filter((item) => item._id !== detailedProduct._id)
      .map((item) => buildEnhancedProduct(item))
      .filter((item) => item.category === detailedProduct.category)
      .slice(0, 8);
  }, [allProducts, detailedProduct]);

  const frequentlyBought = useMemo(() => relatedProducts.slice(0, 2), [relatedProducts]);

  useEffect(() => {
    if (!detailedProduct) return;
    setActiveImage(detailedProduct.galleryImages[0] || "");
    setSelectedColor(detailedProduct.colors[0] || "");
    setSelectedStorage(detailedProduct.storageOptions[0] || "");
    setQuantity(1);
    setActiveTab("description");
  }, [detailedProduct?._id]);

  const bundleTotal = useMemo(() => {
    if (!detailedProduct) return 0;
    return [detailedProduct, ...frequentlyBought].reduce(
      (sum, item) => sum + Number(item.currentPrice || 0),
      0
    );
  }, [detailedProduct, frequentlyBought]);

  const getCartPayload = () => {
    if (!detailedProduct) return null;
    const variantLabel = [selectedColor, selectedStorage].filter(Boolean).join(" / ");
    return {
      ...detailedProduct,
      name: variantLabel ? `${detailedProduct.name} (${variantLabel})` : detailedProduct.name,
      price: detailedProduct.currentPrice,
      selectedColor,
      selectedStorage,
    };
  };

  const handleAddToCart = () => {
    const payload = getCartPayload();
    if (!payload) return;
    addToCart(payload, quantity);
  };

  const handleBuyNow = () => {
    const payload = getCartPayload();
    if (!payload) return;
    addToCart(payload, quantity);
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      navigate("/checkout");
    }
  };

  const handleAddBundle = () => {
    handleAddToCart();
    frequentlyBought.forEach((item) => {
      addToCart(
        {
          ...item,
          price: item.currentPrice,
        },
        1
      );
    });
  };

  if (loading) {
    return <section className="container">Loading product details...</section>;
  }

  if (!detailedProduct) {
    return <section className="container">Product not found.</section>;
  }

  return (
    <section className="container product-detail-page">
      <p className="detail-breadcrumb">
        <Link to="/">Home</Link>
        <span> &gt; </span>
        <Link to={`/products?search=${encodeURIComponent(detailedProduct.category)}`}>
          {detailedProduct.category}
        </Link>
        <span> &gt; </span>
        <span>{toTitleCase(detailedProduct.name)}</span>
      </p>

      <section className="detail-top">
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img src={activeImage || detailedProduct.image} alt={detailedProduct.name} />
          </div>

          <div className="detail-thumb-row">
            {detailedProduct.galleryImages.map((image, index) => (
              <button
                key={`${detailedProduct._id}-thumb-${index}`}
                type="button"
                className={activeImage === image ? "active" : ""}
                onClick={() => setActiveImage(image)}
              >
                <img src={image} alt={`${detailedProduct.name} view ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <article className="detail-info-card">
          <h1>{detailedProduct.name}</h1>
          <p className="detail-rating">
            <span>{getStars(detailedProduct.rating)}</span>
            <strong>{detailedProduct.rating.toFixed(1)}</strong>
            <span>({detailedProduct.reviewCount} reviews)</span>
          </p>

          <div className="detail-price-row">
            <p className="detail-price">{formatUsdAndEtb(detailedProduct.currentPrice)}</p>
            {detailedProduct.discountPercent > 0 ? (
              <>
                <p className="detail-price-old">{formatUsdAndEtb(detailedProduct.originalPrice)}</p>
                <p className="detail-discount">-{detailedProduct.discountPercent}%</p>
              </>
            ) : null}
          </div>

          <p className={`stock-tag ${detailedProduct.inStock ? "in" : "out"}`}>
            {detailedProduct.inStock
              ? `In stock (${detailedProduct.stock} available)`
              : "Currently out of stock"}
          </p>

          <div className="variant-group">
            <h3>Color</h3>
            <div className="variant-options">
              {detailedProduct.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={selectedColor === color ? "active" : ""}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="variant-group">
            <h3>Storage</h3>
            <div className="variant-options">
              {detailedProduct.storageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={selectedStorage === option ? "active" : ""}
                  onClick={() => setSelectedStorage(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-block">
            <h3>Quantity</h3>
            <div className="quantity-control">
              <button
                type="button"
                onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={Math.max(1, Number(detailedProduct.stock || 1))}
                value={quantity}
                onChange={(event) => {
                  const next = Number(event.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, next), Number(detailedProduct.stock || 1)));
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity((previous) =>
                    Math.min(Math.max(1, Number(detailedProduct.stock || 1)), previous + 1)
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={!detailedProduct.inStock}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!detailedProduct.inStock}
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>

          <div className="detail-benefits">
            <p>Free delivery within 3-5 business days</p>
            <p>Secure payment and encrypted checkout</p>
            <p>Easy 7-day return policy</p>
          </div>
        </article>
      </section>

      <section className="detail-tabs">
        <div className="tab-buttons">
          <button
            type="button"
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            type="button"
            className={activeTab === "specifications" ? "active" : ""}
            onClick={() => setActiveTab("specifications")}
          >
            Specifications
          </button>
          <button
            type="button"
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
        </div>

        <div className="tab-panel">
          {activeTab === "description" ? (
            <div className="description-panel">
              <p>{detailedProduct.description}</p>
              <h3>Shipping Info</h3>
              <ul>
                <li>Standard delivery: 3-5 business days.</li>
                <li>Express delivery available at checkout.</li>
              </ul>
              <h3>Return Policy</h3>
              <ul>
                <li>Return or exchange eligible within 7 days of delivery.</li>
                <li>Item should be unused and in original packaging.</li>
              </ul>
            </div>
          ) : null}

          {activeTab === "specifications" ? (
            <div className="spec-grid">
              {Object.entries(detailedProduct.specs).map(([label, value]) => (
                <div key={label} className="spec-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "reviews" ? (
            <div className="review-list">
              {detailedProduct.reviewItems.map((review) => (
                <article key={review.id} className="review-card">
                  <p className="review-header">
                    <strong>{review.name}</strong>
                    <span>{review.date}</span>
                  </p>
                  <p className="review-stars">{getStars(review.rating)} ({review.rating.toFixed(1)})</p>
                  <p>{review.comment}</p>
                  <div className="review-photos">
                    {review.photos.map((photo) => (
                      <img key={photo} src={photo} alt={`${review.name} review visual`} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-head">
          <h2>Related Products</h2>
        </div>
        {relatedProducts.length === 0 ? (
          <p className="section-note">Related products will appear here.</p>
        ) : (
          <div className="product-rail">
            {relatedProducts.map((item) => (
              <ProductCard key={`related-${item._id}`} product={item} />
            ))}
          </div>
        )}
      </section>

      <section className="detail-section frequently-bought">
        <div className="section-head">
          <h2>Frequently Bought Together</h2>
        </div>
        {frequentlyBought.length === 0 ? (
          <p className="section-note">Bundle recommendations will appear here.</p>
        ) : (
          <>
            <div className="fbt-list">
              <article className="fbt-item">
                <img src={detailedProduct.image} alt={detailedProduct.name} />
                <p>{detailedProduct.name}</p>
              </article>
              {frequentlyBought.map((item) => (
                <article key={`fbt-${item._id}`} className="fbt-item">
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                </article>
              ))}
            </div>
            <div className="fbt-footer">
              <p>
                Bundle Price: <strong>{formatUsdAndEtb(bundleTotal)}</strong>
              </p>
              <button type="button" className="btn-primary" onClick={handleAddBundle}>
                Add Bundle to Cart
              </button>
            </div>
          </>
        )}
      </section>
    </section>
  );
};

export default ProductDetailPage;
