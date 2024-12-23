import axios from "axios";

const API_BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API;

export const getCoinPrices = async (
  coinIds: string,
  vsCurrencies: string
): Promise<Record<string, Record<string, number>>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/simple/price`, {
      headers: {
        "x-cg-demo-api-key": API_KEY,
      },
      params: {
        ids: coinIds,
        vs_currencies: vsCurrencies,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching coin prices:", error);
    throw error;
  }
};
