import { getCoinPrices } from "./quotes";

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

const priceCache: Record<string, { price: number; ts: number }> = {};

export async function getTokenPriceUSD(tokenLabel: string): Promise<number> {
  const now = Date.now();
  if (priceCache[tokenLabel] && now - priceCache[tokenLabel].ts < 30000) {
    return priceCache[tokenLabel].price;
  }
  try {
    const tokenIdMap: Record<string, string> = {
      ETH: "ethereum",
      BTC: "bitcoin",
      WBTC: "wrapped-bitcoin",
      USDC: "usd-coin",
      USDT: "tether",
      cbBTC: "coinbase-wrapped-btc",
    };
    const id = tokenIdMap[tokenLabel] || "ethereum";
    const data = await getCoinPrices(id, "usd");
    const price = data[id]?.usd || 1;
    priceCache[tokenLabel] = { price, ts: now };
    return price;
  } catch (e) {
    // fallback static
    if (tokenLabel === "ETH") return 2200;
    if (tokenLabel === "BTC") return 100000;
    return 1;
  }
}
