// ==============================================================================
// Currency & Foreign Exchange Engine (TypeScript Library)
// ==============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface FxRate {
  pair: string;
  rate: number;
}

const FX_RATES: Record<string, number> = {
  "USD/USD": 1.0,
  "EUR/USD": 1.085,
  "USD/EUR": 0.921,
  "GBP/USD": 1.295,
  "USD/GBP": 0.772,
  "USD/JPY": 152.4,
  "JPY/USD": 0.00656,
  "USD/CLP": 945.5,
  "CLP/USD": 0.001057,
};

/**
 * Returns the foreign exchange rate between two currencies.
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1.0;
  const pair = `${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`;
  return FX_RATES[pair] ?? 1.0;
}

/**
 * Converts an amount from one currency to another using reference FX rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return roundToDecimals(amount * rate, 2);
}

/**
 * Formats a currency amount with ISO symbol.
 */
export function formatCurrency(amount: number, currency: string): string {
  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency.toUpperCase()} $${formattedAmount}`;
}

/**
 * Rounds a floating point number to a given precision.
 */
export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Computes a transaction fee with fixed bps (basis points).
 */
export function calculateFee(amount: number, feePercentage: number): number {
  return roundToDecimals(amount * (feePercentage / 100.0), 2);
}
