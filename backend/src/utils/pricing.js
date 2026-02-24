export const GLOBAL_PRODUCT_DISCOUNT_PERCENT = 25;
const GLOBAL_PRODUCT_DISCOUNT_MULTIPLIER = 1 - GLOBAL_PRODUCT_DISCOUNT_PERCENT / 100;

const toAmount = (value) => Number(value || 0);

export const roundMoney = (value) => Number(toAmount(value).toFixed(2));

export const getDiscountedUnitPrice = (price) =>
  roundMoney(toAmount(price) * GLOBAL_PRODUCT_DISCOUNT_MULTIPLIER);

export const getLineTotal = (unitPrice, quantity) =>
  roundMoney(toAmount(unitPrice) * Number(quantity || 0));
