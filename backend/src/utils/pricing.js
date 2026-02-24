const LEGACY_CURRENT_PRICE_MULTIPLIER = 0.75;
const CURRENT_TO_ORIGINAL_MULTIPLIER = 0.5;
const BASE_TO_ORIGINAL_MULTIPLIER =
  LEGACY_CURRENT_PRICE_MULTIPLIER * CURRENT_TO_ORIGINAL_MULTIPLIER;

const toAmount = (value) => Number(value || 0);

export const roundMoney = (value) => Number(toAmount(value).toFixed(2));

export const getOriginalUnitPrice = (price) =>
  roundMoney(toAmount(price) * BASE_TO_ORIGINAL_MULTIPLIER);

export const getLineTotal = (unitPrice, quantity) =>
  roundMoney(toAmount(unitPrice) * Number(quantity || 0));
