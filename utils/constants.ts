import ethLogo from "../public/eth.png";
import wethLogo from "../public/weth.png";
import wbtcLogo from "../public/wbtc.png";
import cbbtcLogo from "../public/cbbtc.png";
import daiLogo from "../public/dai.png";
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
  {
    label: "WETH",
    logo: wethLogo,
    decimals: 18,
    Ethereum: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    Sepolia: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    Optimism: "0x4200000000000000000000000000000000000006",
    Arbitrum: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    Base: "0x4200000000000000000000000000000000000006",
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
    label: "DAI",
    logo: daiLogo,
    decimals: 18,
    Ethereum: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    Sepolia: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
    Optimism: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    Arbitrum: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    Base: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  },
  {
    label: "USDC",
    logo: usdcLogo,
    decimals: 6,
    Ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    Sepolia: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    Optimism: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    Arbitrum: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    Base: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
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
];

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
    return `https://goerli.etherscan.io/address/${address}`;
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

export const baseUrl: string = "https://wooppay.xyz/woop/";

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
  "ETH",
  "USD",
  "EURO",
  "WETH",
  "cbBTC",
  "WBTC",
  "DAI",
  "USDC",
  "USDT",
];

// to be used for coingecko api
export const tokenIdMap: Record<string, string> = {
  ETH: "ethereum",
  WETH: "weth",
  cbBTC: "coinbase-wrapped-btc",
  WBTC: "wrapped-bitcoin",
  DAI: "dai",
  USDC: "usd-coin",
  USDT: "tether",
};

export const selectToken = (token: any, network: any): string | undefined => {
  let selectedToken: Token | undefined;

  if (networks.includes(network) && tokens.includes(token)) {
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
    "USD",
    "EURO",
    "WETH",
    "cbBTC",
    "WBTC",
    "DAI",
    "USDC",
    "USDT",
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
