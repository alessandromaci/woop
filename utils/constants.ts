import ethLogo from "../public/ethereum.svg";
import wbtcLogo from "../public/wbtc.png";
import cbbtcLogo from "../public/cbbtc.png";
import usdcLogo from "../public/usdc.png";
import usdtLogo from "../public/usdt.png";
import usdLogo from "../public/usd.png";
import euroLogo from "../public/euro.png";

type Token = {
  label: string;
  logo: any;
  decimals: number;
  Ethereum: string | null;
  Sepolia: string | null;
  Optimism: string | null;
  Arbitrum: string | null;
  Base: string | null;

  [key: string]: any;
};

export const tokensDetails: Token[] = [
  {
    label: "ETH",
    logo: ethLogo,
    decimals: 18,
    Ethereum: "0x0000000000000000000000000000000000000000",
    Sepolia: "0x0000000000000000000000000000000000000000",
    Optimism: "0x0000000000000000000000000000000000000000",
    Arbitrum: "0x0000000000000000000000000000000000000000",
    Base: "0x0000000000000000000000000000000000000000",
  },
  {
    label: "USDC",
    logo: usdcLogo,
    decimals: 6,
    Ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    Sepolia: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    Optimism: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    Arbitrum: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    Base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  {
    label: "USDT",
    logo: usdtLogo,
    decimals: 6,
    Ethereum: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    Sepolia: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
    Optimism: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
    Arbitrum: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    Base: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  },
  {
    label: "WBTC",
    logo: wbtcLogo,
    decimals: 8,
    Ethereum: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    Sepolia: "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05",
    Optimism: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    Arbitrum: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    Base: "0x0000000000000000000000000000000000000000",
  },
  {
    label: "cbBTC",
    logo: cbbtcLogo,
    decimals: 8,
    Ethereum: "0x0000000000000000000000000000000000000000",
    Sepolia: "0x0000000000000000000000000000000000000000",
    Optimism: "0x0000000000000000000000000000000000000000",
    Arbitrum: "0x0000000000000000000000000000000000000000",
    Base: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  },
  {
    label: "USD",
    logo: usdLogo,
    decimals: 18,
    Ethereum: "0x0000000000000000000000000000000000000000",
    Sepolia: "0x0000000000000000000000000000000000000000",
    Optimism: "0x0000000000000000000000000000000000000000",
    Arbitrum: "0x0000000000000000000000000000000000000000",
    Base: "0x0000000000000000000000000000000000000000",
  },
  {
    label: "EURO",
    logo: euroLogo,
    decimals: 18,
    Ethereum: "0x0000000000000000000000000000000000000000",
    Sepolia: "0x0000000000000000000000000000000000000000",
    Optimism: "0x0000000000000000000000000000000000000000",
    Arbitrum: "0x0000000000000000000000000000000000000000",
    Base: "0x0000000000000000000000000000000000000000",
  },
];

export const maxAmounts: Record<string, number> = {
  USDC: 250,
  USDT: 250,
  USD: 250,
  EURO: 250,
  cbBTC: 0.003125, // 250 EUR equivalent in BTC
  WBTC: 0.003125, // 250 EUR equivalent in BTC
  ETH: 0.125, // 250 EUR equivalent in ETH
};

export const setEtherscanBase = (network: string, hash: string | undefined) => {
  if (network == "Arbitrum") {
    return `https://arbiscan.io/tx/${hash}`;
  } else if (network == "Sepolia") {
    return `https://sepolia.etherscan.io/tx/${hash}`;
  } else if (network == "Optimism") {
    return `https://optimistic.etherscan.io/tx/${hash}`;
  } else if (network == "Ethereum") {
    return `https://etherscan.io/tx/${hash}`;
  } else if (network == "Base") {
    return `https://basescan.org/tx/${hash}`;
  } else {
    return "...";
  }
};

export const setEtherscanAddress = (
  network: string,
  address: string | undefined
) => {
  if (network == "Arbitrum") {
    return `https://arbiscan.io/address/${address}`;
  } else if (network == "Sepolia") {
    return `https://sepolia.etherscan.io/address/${address}`;
  } else if (network == "Optimism") {
    return `https://optimistic.etherscan.io/address/${address}`;
  } else if (network == "Ethereum") {
    return `https://etherscan.io/address/${address}`;
  } else if (network == "Base") {
    return `https://basescan.org/address/${address}`;
  } else {
    return "...";
  }
};

export const baseUrl: string = "https://app.woop.ink/woop/";

export const telegramLink: string = "https://t.me/woop_pay";

export const pushUrl: string = "https://staging.push.org/#/inbox";

export const MAX_CHARACTER_LIMIT: number = 30;

export const networks: any = [
  "Sepolia",
  "Ethereum",
  "Optimism",
  "Arbitrum",
  "Base",
];
export const tokens: any = [
  ["ETH", "USDC", "USDT", "WBTC", "cbBTC", "USD", "EURO"],
];

// to be used for coingecko api
export const tokenIdMap: Record<string, string> = {
  ETH: "ethereum",
  cbBTC: "coinbase-wrapped-btc",
  WBTC: "wrapped-bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
};

export const selectToken = (token: any, network: any): string | undefined => {
  const flatTokens = tokens.flat();

  let selectedToken: Token | undefined;

  if (networks.includes(network) && flatTokens.includes(token)) {
    selectedToken = tokensDetails.find((t) => t.label === token);
  }

  if (selectedToken && selectedToken[network]) {
    return selectedToken[network];
  } else {
    return undefined;
  }
};

export const selectTokenDecimals = (token: any): number | undefined => {
  const tokens: string[] | undefined = [
    "ETH",
    "USDC",
    "USDT",
    "WBTC",
    "cbBTC",
    "USD",
    "EURO",
  ];

  let selectedToken: Token | undefined;

  if (token && tokens.includes(token)) {
    selectedToken = tokensDetails.find((t) => t.label === token);
  }

  if (selectedToken) {
    return selectedToken.decimals;
  } else {
    return undefined;
  }
};

export const darkenColor = (color: string, amount: number): string => {
  const num = parseInt(color.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};
