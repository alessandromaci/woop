import { useState, useMemo } from "react";
import Image from "next/image";
import { tokensDetails } from "../../utils/constants";

const ETH_LOGO = "/ethereum.svg";
const MORPHO_LOGO = "/morpho.png";

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
  // Simple interest for now: (amount * apy% * months/12)
  return ((amount * apyNum) / 100) * (months / 12);
}

// Example: dynamic investment options per token
const tokenInvestmentOptions: Record<string, any[]> = {
  ETH: [
    {
      platformLogo: ETH_LOGO,
      platformName: "ETH Staking",
      name: "Staking",
      description: "Earn passive income by staking ETH",
      apy: "4-7%",
      risk: "Low",
      minAmount: "0.1",
    },
    {
      platformLogo: MORPHO_LOGO,
      platformName: "Morpho Lending",
      name: "Lending",
      description: "Lend ETH on Morpho for yield",
      apy: "7-12%",
      risk: "Medium",
      minAmount: "0.5",
    },
    {
      name: "Yield Farming",
      description: "Maximize ETH returns through yield optimization",
      apy: "12-20%",
      risk: "High",
      minAmount: "1",
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
        </div>

        {/* Investment Options */}
        <div className="space-y-4">
          {investmentOptions.map((option, index) => {
            const earn1m = calculateEarnings(parsedAmount, option.apy, 1);
            const earn1y = calculateEarnings(parsedAmount, option.apy, 12);
            return (
              <div
                key={index}
                className={`flex items-center border rounded-lg p-4 gap-4 transition-all hover:border-blue-500 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                {/* Platform Logo */}
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gray-50 rounded-xl">
                  <Image
                    src={option.platformLogo || selectedToken.logo}
                    alt={option.platformName}
                    width={40}
                    height={40}
                    className="rounded-xl"
                  />
                </div>
                {/* Info */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold text-base text-slate-700">
                      {option.platformName}
                    </div>
                    <div className="font-bold text-blue-600 text-lg">
                      {option.apy} APY
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {option.description}
                  </div>
                  <div className="flex gap-6 mt-1">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-slate-700">
                        Earn in 1M:
                      </span>{" "}
                      $
                      {earn1m.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-slate-700">
                        in 1Y:
                      </span>{" "}
                      $
                      {earn1y.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
