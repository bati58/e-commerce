const LEGACY_CURRENT_PRICE_MULTIPLIER = 0.75;
const CURRENT_TO_ORIGINAL_MULTIPLIER = 0.5;
const BASE_TO_ORIGINAL_MULTIPLIER =
  LEGACY_CURRENT_PRICE_MULTIPLIER * CURRENT_TO_ORIGINAL_MULTIPLIER;

const toAmount = (value) => Number(value || 0);
const roundPrice = (value) => Number(toAmount(value).toFixed(2));

const getBaseProductPrice = (product) =>
  roundPrice(product?.originalPrice ?? product?.price ?? product?.discountedPrice ?? 0);

export const getOriginalPrice = (product) =>
  roundPrice(getBaseProductPrice(product) * BASE_TO_ORIGINAL_MULTIPLIER);

export const getCurrentPrice = (product) => getOriginalPrice(product);

export const getDiscountPercent = () => 0;

export const getEffectiveDiscountPercent = () => 0;
