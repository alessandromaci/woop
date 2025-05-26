import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  tokensDetails,
  investmentOptions,
  selectToken,
  selectTokenDecimals,
} from "../../utils/constants";
import {
  useAccount,
  useWalletClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
  useBalance,
} from "wagmi";
import { LidoSDK } from "@lidofinance/lido-ethereum-sdk";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";
import ERC20_ABI from "../../abi/ERC20.abi.json";
import LIDO_LOGO from "../../public/lido.png";
import {
  parseApy,
  calculateEarnings,
  getTokenPriceUSD as getTokenPriceUSDAsync,
} from "../../utils/helper";

interface InvestOptionsProps {
  theme: string;
  buttonColor: string;
  onBack: () => void;
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
  ],
  // fallback for other tokens
  default: [],
};

// Helper to get token details from constants
function getTokenDetails(label: string) {
  return tokensDetails.find((t) => t.label === label);
}

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
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const router = useRouter();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [buttonStatus, setButtonStatus] = useState<
    "idle" | "processing" | "done"
  >("idle");
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number>(1);
  const [usdLoading, setUsdLoading] = useState(false);
  const [simulateArgs, setSimulateArgs] = useState<{
    address: string;
    args: any[];
  } | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Get investment options for selected token
  const lidoOption =
    selectedToken.label === "ETH" && (chain?.id === 1 || chain?.id === 8453)
      ? tokenInvestmentOptions.ETH[0]
      : null;

  const selectedTokenDetails = getTokenDetails(selectedToken.label);
  const tokenDecimals = selectTokenDecimals(selectedToken.label) ?? 18;
  const tokenAddress =
    selectToken(selectedToken.label, chain?.name || "Ethereum") || "";

  const parsedAmount = parseFloat(amount) || 0;
  const amountInDecimals =
    Number(parsedAmount) * Math.pow(10, Number(tokenDecimals));

  const {
    data: writeHash,
    writeContract,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({ hash: writeHash });

  const { data: balanceData } = useBalance({
    address,
    token:
      selectedToken.label === "ETH"
        ? undefined
        : (tokenAddress as `0x${string}`),
  });
  const userBalance = balanceData?.value
    ? Number(balanceData.value) / Math.pow(10, Number(tokenDecimals))
    : 0;
  const notEnoughBalance = parsedAmount > userBalance;

  // Call useSimulateContract at the top level
  const { data: approveSim, error: simulateError } = useSimulateContract(
    simulateArgs
      ? {
          address: simulateArgs.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: simulateArgs.args,
        }
      : undefined
  );

  // Effect to trigger contract write when simulation data is ready
  useEffect(() => {
    if (approveSim?.request && needsApproval) {
      writeContract(approveSim.request);
      setSimulateArgs(null); // reset
    }
  }, [approveSim, needsApproval]);

  // Effect to trigger deposit after approval
  useEffect(() => {
    if (isTxSuccess && needsApproval) {
      setNeedsApproval(false);
      handleDeposit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxSuccess]);

  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError);
    }
    if (error) {
      console.log(error);
    }
  }, [writeError, error]);

  useEffect(() => {
    let mounted = true;
    setUsdLoading(true);
    getTokenPriceUSDAsync(selectedToken.label)
      .then((price) => {
        if (mounted) setTokenPriceUSD(price);
      })
      .catch(() => setTokenPriceUSD(1))
      .finally(() => setUsdLoading(false));
    return () => {
      mounted = false;
    };
  }, [selectedToken.label]);

  // Deposit handler
  async function handleDeposit() {
    try {
      if (!address) {
        setError("Connect your wallet to deposit.");
        setLoadingAction(null);
        return;
      }
      // 1. Check allowance (call contract directly)
      const allowance = await (window as any).ethereum.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data: `0xdd62ed3e${address!
              .slice(2)
              .padStart(64, "0")}${selectedTokenDetails?.address
              .slice(2)
              .padStart(64, "0")}`,
          },
          "latest",
        ],
      });
      const allowanceBN = BigInt(allowance);
      const amountBN = BigInt(Math.floor(amountInDecimals));
      if (allowanceBN < amountBN) {
        setNeedsApproval(true);
        setSimulateArgs({
          address: tokenAddress,
          args: [selectedTokenDetails?.address, amountBN],
        });
      } else {
        setNeedsApproval(false);
        try {
          writeContract(selectedTokenDetails?.depositTx || "");
        } catch (e) {
          setError("Deposit failed");
          setLoadingAction(null);
        }
      }
    } catch (e) {
      setError("Deposit failed");
      setLoadingAction(null);
    }
  }

  // Helper to get current network id
  const currentNetworkId = chain?.id;

  // Filter investmentOptions for selected token and current network
  const availableOptions = investmentOptions.filter(
    (opt) =>
      opt.token === selectedToken.label &&
      (!opt.network || opt.network === currentNetworkId) &&
      (opt.type !== "lido" ||
        (selectedToken.label === "ETH" &&
          (chain?.id === 1 || chain?.id === 8453)))
  );

  // Build investment options dynamically
  const investmentOptionsDynamic = availableOptions;

  // Modular action handler (dynamic, protocol-agnostic)
  async function handleInvestmentAction(option: any) {
    setButtonStatus("processing");
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
      } else if (option.platformName === "Morpho Vault") {
        if (!chain) {
          setError("Connect your wallet to deposit.");
          setLoadingAction(null);
          return;
        }
        if (!address) {
          setError("Connect your wallet to deposit.");
          setLoadingAction(null);
          return;
        }
        // 1. Check allowance (call contract directly)
        const allowance = await (window as any).ethereum.request({
          method: "eth_call",
          params: [
            {
              to: tokenAddress,
              data: `0xdd62ed3e${address
                .slice(2)
                .padStart(64, "0")}${option.address
                .slice(2)
                .padStart(64, "0")}`,
            },
            "latest",
          ],
        });
        const allowanceBN = BigInt(allowance);
        const amountBN = BigInt(Math.floor(amountInDecimals));
        if (allowanceBN < amountBN) {
          setNeedsApproval(true);
          setSimulateArgs({
            address: tokenAddress,
            args: [option.address, amountBN],
          });
        } else {
          setNeedsApproval(false);
          try {
            writeContract(option.depositTx || "");
          } catch (e) {
            setError("Deposit failed");
            setLoadingAction(null);
          }
        }
      } else {
        setError("This investment action is not yet implemented.");
      }
    } catch (e: any) {
      setError(e.message || "Transaction failed");
      setLoadingAction(null);
      setButtonStatus("idle");
    }
  }

  // Effect to save to Supabase and redirect after deposit success
  useEffect(() => {
    const afterDeposit = async () => {
      if (isTxSuccess && writeHash && chain && address && !needsApproval) {
        await supabase.from("investments").insert([
          {
            address: address.toLowerCase(),
            amount: Number(amount),
            token: selectedToken.label,
            protocol:
              investmentOptionsDynamic[selectedIndex ?? 0]?.platformName ||
              "MorphoSteakhouse",
            tx_hash: writeHash,
            chain_id: chain.id,
            created_at: new Date().toISOString(),
            status: "open",
          },
        ]);
        setButtonStatus("done");
        setTimeout(() => {
          router.push("/invest");
        }, 2000);
      }
    };
    afterDeposit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxSuccess]);

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
          Invest Amount
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
            {/* Token Selector Button - match RequestAmount style */}
            <button
              type="button"
              className={`flex items-center justify-between border px-2 rounded-full h-12 ml-2 transition-colors ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-black hover:bg-gray-300"
              }`}
              style={{ width: "auto", minWidth: "120px" }}
              onClick={() => setSelectorVisibility(true)}
            >
              {/* Token Icon */}
              <Image
                alt={selectedToken.label}
                src={selectedToken.logo}
                width={24}
                height={24}
                className="flex-shrink-0"
              />
              {/* Token Label */}
              <p
                className={`ml-2 font-medium text-base ${
                  theme === "dark" ? "text-gray-300" : "text-slate-600"
                }`}
              >
                {selectedToken.label}
              </p>
              {/* Down Arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 w-5 h-5 text-gray-500"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div
            className={`mt-1 text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            ≈ $
            {usdLoading ? (
              <span className="animate-pulse text-gray-400">...</span>
            ) : (
              (parsedAmount * tokenPriceUSD).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })
            )}
          </div>
        </div>

        {/* Investment Options */}
        <div className="space-y-4">
          {investmentOptionsDynamic.map((option, index) => {
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
                <div className="flex items-center gap-4 items-center">
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
                  {/* Center: Name and Network - stretch to align with logo */}
                  <div
                    className="flex flex-col justify-center"
                    style={{ flex: 1, marginLeft: 0 }}
                  >
                    <div className="font-bold text-lg text-slate-800">
                      {option.platformName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.name ||
                        option.networkName ||
                        option.network ||
                        "Ethereum"}
                    </div>
                  </div>
                  {/* Right: APY top right */}
                  <div className="flex flex-col items-end min-w-[110px]">
                    <div className="flex items-center justify-end w-full">
                      <span className="text-green-600 font-bold text-base bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        {option.apy} APY
                      </span>
                    </div>
                  </div>
                </div>
                {/* Projected Earnings Box (Morpho style) */}
                <div className="flex flex-row justify-end mt-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex flex-col w-full">
                    {(() => {
                      const apyParts = option.apy
                        .split("-")
                        .map((s: string) => parseFloat(s));
                      const apyMax = apyParts[1] || apyParts[0] || 0;
                      const earn1m =
                        calculateEarnings(parsedAmount, apyMax + "%", 1) *
                        tokenPriceUSD;
                      const earn1y =
                        calculateEarnings(parsedAmount, apyMax + "%", 12) *
                        tokenPriceUSD;
                      return (
                        <>
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-1 w-full">
                            <span>
                              Projected Earnings / Month
                              <span className="block md:inline"> (USD)</span>
                            </span>
                            <span className="font-bold text-green-700">
                              + $
                              {usdLoading
                                ? "..."
                                : earn1m.toLocaleString("en-US", {
                                    maximumFractionDigits: 2,
                                  })}{" "}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 w-full">
                            <span>
                              Projected Earnings / Year
                              <span className="block md:inline"> (USD)</span>
                            </span>
                            <span className="font-bold text-green-700">
                              + $
                              {usdLoading
                                ? "..."
                                : earn1y.toLocaleString("en-US", {
                                    maximumFractionDigits: 2,
                                  })}{" "}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                {/* Buy Button for selected option */}
                {selectedIndex === index && (
                  <div className="w-full mt-6">
                    <button
                      className={`w-full py-3 rounded-full font-bold text-white shadow-lg transition-all ${
                        loadingAction === option.action ||
                        parsedAmount === 0 ||
                        buttonStatus === "processing" ||
                        notEnoughBalance
                          ? "bg-gray-300 cursor-not-allowed"
                          : buttonStatus === "done"
                          ? "bg-green-500"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={
                        loadingAction === option.action ||
                        parsedAmount === 0 ||
                        buttonStatus === "processing" ||
                        buttonStatus === "done" ||
                        notEnoughBalance
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInvestmentAction(option);
                      }}
                    >
                      {buttonStatus === "processing"
                        ? "Processing..."
                        : buttonStatus === "done"
                        ? "Done 🥳"
                        : notEnoughBalance
                        ? "Insufficient Balance"
                        : "Buy"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {(error || writeError) && (
            <div className="text-red-500 text-xs mt-2">
              Error:{" "}
              {typeof error === "string"
                ? error
                : (error as any)?.shortMessage || (error as any)?.message || ""}
              {writeError && (
                <div>
                  Write:{" "}
                  {typeof writeError === "string"
                    ? writeError
                    : (writeError as any).shortMessage ||
                      (writeError as any).message}
                </div>
              )}
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
            className={`relative w-full max-w-md rounded-2xl shadow-xl ${
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
