export const GLOBAL_PRODUCT_DISCOUNT_PERCENT = 25;
const GLOBAL_PRODUCT_DISCOUNT_MULTIPLIER = 1 - GLOBAL_PRODUCT_DISCOUNT_PERCENT / 100;

const toAmount = (value) => Number(value || 0);
const roundPrice = (value) => Number(toAmount(value).toFixed(2));

export const getOriginalPrice = (product) =>
  roundPrice(product?.originalPrice ?? product?.price ?? product?.discountedPrice ?? 0);

export const getBaseCurrentPrice = (product) => {
  if (product?.baseCurrentPrice != null) {
    return roundPrice(product.baseCurrentPrice);
  }

  if (product?.discountedPrice != null) {
    return roundPrice(product.discountedPrice);
  }

  const original = getOriginalPrice(product);
  const discountPercent = toAmount(product?.discountPercent);

  if (discountPercent <= 0) return original;
  return roundPrice(original - (original * discountPercent) / 100);
};

export const applyGlobalProductDiscount = (price) =>
  roundPrice(toAmount(price) * GLOBAL_PRODUCT_DISCOUNT_MULTIPLIER);

export const getCurrentPrice = (product) => {
  if (product?.currentPrice != null) {
    return roundPrice(product.currentPrice);
  }
  return applyGlobalProductDiscount(getBaseCurrentPrice(product));
};

export const getDiscountPercent = (originalPrice, currentPrice) => {
  const original = roundPrice(originalPrice);
  const current = roundPrice(currentPrice);

  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};

export const getEffectiveDiscountPercent = (product) =>
  getDiscountPercent(getOriginalPrice(product), getCurrentPrice(product));
