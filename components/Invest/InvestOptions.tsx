import { useState, useMemo } from "react";
import Image from "next/image";
import { tokensDetails } from "../../utils/constants";

interface InvestOptionsProps {
  theme: string;
  buttonColor: string;
  onBack: () => void;
}

// Example: dynamic investment options per token
const tokenInvestmentOptions: Record<string, any[]> = {
  ETH: [
    {
      name: "Staking",
      description: "Earn passive income by staking ETH",
      apy: "4-7%",
      risk: "Low",
      minAmount: "0.1",
    },
    {
      name: "Liquidity Pool",
      description: "Provide ETH liquidity to earn trading fees",
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
      name: "Lending",
      description: "Lend USDC to earn interest",
      apy: "2-4%",
      risk: "Low",
      minAmount: "100",
    },
    {
      name: "Stable Pool",
      description: "Provide USDC liquidity for stable returns",
      apy: "4-7%",
      risk: "Medium",
      minAmount: "500",
    },
  ],
  MATIC: [
    {
      name: "Staking",
      description: "Stake MATIC for network rewards",
      apy: "5-10%",
      risk: "Low",
      minAmount: "10",
    },
    {
      name: "Liquidity Pool",
      description: "Provide MATIC liquidity to earn fees",
      apy: "8-15%",
      risk: "Medium",
      minAmount: "50",
    },
  ],
  // fallback for other tokens
  default: [
    {
      name: "Staking",
      description: "Earn passive income by staking your assets",
      apy: "5-12%",
      risk: "Low",
      minAmount: "100",
    },
    {
      name: "Liquidity Pool",
      description: "Provide liquidity to earn trading fees",
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
          {investmentOptions.map((option, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3
                  className={`font-semibold text-lg ${
                    theme === "dark" ? "text-gray-200" : "text-slate-700"
                  }`}
                >
                  {option.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    option.risk === "Low"
                      ? "bg-green-100 text-green-800"
                      : option.risk === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {option.risk} Risk
                </span>
              </div>
              <p
                className={`text-sm mb-2 ${
                  theme === "dark" ? "text-gray-400" : "text-slate-500"
                }`}
              >
                {option.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    APY:{" "}
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {option.apy}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark" ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    Min: {option.minAmount} {selectedToken.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
