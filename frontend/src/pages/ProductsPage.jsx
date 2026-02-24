import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../utils/apiClient.js";
import ProductCard from "../components/ProductCard.jsx";
import { applyGlobalProductDiscount, getDiscountPercent } from "../utils/pricing.js";

const PAGE_SIZE = 8;
const WISHLIST_STORAGE_KEY = "mern_wishlist_ids";
const RATING_OPTIONS = [4, 3, 2];
const DISCOUNT_STEPS = [0, 10, 20, 30, 40, 50];
const COLOR_POOL = ["Black", "White", "Blue", "Green", "Brown", "Gray", "Beige", "Red"];
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

const hashString = (input) => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const toTitleCase = (value) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

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

const pickItems = (pool, seed, count) => {
  if (!pool.length || count <= 0) return [];
  const items = [];
  let pointer = seed;
  while (items.length < count && items.length < pool.length) {
    const value = pool[pointer % pool.length];
    if (!items.includes(value)) {
      items.push(value);
    }
    pointer += 3;
  }
  return items;
};

const buildPresentationProduct = (product) => {
  const seed = hashString(`${product._id || ""}${product.name || ""}`);
  const category = inferCategory(product.name, product.description);
  const brand = product.brand || inferBrand(product.name);

  const rating = Number(
    (product.rating ?? Math.min(5, 3.6 + ((seed % 15) + 2) / 10)).toFixed(1)
  );
  const ratingCount = Number(product.ratingCount ?? 35 + (seed % 260));
  const discountPercent = Number(
    product.discountPercent ??
      (seed % 5 === 0 ? 0 : [10, 15, 20, 25, 30, 35][seed % 6])
  );

  const originalPrice = Number(product.price ?? 0);
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

  const isFashion = category === "Fashion";
  const sizePool = isFashion ? ["XS", "S", "M", "L", "XL"] : ["One Size", "Standard"];
  const sizes = product.sizes?.length
    ? product.sizes
    : pickItems(sizePool, seed, isFashion ? 3 : 1);
  const colors = product.colors?.length ? product.colors : pickItems(COLOR_POOL, seed + 2, 3);

  const shortDescription =
    product.shortDescription ||
    product.description?.trim().slice(0, 86) ||
    "High-quality item selected for value, reliability, and everyday use.";
  const safeDescription = shortDescription.length > 86 ? `${shortDescription}...` : shortDescription;

  return {
    ...product,
    category,
    brand,
    rating,
    ratingCount,
    discountPercent: effectiveDiscountPercent,
    originalPrice,
    discountedPrice: baseCurrentPrice,
    baseCurrentPrice,
    currentPrice,
    shortDescription: safeDescription,
    sizes,
    colors,
    inStock: Number(product.stock ?? 0) > 0,
    popularityScore:
      Number(product.popularityScore ?? seed % 500) +
      (Number(product.stock ?? 0) > 0 ? 80 : 0) +
      Math.round(rating * 20),
  };
};

const getInitialWishlistIds = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(activeSearch);
  const [sortBy, setSortBy] = useState("popularity");
  const [gridView, setGridView] = useState("grid");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [availability, setAvailability] = useState("all");
  const [discountOnly, setDiscountOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);
  const [priceLimits, setPriceLimits] = useState({ min: 0, max: 0 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistIds, setWishlistIds] = useState(getInitialWishlistIds);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const isWishlistMode = searchParams.get("wishlist") === "1";

  const fetchProducts = (searchValue) => {
    const params = searchValue ? { params: { search: searchValue } } : undefined;
    apiClient
      .get("/products", params)
      .then((res) => setProducts(res.data))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    fetchProducts(activeSearch);
  }, [activeSearch]);

  const decoratedProducts = useMemo(
    () => products.map((product) => buildPresentationProduct(product)),
    [products]
  );

  useEffect(() => {
    if (!decoratedProducts.length) {
      setPriceLimits({ min: 0, max: 0 });
      setPriceRange({ min: 0, max: 0 });
      return;
    }

    const prices = decoratedProducts.map((product) => Number(product.currentPrice || 0));
    const nextMin = Math.floor(Math.min(...prices));
    const nextMax = Math.ceil(Math.max(...prices));

    setPriceLimits({ min: nextMin, max: nextMax });
    setPriceRange((previous) => {
      if (previous.max === 0 && previous.min === 0) {
        return { min: nextMin, max: nextMax };
      }
      return {
        min: Math.max(nextMin, Math.min(previous.min, nextMax)),
        max: Math.min(nextMax, Math.max(previous.max, nextMin)),
      };
    });
  }, [decoratedProducts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const brandOptions = useMemo(
    () => [...new Set(decoratedProducts.map((product) => product.brand))].sort(),
    [decoratedProducts]
  );

  const sizeOptions = useMemo(
    () => [...new Set(decoratedProducts.flatMap((product) => product.sizes || []))],
    [decoratedProducts]
  );

  const colorOptions = useMemo(
    () => [...new Set(decoratedProducts.flatMap((product) => product.colors || []))],
    [decoratedProducts]
  );

  const filteredProducts = useMemo(() => {
    return decoratedProducts.filter((product) => {
      const finalPrice = Number(product.currentPrice || 0);

      if (isWishlistMode && !wishlistIds.includes(product._id)) return false;

      if (priceLimits.max > 0) {
        if (finalPrice < priceRange.min || finalPrice > priceRange.max) return false;
      }

      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
      if (selectedRatings.length > 0 && !selectedRatings.some((min) => product.rating >= min)) {
        return false;
      }
      if (
        selectedSizes.length > 0 &&
        !selectedSizes.some((sizeValue) => product.sizes?.includes(sizeValue))
      ) {
        return false;
      }
      if (
        selectedColors.length > 0 &&
        !selectedColors.some((colorValue) => product.colors?.includes(colorValue))
      ) {
        return false;
      }

      if (availability === "in" && !product.inStock) return false;
      if (availability === "out" && product.inStock) return false;
      if (discountOnly && product.discountPercent <= 0) return false;
      if (minDiscount > 0 && product.discountPercent < minDiscount) return false;

      return true;
    });
  }, [
    availability,
    decoratedProducts,
    discountOnly,
    minDiscount,
    priceLimits.max,
    priceRange.max,
    priceRange.min,
    selectedBrands,
    selectedColors,
    selectedRatings,
    selectedSizes,
    isWishlistMode,
    wishlistIds,
  ]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((left, right) => {
      if (sortBy === "price-asc") {
        return left.currentPrice - right.currentPrice;
      }
      if (sortBy === "price-desc") {
        return right.currentPrice - left.currentPrice;
      }
      if (sortBy === "newest") {
        return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }
      return right.popularityScore - left.popularityScore;
    });
    return list;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeSearch,
    availability,
    discountOnly,
    minDiscount,
    selectedBrands,
    selectedColors,
    selectedRatings,
    selectedSizes,
    sortBy,
    priceRange.max,
    priceRange.min,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedProducts.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedProducts]);

  const toggleFilterValue = (value, selected, setter) => {
    setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const toggleWishlist = (productId) => {
    setWishlistIds((previous) =>
      previous.includes(productId)
        ? previous.filter((item) => item !== productId)
        : [...previous, productId]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setSearchParams(trimmed ? { search: trimmed } : isWishlistMode ? { wishlist: "1" } : {});
    setIsMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedRatings([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setAvailability("all");
    setDiscountOnly(false);
    setMinDiscount(0);
    setSortBy("popularity");
    setGridView("grid");
    setPriceRange({ min: priceLimits.min, max: priceLimits.max });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBrands.length > 0) count += 1;
    if (selectedRatings.length > 0) count += 1;
    if (selectedSizes.length > 0) count += 1;
    if (selectedColors.length > 0) count += 1;
    if (availability !== "all") count += 1;
    if (discountOnly) count += 1;
    if (minDiscount > 0) count += 1;
    if (priceRange.min !== priceLimits.min || priceRange.max !== priceLimits.max) count += 1;
    return count;
  }, [
    availability,
    discountOnly,
    minDiscount,
    priceLimits.max,
    priceLimits.min,
    priceRange.max,
    priceRange.min,
    selectedBrands.length,
    selectedColors.length,
    selectedRatings.length,
    selectedSizes.length,
  ]);

  const breadcrumbScope = isWishlistMode
    ? "Wishlist"
    : activeSearch
      ? toTitleCase(activeSearch)
      : "All Categories";
  const pageTitle = isWishlistMode
    ? "My Wishlist"
    : activeSearch
      ? `${breadcrumbScope} Collection`
      : "All Products";

  return (
    <section className="container">
      <header className="catalog-header">
        <p className="catalog-breadcrumb">
          <Link to="/">Home</Link>
          <span> &gt; </span>
          <span>{breadcrumbScope}</span>
          <span> &gt; </span>
          <span>Products</span>
        </p>
        <h1>{pageTitle}</h1>
      </header>

      <div className="catalog-shell">
        <aside
          id="catalog-filters"
          className={`catalog-sidebar${isMobileFiltersOpen ? " open" : " closed"}`}
        >
          <div className="filter-header">
            <h2>Filters</h2>
            <button type="button" className="btn-link" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <form onSubmit={handleSubmit} className="search-form catalog-search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button className="btn-primary" type="submit">
              Search
            </button>
          </form>

          <section className="filter-group">
            <h3>Price Range</h3>
            <p className="filter-readout">
              ${priceRange.min} - ${priceRange.max}
            </p>
            <label htmlFor="min-price">Min</label>
            <input
              id="min-price"
              type="range"
              min={priceLimits.min}
              max={priceLimits.max}
              value={priceRange.min}
              onChange={(event) => {
                const value = Number(event.target.value);
                setPriceRange((previous) => ({
                  ...previous,
                  min: Math.min(value, previous.max),
                }));
              }}
              className="range-slider"
            />
            <label htmlFor="max-price">Max</label>
            <input
              id="max-price"
              type="range"
              min={priceLimits.min}
              max={priceLimits.max}
              value={priceRange.max}
              onChange={(event) => {
                const value = Number(event.target.value);
                setPriceRange((previous) => ({
                  ...previous,
                  max: Math.max(value, previous.min),
                }));
              }}
              className="range-slider"
            />
          </section>

          <section className="filter-group">
            <h3>Brand</h3>
            <div className="filter-options">
              {brandOptions.map((brand) => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleFilterValue(brand, selectedBrands, setSelectedBrands)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="filter-group">
            <h3>Ratings</h3>
            <div className="filter-options">
              {RATING_OPTIONS.map((minimum) => (
                <label key={minimum} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedRatings.includes(minimum)}
                    onChange={() => toggleFilterValue(minimum, selectedRatings, setSelectedRatings)}
                  />
                  <span>{minimum}+ Stars</span>
                </label>
              ))}
            </div>
          </section>

          <section className="filter-group">
            <h3>Size</h3>
            <div className="filter-options">
              {sizeOptions.map((sizeValue) => (
                <label key={sizeValue} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(sizeValue)}
                    onChange={() => toggleFilterValue(sizeValue, selectedSizes, setSelectedSizes)}
                  />
                  <span>{sizeValue}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="filter-group">
            <h3>Color</h3>
            <div className="filter-options">
              {colorOptions.map((color) => (
                <label key={color} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(color)}
                    onChange={() => toggleFilterValue(color, selectedColors, setSelectedColors)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="filter-group">
            <h3>Availability</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  checked={availability === "all"}
                  onChange={() => setAvailability("all")}
                />
                <span>All</span>
              </label>
              <label className="filter-option">
                <input type="radio" checked={availability === "in"} onChange={() => setAvailability("in")} />
                <span>In Stock</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  checked={availability === "out"}
                  onChange={() => setAvailability("out")}
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </section>

          <section className="filter-group">
            <h3>Discount</h3>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(event) => setDiscountOnly(event.target.checked)}
              />
              <span>On Sale Only</span>
            </label>
            <label htmlFor="min-discount" className="discount-label">
              Minimum Discount: {minDiscount}%
            </label>
            <input
              id="min-discount"
              type="range"
              min={DISCOUNT_STEPS[0]}
              max={DISCOUNT_STEPS[DISCOUNT_STEPS.length - 1]}
              step={5}
              value={minDiscount}
              onChange={(event) => setMinDiscount(Number(event.target.value))}
              className="range-slider"
            />
          </section>
        </aside>

        <div className="catalog-main">
          <div className="catalog-toolbar">
            <p className="result-count">{sortedProducts.length} products found</p>
            <div className="toolbar-controls">
              <button
                type="button"
                className={`mobile-filter-toggle${isMobileFiltersOpen ? " active" : ""}`}
                aria-expanded={isMobileFiltersOpen}
                aria-controls="catalog-filters"
                onClick={() => setIsMobileFiltersOpen((previous) => !previous)}
              >
                {isMobileFiltersOpen ? "Hide Filters" : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
              </button>
              <label className="sort-label">
                Sort
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
              <div className="view-toggle">
                <button
                  type="button"
                  className={gridView === "grid" ? "active" : ""}
                  onClick={() => setGridView("grid")}
                >
                  Grid
                </button>
                <button
                  type="button"
                  className={gridView === "compact" ? "active" : ""}
                  onClick={() => setGridView("compact")}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>

          {pagedProducts.length === 0 ? (
            <div className="catalog-empty">
              <h3>
                {isWishlistMode ? "No items in your wishlist yet." : "No products match these filters."}
              </h3>
              <p>
                {isWishlistMode
                  ? "Tap heart icons on product cards to save favorites."
                  : "Try broadening your filters or clearing search."}
              </p>
            </div>
          ) : (
            <div className={`catalog-grid ${gridView}`}>
              {pagedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  variant="catalog"
                  showWishlist
                  isWishlisted={wishlistIds.includes(product._id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}

          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              disabled={currentPage === 1}
            >
              &larr;
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={currentPage === pageNumber ? "active" : ""}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
              disabled={currentPage === totalPages}
            >
              &rarr;
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
