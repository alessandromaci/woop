import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { tokensDetails } from "../../utils/constants";
import { useAccount, useWalletClient } from "wagmi";
import { LidoSDK } from "@lidofinance/lido-ethereum-sdk";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";

const ETH_LOGO = "/ethereum.svg";
const MORPHO_LOGO = "/morpho.png";
const LIDO_LOGO = "/lido.png";

interface InvestOptionsProps {
  theme: string;
  buttonColor: string;
  onBack: () => void;
}

// Helper to parse APY string like "4-7%" or "2-4%" to a number (use min for conservative estimate)
function parseApy(apy: string) {
  if (!apy) return 0;
  const match = apy.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper to calculate earnings
function calculateEarnings(amount: number, apy: string, months: number) {
  const apyNum = parseApy(apy);
  if (!amount || !apyNum) return 0;
  // Compound interest: amount * ((1 + apy/100)^(months/12) - 1)
  const factor = Math.pow(1 + apyNum / 100, months / 12) - 1;
  return amount * factor;
}

// Helper to get token price in USD
function getTokenPriceUSD(tokenLabel: string): number {
  if (tokenLabel === "ETH") return 2200;
  if (tokenLabel === "BTC") return 100000;
  return 1; // fallback for other tokens
}

// Example: dynamic investment options per token
const tokenInvestmentOptions: Record<string, any[]> = {
  ETH: [
    {
      platformLogo: LIDO_LOGO,
      platformName: "Lido Staking",
      name: "Lido Staking",
      description: "Stake ETH and receive stETH with Lido.",
      apy: "3.5%",
      minAmount: "0.01",
      action: "lido-stake",
    },
    {
      platformLogo: MORPHO_LOGO,
      platformName: "Morpho Lending",
      name: "Lending",
      description: "Lend ETH on Morpho for yield",
      apy: "7-12%",
      minAmount: "0.5",
    },
  ],
  USDC: [
    {
      platformLogo: MORPHO_LOGO,
      platformName: "Morpho Lending",
      name: "Lending",
      description: "Lend USDC to earn interest",
      apy: "2-4%",
      risk: "Low",
      minAmount: "100",
    },
    {
      platformLogo: ETH_LOGO,
      platformName: "Stable Pool",
      name: "Stable Pool",
      description: "Provide USDC liquidity for stable returns",
      apy: "4-7%",
      risk: "Medium",
      minAmount: "500",
    },
  ],
  // fallback for other tokens
  default: [
    {
      platformLogo: ETH_LOGO,
      platformName: "Staking",
      name: "Staking",
      description: "Earn passive income by staking your assets",
      apy: "5-12%",
      risk: "Low",
      minAmount: "100",
    },
    {
      platformLogo: MORPHO_LOGO,
      platformName: "Morpho Lending",
      name: "Lending",
      description: "Lend assets for yield",
      apy: "8-15%",
      risk: "Medium",
      minAmount: "500",
    },
    {
      name: "Yield Farming",
      description: "Maximize returns through yield optimization",
      apy: "15-25%",
      risk: "High",
      minAmount: "1000",
    },
  ],
};

export default function InvestOptions({
  theme,
  buttonColor,
  onBack,
}: InvestOptionsProps) {
  // Filter out USD/EURO
  const cryptoTokens = useMemo(
    () => tokensDetails.filter((t) => t.label !== "USD" && t.label !== "EURO"),
    []
  );
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState(cryptoTokens[0]);
  const [selectorVisibility, setSelectorVisibility] = useState<boolean>(false);
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Get investment options for selected token
  const investmentOptions =
    tokenInvestmentOptions[selectedToken.label] ||
    tokenInvestmentOptions.default;

  const parsedAmount = parseFloat(amount) || 0;
  const tokenPriceUSD = getTokenPriceUSD(selectedToken.label);
  const usdValue = parsedAmount * tokenPriceUSD;

  // Modular action handler
  async function handleInvestmentAction(option: any) {
    setError(null);
    setLoadingAction(option.action);
    try {
      if (option.action === "lido-stake") {
        // Only allow on mainnet or sepolia
        if (!chain || (chain.id !== 1 && chain.id !== 11155111)) {
          setError("Lido staking is only available on Mainnet and Sepolia.");
          setLoadingAction(null);
          return;
        }
        if (!walletClient || !address) {
          setError("Connect your wallet to stake.");
          setLoadingAction(null);
          return;
        }
        // Lido SDK setup
        const lidoSDK = new LidoSDK({
          chainId: chain.id,
          rpcUrls: [walletClient.chain.rpcUrls.default.http[0]],
          web3Provider:
            typeof window !== "undefined" ? window.ethereum : undefined,
        });
        // Prepare value in wei
        const value = BigInt(Math.floor(Number(amount) * 1e18));
        // Get populated tx data
        const { to, data } = await lidoSDK.stake.stakeEthPopulateTx({
          value,
          account: address,
        });
        // Send transaction
        const hash = await walletClient.sendTransaction({
          to,
          data,
          value,
        });
        // Save to Supabase
        await supabase.from("investments").insert([
          {
            address: address.toLowerCase(),
            amount: Number(amount),
            token: "ETH",
            protocol: "Lido",
            tx_hash: hash,
            chain_id: chain.id,
            created_at: new Date().toISOString(),
            status: "open",
          },
        ]);
        // Redirect to investment overview
        router.push("/invest/overview");
      } else {
        setError("This investment action is not yet implemented.");
      }
    } catch (e: any) {
      setError(e.message || "Transaction failed");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div
      className={`min-h-full flex flex-col w-full ${
        theme === "dark" ? "bg-[#23262F]" : "bg-white"
      }`}
    >
      {/* Amount Input Section */}
      <div className="p-4">
        <p
          className={`font-sans text-base leading-snug font-medium ${
            theme === "dark" ? "text-gray-200" : "text-slate-600"
          } mb-2`}
        >
          How much would you like to invest?
        </p>

        <div
          className={`relative border rounded-lg w-full mb-4 p-4 ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-grow">
              <input
                className={`border-none font-medium text-3xl focus:outline-0 w-full bg-transparent placeholder-gray-400 ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
                type="number"
                step="0.000000"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
            <button
              onClick={() => setSelectorVisibility(true)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all min-w-[120px] max-w-[180px] ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Image
                src={selectedToken.logo}
                alt={selectedToken.label}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span
                className={`font-semibold text-base truncate ${
                  theme === "dark" ? "text-gray-200" : "text-slate-700"
                }`}
                style={{ maxWidth: 90 }}
              >
                {selectedToken.label}
              </span>
            </button>
          </div>
          <div
            className={`mt-1 text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            ≈ ${usdValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
            USD
          </div>
        </div>

        {/* Investment Options */}
        <div className="space-y-4">
          {investmentOptions.map((option, index) => {
            const earn1mToken = calculateEarnings(parsedAmount, option.apy, 1);
            const earn1m = earn1mToken * tokenPriceUSD;
            const earn1yToken = calculateEarnings(parsedAmount, option.apy, 12);
            const earn1y = earn1yToken * tokenPriceUSD;
            return (
              <div
                key={index}
                className={`border rounded-xl p-4 transition-all cursor-pointer relative ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-900"
                    : "border-gray-200 bg-white"
                } ${
                  selectedIndex === index ? "ring-2 ring-blue-500 mb-4" : "mb-4"
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl">
                    <Image
                      src={option.platformLogo || selectedToken.logo}
                      alt={option.platformName}
                      width={56}
                      height={56}
                      className="rounded-2xl"
                    />
                  </div>
                  {/* Center: Name and Network */}
                  <div className="flex flex-col flex-1 justify-center">
                    <div className="font-bold text-lg text-slate-800">
                      {option.platformName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.network || "Ethereum"}
                    </div>
                  </div>
                  {/* Right: Earnings and APR */}
                  <div className="flex flex-col items-end min-w-[90px]">
                    <div className="font-bold text-2xl text-slate-900">
                      $
                      {earn1m.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs mt-1 text-green-600 font-medium">
                      {option.apy} APY
                    </div>
                  </div>
                </div>
                {/* Buy Button for selected option */}
                {selectedIndex === index && (
                  <div className="w-full mt-6">
                    <button
                      className={`w-full py-3 rounded-full font-bold text-white shadow-lg transition-all ${
                        loadingAction === option.action || parsedAmount === 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={
                        loadingAction === option.action || parsedAmount === 0
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInvestmentAction(option);
                      }}
                    >
                      {loadingAction === option.action
                        ? "Processing..."
                        : "Buy"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {error && (
            <div className="text-red-500 text-xs mt-2">
              Something went wrong, try again
            </div>
          )}
        </div>
      </div>

      {/* Token Selector Modal - vertical list, like RequestAmount, opens from top */}
      {selectorVisibility && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectorVisibility(false)}
          />
          <div
            className={`relative w-full max-w-md mt-6 rounded-2xl shadow-xl ${
              theme === "dark" ? "bg-[#23262F]" : "bg-white"
            }`}
            style={{ zIndex: 60 }}
          >
            <div className="p-4">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setSelectorVisibility(false)}
                  className="p-2 hover:bg-gray-100 rounded-full mr-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={
                      theme === "dark" ? "text-gray-200" : "text-gray-600"
                    }
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <p
                  className={`font-base font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  Select asset
                </p>
              </div>
              <div className="max-h-[450px] overflow-y-auto">
                {cryptoTokens.map((token, i) => (
                  <div
                    key={token.label}
                    onClick={() => {
                      setSelectedToken(token);
                      setSelectorVisibility(false);
                    }}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg ${
                      i !== 0 ? "mt-1" : ""
                    } ${
                      selectedToken.label === token.label
                        ? "border border-blue-600 bg-blue-50"
                        : ""
                    }`}
                  >
                    <Image
                      alt={token.label}
                      src={token.logo}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="ml-3">
                      <div
                        className={`font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {token.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
