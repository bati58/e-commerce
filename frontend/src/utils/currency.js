export const USD_TO_ETB_RATE = 155.42;

const etbFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const toAmount = (value) => Number(value || 0);

export const formatUsd = (value) => `$${toAmount(value).toFixed(2)}`;

export const formatEtbFromUsd = (value) =>
  `ETB ${etbFormatter.format(toAmount(value) * USD_TO_ETB_RATE)}`;

export const formatUsdAndEtb = (value) => `${formatUsd(value)} (${formatEtbFromUsd(value)})`;
