// Helper to parse APY string like "4-7%" or "2-4%" to a number (use min for conservative estimate)
export function parseApy(apy: string) {
  if (!apy) return 0;
  const match = apy.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper to calculate earnings
export function calculateEarnings(amount: number, apy: string, months: number) {
  const apyNum = parseApy(apy);
  if (!amount || !apyNum) return 0;
  // Compound interest: amount * ((1 + apy/100)^(months/12) - 1)
  const factor = Math.pow(1 + apyNum / 100, months / 12) - 1;
  return amount * factor;
}

// Helper to get token price in USD
export function getTokenPriceUSD(tokenLabel: string): number {
  if (tokenLabel === "ETH") return 2200;
  if (tokenLabel === "BTC") return 100000;
  return 1; // fallback for other tokens
}
