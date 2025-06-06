import * as React from "react";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Share } from "../Share/Share";
import ErrorsUi from "../ErrorsUi/ErrorsUi";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { uploadIpfs } from "../../utils/ipfs";
import {
  selectToken,
  selectTokenDecimals,
  baseUrl,
} from "../../utils/constants";
import mixpanel from "mixpanel-browser";
import { sendNotificationRequest } from "../../utils/push";
import ethLogo from "../../public/ethereum.svg";
import baseLogo from "../../public/base.png";
import arbitrumLogo from "../../public/arbitrum.png";
import optimismLogo from "../../public/optimism.png";
import allChainsLogo from "../../public/allChains.png";
import transak from "../../public/transak-logo.png";
import bankCard from "../../public/bank_card.png";
import { QrCode } from "@mui/icons-material";
import { TelegramIcon } from "next-share";
import InstantOffRampEventsSDK from "../Transak";

// Add type for network keys
type NetworkKey =
  | "ethereum"
  | "sepolia"
  | "polygon"
  | "optimism"
  | "arbitrum"
  | "base";

export default function SelectReceiptMethod({
  onBack,
  selectedAmount,
  selectedToken,
  selectedDescription,
  theme,
  logo,
  buttonColor,
  chainId: parentChainId,
  setChainId: setParentChainId,
  networks,
  widgetAddress,
}: {
  onBack: () => void;
  selectedAmount: any;
  selectedToken: any;
  selectedDescription: string;
  theme: string;
  logo: any;
  buttonColor: string;
  currencies: any;
  chainId: string;
  setChainId: (chainId: string) => void;
  networks?: {
    [K in NetworkKey]?: boolean;
  };
  widgetAddress?: string;
}) {
  const [path, setPath] = React.useState<string>("");
  const [ipfsLoading, setIpfsLoading] = React.useState<boolean>(false);
  const [isEditingChain, setIsEditingChain] = React.useState(false);
  const [isCryptoPaymentMethod, setIsCryptoPaymentMethod] =
    React.useState(false);
  const [isBankPaymentMethod, setIsBankPaymentMethod] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const {
    chain: walletChain,
    isConnected: connected,
    address: walletAddress,
  } = useAccount();

  // Use parent chain or fallback to connected wallet's chain
  const [currentChainId, setCurrentChainId] = React.useState<string>(
    parentChainId || walletChain?.name || ""
  );
  const [recipientChainData, setRecipientChainData] = React.useState<any>(
    walletChain || ""
  );

  // Use widget address or fallback to wallet address
  const effectiveAddress = widgetAddress || walletAddress;

  const [recipientAddress, setRecipientAddress] = React.useState<string>(
    effectiveAddress || ""
  );
  const [recipientAddressTransak, setRecipientAddressTransak] =
    React.useState("");
  const [recipientNetworkTransak, setRecipientNetworkTransak] =
    React.useState("");
  const [recipientBankMethodTransak, setRecipientBankMethodTransak] =
    React.useState("");
  const [recipientBankCardNumberTransak, setRecipientBankCardNumberTransak] =
    React.useState("");

  const [loadingButton, setLoadingButton] = React.useState(null);
  const [paymentRequest, setPaymentRequest] = React.useState("");
  const [isEditingRecipient, setIsEditingRecipient] =
    React.useState<boolean>(false);
  const [newAddress, setNewAddress] = React.useState<string>(
    effectiveAddress || ""
  );
  const [isShareActive, setIsShareActive] = useState<boolean>(false);
  const [badRequest, setBadRequest] = useState<any>("");
  const MIXPANEL_ID = process.env.NEXT_PUBLIC_MIXPANEL_ID;

  // start tracking activity
  if (MIXPANEL_ID) {
    mixpanel.init(MIXPANEL_ID);
  }

  const chainLogos: Record<string, string | any> = {
    Ethereum: ethLogo,
    Sepolia: ethLogo,
    Base: baseLogo,
    Optimism: optimismLogo,
    Arbitrum: arbitrumLogo,
    Any_Chain: allChainsLogo,
  };

  function getLogo(chainId: string): string | any {
    return chainLogos[chainId] || "";
  }

  const chainSelectionMenu = (
    <div className="fixed inset-x-0 top-0 z-30 min-h-screen">
      <div
        className={`${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } w-full rounded-3xl`}
      >
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setIsEditingChain(false)}
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
                className={`${
                  theme === "dark" ? "text-gray-200" : "text-gray-600"
                }`}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <p
              className={`font-base font-semibold ${
                theme === "dark" ? "text-gray-200" : "text-slate-700"
              }`}
            >
              Select chain
            </p>
          </div>
          <div className="max-h-[450px] overflow-y-auto">
            {Object.keys(chainLogos)
              .filter((chainName) => {
                // Always show Any_Chain option
                if (chainName === "Any_Chain") return true;
                // If no networks prop, show all
                if (!networks) return true;
                // Otherwise, only show enabled networks
                const networkKey = chainName.toLowerCase() as NetworkKey;
                return networks[networkKey] === true;
              })
              .map((chainName) => (
                <div
                  key={chainName}
                  onClick={() => handleChainChange(chainName)}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg mt-1"
                >
                  <Image
                    src={getLogo(chainName)}
                    alt={`${chainName} logo`}
                    className="h-8 w-8 rounded-full"
                  />
                  <span
                    className={`ml-3 font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {chainName === "Any_Chain" ? "Any Network" : chainName}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 -z-10"
        onClick={() => setIsEditingChain(false)}
      />
    </div>
  );

  // Update chain data mapping to be consistent
  const chainData: Record<
    string,
    { id: number; name: string; displayName: string }
  > = {
    Ethereum: { id: 1, name: "Ethereum", displayName: "Ethereum" },
    Base: { id: 8453, name: "Base", displayName: "Base" },
    Optimism: { id: 10, name: "Optimism", displayName: "Optimism" },
    Arbitrum: { id: 42161, name: "Arbitrum", displayName: "Arbitrum" },
    Sepolia: { id: 11155111, name: "Sepolia", displayName: "Sepolia" },
    Any_Chain: { id: 0, name: "Any", displayName: "Any Network" },
  };

  // Function to get chain name from ID
  const getChainNameFromId = (chainId: number): string => {
    const chain = Object.values(chainData).find((c) => c.id === chainId);
    return chain
      ? Object.keys(chainData).find((key) => chainData[key].id === chainId) ||
          ""
      : "";
  };

  // Handle chain changes
  const handleChainChange = (selectedChainName: string) => {
    const selectedChain = chainData[selectedChainName];

    if (selectedChain) {
      setCurrentChainId(selectedChainName);
      setParentChainId(selectedChainName);
      setRecipientChainData({
        id: selectedChain.id,
        name: selectedChain.name,
        displayName: selectedChain.displayName,
      });

      // Ensure address persists when changing networks
      if (!recipientAddress && effectiveAddress) {
        setRecipientAddress(effectiveAddress);
        setNewAddress(effectiveAddress);
      }

      setIsEditingChain(false);
    } else {
      setBadRequest("Invalid chain selected");
    }
  };

  const saveNewAddress = () => {
    setBadRequest("");
    if (isAddress(newAddress)) {
      setRecipientAddress(newAddress);
      setIsEditingRecipient(false);
      console.log(newAddress);
      console.log(isCryptoPaymentMethod);
    } else {
      setBadRequest("Invalid Ethereum address.");
    }
  };

  const handleNewAddressChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewAddress(event.target.value);
  };

  //Create woop request and save it on IPFS
  const createRequest = async () => {
    setBadRequest("");

    if (isEditingRecipient) {
      setBadRequest("Enter a valid Ethereum address");
      return null;
    }

    // Validate required data before proceeding
    if (!recipientAddress || !recipientChainData || !selectedToken) {
      setBadRequest("Missing required data for request creation");
      return null;
    }

    try {
      setIpfsLoading(true);
      const data = {
        version: "1.0.0",
        from: recipientAddress,
        value: selectedAmount,
        selectedDescription: selectedDescription,
        decimals: selectTokenDecimals(selectedToken.label),
        network: recipientChainData.id,
        networkName: recipientChainData.name,
        tokenName: selectedToken.label,
        tokenAddress: selectToken(selectedToken.label, recipientChainData.name),
        offRamp: isBankPaymentMethod,
      };

      const path = await uploadIpfs(data).finally(() => {
        setIpfsLoading(false);
      });

      if (!path) {
        setBadRequest("Failed to generate payment link");
        return null;
      }

      mixpanel.track("create_woop", {
        Token: selectedToken.label,
        Network: recipientChainData.name,
        Amount: selectedAmount,
        Address: recipientAddress,
        Link: path,
      });

      sendNotificationRequest(
        recipientAddress,
        recipientChainData.name,
        selectedAmount,
        selectedDescription,
        selectedToken.label,
        path
      );

      setPath(path);
      return path;
    } catch (error) {
      console.error("Request creation error:", error);
      setBadRequest("Oops! Something went wrong. Please try again later.");
      setIpfsLoading(false);
      return null;
    }
  };

  const handleButtonClick = async (action: any) => {
    if (!recipientAddress) {
      setBadRequest("Recipient address is required");
      return;
    }

    setLoadingButton(action);
    try {
      const requestPath = await createRequest();
      if (!requestPath) {
        return;
      }

      const fullRequestUrl = `${baseUrl}${requestPath}`;
      setPaymentRequest(fullRequestUrl);

      const messageText = `Hey, can you please send me ${selectedAmount} ${
        selectedToken.label
      } ${
        selectedDescription ? `for ${selectedDescription}` : ""
      } using the Woop link.`;

      if (action === "telegram") {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            fullRequestUrl
          )}&text=${encodeURIComponent(messageText)}`
        );
      } else if (action === "copy") {
        try {
          await navigator.share({
            title: "Payment Request",
            text: messageText,
            url: fullRequestUrl, // Use the newly generated URL
          });
        } catch (shareError) {
          // Fallback for browsers that don't support share API
          try {
            await navigator.clipboard.writeText(
              `${messageText}\n${fullRequestUrl}`
            );
            // Optionally show a success message
            setBadRequest("Link copied to clipboard!");
            setTimeout(() => setBadRequest(""), 2000);
          } catch (clipboardError) {
            console.error("Clipboard write failed:", clipboardError);
            setBadRequest("Failed to copy link");
          }
        }
      } else if (action === "qr") {
        setIsShareActive(true);
      }
    } catch (error) {
      console.error("Error creating payment request:", error);
      setBadRequest("Failed to create payment request");
    }
    setLoadingButton(null);
  };

  // Initialize chain data when wallet chain changes
  React.useEffect(() => {
    if (walletChain) {
      const chainName = getChainNameFromId(walletChain.id);
      if (chainName) {
        setCurrentChainId(chainName);
        setParentChainId(chainName);
        setRecipientChainData({
          id: walletChain.id,
          name: chainName,
          displayName: chainData[chainName].displayName,
        });
      }
    }
  }, [walletChain, setParentChainId]);

  // Update when parent chain ID changes
  React.useEffect(() => {
    if (parentChainId && chainData[parentChainId]) {
      setCurrentChainId(parentChainId);
      setRecipientChainData({
        id: chainData[parentChainId].id,
        name: parentChainId,
        displayName: chainData[parentChainId].displayName,
      });
    }
  }, [parentChainId]);

  // Update states when address changes
  React.useEffect(() => {
    if (effectiveAddress) {
      setIsConnected(true);
      mixpanel.track("visit_woop_create_request", {
        Address: effectiveAddress,
      });
      setRecipientAddress(effectiveAddress);
      setIsEditingRecipient(false);
      setNewAddress(effectiveAddress);
    } else {
      setIsConnected(false);
    }
  }, [effectiveAddress]);

  React.useEffect(() => {
    if (recipientAddressTransak) {
      setRecipientAddress(recipientAddressTransak);
    }
  }, [recipientAddressTransak]);

  React.useEffect(() => {
    if (recipientNetworkTransak) {
      // Always use Any_Chain for bank payments
      handleChainChange("Any_Chain");
    }
  }, [recipientNetworkTransak]);

  // Ensure recipientAddress and newAddress are always in sync with effectiveAddress
  React.useEffect(() => {
    if (effectiveAddress) {
      setRecipientAddress(effectiveAddress);
      setNewAddress(effectiveAddress);
    }
  }, [effectiveAddress]);

  // Helper to calculate received amount after fees
  const getReceivedAmountPreview = useMemo(() => {
    if (!selectedAmount || isNaN(Number(selectedAmount))) return null;
    const amount = Number(selectedAmount);
    let fee = 0;
    let minFee = 0;
    let label = "";
    if (selectedToken.label === "EURO") {
      if (recipientBankMethodTransak?.toUpperCase() === "CARD") {
        minFee = 3.49;
        label = "Card Payment";
      } else {
        minFee = 3;
        label = "SEPA Bank Transfer";
      }
      const transakFee = amount * 0.0099;
      if (transakFee > minFee) {
        fee = amount * 0.0199; // 1.99% total
      } else {
        fee = minFee + amount * 0.01; // min fee + 1%
      }
    } else if (selectedToken.label === "USD") {
      minFee = 3.99;
      label = "Card Payment";
      const transakFee = amount * 0.0099;
      if (transakFee > minFee) {
        fee = amount * 0.0199;
      } else {
        fee = minFee + amount * 0.01;
      }
    } else {
      return null;
    }
    const received = Math.max(0, amount - fee);
    return { received, fee, label };
  }, [selectedAmount, selectedToken.label, recipientBankMethodTransak]);

  return (
    <>
      <div
        className={`p-2 flex flex-col w-full ${
          theme === "dark" ? "bg-[#23262F]" : "bg-white"
        }`}
      >
        {/* Payment Details */}
        <div className="rounded-xl relative p-4 w-full bg-white border border-gray-200">
          {/* Amount with Token Logo */}
          <div className="flex items-center mb-3">
            <Image
              alt={selectedToken.label}
              src={selectedToken.logo}
              width={32}
              height={32}
              className="rounded-full mr-3"
            />
            <div className="flex items-center">
              <span className="text-lg font-medium text-gray-500 mr-2">
                You requested
              </span>
              <span className="text-lg font-bold text-gray-900">
                {selectedAmount === "allowPayerSelectAmount"
                  ? "Any amount"
                  : `${selectedAmount} ${selectedToken?.label}`}
              </span>
            </div>
          </div>

          {/* Message */}
          {selectedDescription && (
            <div className="text-lg font-semibold text-gray-700 mt-2">
              For {selectedDescription}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mt-4 mb-2">
          <div
            className={`font-sans text-base leading-snug font-medium mb-2 pl-2 ${
              theme === "dark" ? "text-gray-200" : "text-slate-600"
            }`}
          >
            Get paid on
          </div>
          <div className="relative flex items-center w-full">
            {/* Crypto Wallet */}
            <div
              className={`flex items-center justify-between basis-1/2 h-12 border rounded font-medium cursor-pointer px-2 ${
                theme === "dark"
                  ? "border-gray-700 text-gray-200 hover:bg-gray-700"
                  : "border-black text-slate-600 hover:bg-gray-300"
              } ${
                isCryptoPaymentMethod
                  ? "bg-blue-100 text-black"
                  : "bg-transparent"
              }`}
              onClick={() => {
                setIsBankPaymentMethod(false);
                setIsCryptoPaymentMethod(true);
                // Initialize address if not set
                if (!recipientAddress && effectiveAddress) {
                  setRecipientAddress(effectiveAddress);
                  setNewAddress(effectiveAddress);
                }
              }}
            >
              <div className="flex items-center">
                {/* Display logo next to chain name */}
                <Image
                  src={allChainsLogo}
                  alt="Ethereum Logo"
                  className="h-7 w-7 mr-2"
                />
                <span className="font-medium">Crypto Wallet</span>
              </div>
            </div>

            {/* Space Between */}
            <div className="mx-1"></div>

            {/* Bank Card */}
            <div
              className={`flex items-center justify-between basis-1/2 h-12 border rounded font-medium px-2 ${
                theme === "dark"
                  ? "border-gray-700 text-gray-200"
                  : "border-black text-slate-600"
              } ${
                (selectedToken.label === "USD" ||
                  selectedToken.label === "EURO") &&
                Number(selectedAmount) >= 10 &&
                selectedAmount !== "allowPayerSelectAmount"
                  ? "cursor-pointer hover:bg-gray-300"
                  : "cursor-not-allowed opacity-50"
              } ${
                isBankPaymentMethod &&
                (selectedToken.label === "USD" ||
                  selectedToken.label === "EURO") &&
                Number(selectedAmount) >= 10 &&
                selectedAmount !== "allowPayerSelectAmount"
                  ? "bg-blue-100 text-black"
                  : "bg-transparent"
              }`}
              onClick={() => {
                if (
                  (selectedToken.label === "USD" ||
                    selectedToken.label === "EURO") &&
                  Number(selectedAmount) >= 10 &&
                  selectedAmount !== "allowPayerSelectAmount"
                ) {
                  setIsBankPaymentMethod(true);
                  setIsCryptoPaymentMethod(false);
                }
              }}
            >
              <div className="flex items-center">
                {/* Display logo next to bank card */}
                <Image
                  src={bankCard}
                  alt="Bank Card Logo"
                  className="h-7 w-7 mr-2"
                />
                <span className="font-medium">Bank Card</span>
              </div>
            </div>
          </div>
        </div>

        {isCryptoPaymentMethod && (
          <div className="mt-4 mb-2">
            {/* Labels for Network and Address */}
            <div className="relative flex items-center w-full">
              <div
                className={`font-sans text-base leading-snug font-medium basis-1/2 px-2 mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-slate-600"
                }`}
              >
                Network
              </div>
              <div
                className={`font-sans text-base leading-snug font-medium px-3 mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-slate-600"
                } text-right`}
              >
                Address
              </div>
            </div>

            <div className="relative flex items-center w-full">
              {/* Chain */}
              <div
                className={`flex items-center justify-between text-left basis-1/2 h-12 border rounded bg-transparent font-medium cursor-pointer px-2 ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-200 hover:bg-gray-700"
                    : "border-black text-slate-600 hover:bg-gray-300"
                }`}
                onClick={() => setIsEditingChain(!isEditingChain)}
              >
                <div className="flex items-center">
                  {/* Display logo next to chain name */}
                  <Image
                    src={getLogo(currentChainId) || allChainsLogo}
                    alt={`${currentChainId} logo`}
                    className="h-7 w-7 mr-2"
                  />
                  <span className="font-medium">
                    {!currentChainId
                      ? "Select Network"
                      : recipientChainData?.displayName || "Select Network"}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1 w-5 h-5 text-gray-500"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {isEditingChain && chainSelectionMenu}

              {/* Space Between */}
              <div className="mx-1"></div>

              {/* Address */}
              <div
                className={`flex items-center justify-between basis-1/2 h-12 border rounded bg-transparent px-2 ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-200 hover:bg-gray-700"
                    : "border-black text-slate-600 hover:bg-gray-300"
                }`}
              >
                {!isEditingRecipient ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingRecipient(true)}
                    className="flex items-center justify-between w-full h-full text-left"
                  >
                    <span className="font-medium">
                      {recipientAddress
                        ? `${recipientAddress.slice(
                            0,
                            5
                          )}...${recipientAddress.slice(-5)}`
                        : ""}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-3 w-5 h-5 text-gray-500"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                ) : (
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      className={`w-full h-8 rounded-md bg-transparent text-center font-medium placeholder-gray ${
                        theme === "dark" ? "text-gray-200" : "text-slate-600"
                      }`}
                      value={newAddress}
                      onChange={handleNewAddressChange}
                      placeholder="0x7bAc7a7..."
                    />
                    <button
                      type="button"
                      className={`ml-5 ${
                        theme === "dark" ? "text-blue-500" : "text-blue-400"
                      }`}
                      onClick={saveNewAddress}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isBankPaymentMethod && (
          <InstantOffRampEventsSDK
            onWalletAddressReceived={setRecipientAddressTransak}
            onBankCardNumberReceived={setRecipientBankCardNumberTransak}
            onBankMethodReceived={setRecipientBankMethodTransak}
            onNetworkReceived={setRecipientNetworkTransak}
          />
        )}

        {isBankPaymentMethod ? (
          recipientAddressTransak &&
          recipientBankCardNumberTransak && (
            <div className="border rounded-lg p-4 bg-gray-100 mt-2">
              {/* Section Title */}
              <div className="flex justify-between mb-4">
                <p className="text-gray-600 text-base font-medium mb-2 font-sans">
                  Send to
                </p>
                {/* Off-Ramp Partner Section */}
                <div className="flex items-center">
                  <Image
                    src={transak}
                    alt="Off-Ramp Partner"
                    className="h-9 w-28"
                  />
                </div>
              </div>

              {/* Bank Payment Method */}
              <div className="relative items-center justify-between p-3 bg-white border rounded-lg shadow">
                <div className="font-bold text-slate-600">My Bank Account</div>
                <div className="text-gray-700 font-semibold text-lg tracking-wider">
                  •••• - •••• - •••• {recipientBankCardNumberTransak.slice(-4)}
                </div>
                {/* Fee and Amount Preview - Two Column Layout */}
                {getReceivedAmountPreview && (
                  <div className="w-full mt-4 mb-2">
                    <div className="flex flex-row items-center justify-between w-full">
                      {/* Left: Amount */}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          You will receive (estimate)
                        </span>
                        <span className="text-xl font-bold text-blue-700">
                          {getReceivedAmountPreview.received.toFixed(2)}{" "}
                          {selectedToken.label}
                        </span>
                      </div>
                      {/* Right: Logos and Fee */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-1">
                          {selectedToken.label === "USD" ||
                          (selectedToken.label === "EURO" &&
                            recipientBankMethodTransak?.toUpperCase() ===
                              "CARD") ? (
                            <>
                              <img
                                src="/visa-logo.png"
                                alt="Visa"
                                className="h-5 w-9 mr-1"
                              />
                              <img
                                src="/mastercard-logo.png"
                                alt="Mastercard"
                                className="h-5 w-8 mr-1"
                              />
                            </>
                          ) : (
                            <img
                              src="/sepa-logo.png"
                              alt="SEPA"
                              className="h-7 w-9 mr-1"
                            />
                          )}
                        </div>
                        <span className="text-xs text-gray-600">
                          {selectedToken.label === "USD" &&
                            "1.99% fee, min $3.99"}
                          {selectedToken.label === "EURO" &&
                            recipientBankMethodTransak?.toUpperCase() ===
                              "CARD" &&
                            "1.99% fee, min €3.49"}
                          {selectedToken.label === "EURO" &&
                            recipientBankMethodTransak?.toUpperCase() !==
                              "CARD" &&
                            "1.99% fee, min €3"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-4">
                      More about{" "}
                      <a
                        href="https://transak.notion.site/Off-Ramp-Payment-Methods-Fees-Other-Details-b938af0e6ca24da9b7f2aa2bd040ea40"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Transak Fees here.
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {/* Labels for Network and Address */}
              <div className="mt-4">
                {/* Network & Wallet Address */}
                <div className="relative flex items-center w-full p-4 bg-white border rounded-lg">
                  {/* Chain */}
                  <div className="flex items-center basis-1/2">
                    <Image
                      src={allChainsLogo}
                      alt="All Chains Logo"
                      className="h-7 w-7 mr-2"
                    />
                    <span className="text-gray-700 font-medium text-sm">
                      Ethereum, Base, Arbitrum, Optimism
                    </span>
                  </div>

                  {/* Address */}
                  <div className="text-gray-700 text-lg basis-1/2 text-right">
                    {recipientChainData
                      ? `${recipientAddress.slice(
                          0,
                          5
                        )}...${recipientAddress.slice(-5)}`
                      : ""}
                  </div>
                </div>

                <div className="relative flex items-center w-full">
                  {/* Disclaimer */}
                  <div
                    className={`font-sans text-xs leading-snug text-gray-600 mt-1`}
                  >
                    {`*This wallet address is linked to your payment account via Transak. Any crypto sent to this address will be
                    converted and deposited into your selected payment method.`}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <></>
        )}

        {/* Create Payment Link Requests with crypto method */}
        {isCryptoPaymentMethod && (
          <div className="flex w-full mt-6 gap-2">
            {/* Telegram Button */}
            <button
              type="button"
              className="flex justify-center items-center w-2/3 border-black border font-medium text-lg h-12 rounded-full transition-all font-bold text-white"
              style={{
                backgroundColor: buttonColor || "#007BFF",
                borderColor: buttonColor || "#007BFF",
                opacity: isCryptoPaymentMethod && recipientAddress ? 1 : 0.5,
              }}
              disabled={!isCryptoPaymentMethod || !recipientAddress}
              onClick={() => handleButtonClick("telegram")}
            >
              {loadingButton === "telegram" ? (
                <>
                  <svg
                    className="animate-spin rounded-full w-5 h-5 bg-black-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      strokeDasharray="32"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </>
              ) : (
                <div className="flex items-center">
                  <TelegramIcon
                    size={29}
                    round
                    bgStyle={{ fill: "transparent" }}
                  />
                  <span className="ml-2 text-xl font-sans">Telegram</span>
                </div>
              )}
            </button>

            {/* QR Code Button */}
            <button
              type="button"
              className="flex justify-center items-center w-1/6 border-black border font-medium text-lg h-12 rounded-full transition-all font-bold text-white"
              style={{
                backgroundColor: buttonColor || "#007BFF",
                borderColor: buttonColor || "#007BFF",
                opacity: isCryptoPaymentMethod && recipientAddress ? 1 : 0.5,
              }}
              disabled={!isCryptoPaymentMethod || !recipientAddress}
              onClick={() => handleButtonClick("qr")}
            >
              {loadingButton === "qr" ? (
                <>
                  <svg
                    className="animate-spin rounded-full w-5 h-5 bg-black-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      strokeDasharray="32"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </>
              ) : (
                <QrCode />
              )}
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              className="flex justify-center items-center w-1/6 border-black border font-medium text-lg h-12 rounded-full transition-all font-bold text-white"
              style={{
                backgroundColor: buttonColor || "#007BFF",
                borderColor: buttonColor || "#007BFF",
                opacity: isCryptoPaymentMethod && recipientAddress ? 1 : 0.5,
              }}
              disabled={!isCryptoPaymentMethod || !recipientAddress}
              onClick={() => handleButtonClick("copy")}
            >
              {loadingButton === "copy" ? (
                <>
                  <svg
                    className="animate-spin rounded-full w-5 h-5 bg-black-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      strokeDasharray="32"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </>
              ) : (
                <ContentCopyIcon className="white" fontSize="medium" />
              )}
            </button>
          </div>
        )}

        {/* Create Payment Link Requests with bank method */}
        {isBankPaymentMethod && (
          <div className="flex w-full mt-6 gap-2">
            {/* Telegram Button */}
            <button
              type="button"
              className="flex justify-center items-center w-2/3 border-black border font-medium text-lg h-12 rounded-full transition-all font-bold text-white"
              style={{
                backgroundColor: buttonColor || "#007BFF",
                borderColor: buttonColor || "#007BFF",
              }}
              onClick={() => handleButtonClick("telegram")}
            >
              {loadingButton === "telegram" ? (
                <>
                  <svg
                    className="animate-spin rounded-full w-5 h-5 bg-black-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      strokeDasharray="32"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </>
              ) : (
                <div className="flex items-center">
                  <TelegramIcon
                    size={29}
                    round
                    bgStyle={{ fill: "transparent" }}
                  />
                  <span className="ml-2 text-xl font-sans">Telegram</span>
                </div>
              )}
            </button>

            {/* QR Code Button */}
            <button
              type="button"
              className="flex justify-center items-center w-1/6 border-black border font-medium text-lg h-12 rounded-full transition-all font-bold text-white"
              style={{
                backgroundColor: buttonColor || "#007BFF",
                borderColor: buttonColor || "#007BFF",
              }}
              onClick={() => handleButtonClick("qr")}
            >
              {loadingButton === "qr" ? (
                <>
                  <svg
                    className="animate-spin rounded-full w-5 h-5 bg-black-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      strokeDasharray="32"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </>
              ) : (
                <QrCode />
              )}
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              className="flex justify-center items-center w-1/6 border-black border font-medium text-lg h-12 rounded-full transition-all font-bold text-white"
              style={{
                backgroundColor: buttonColor || "#007BFF",
                borderColor: buttonColor || "#007BFF",
              }}
              onClick={() => handleButtonClick("copy")}
            >
              {loadingButton === "copy" ? (
                <>
                  <svg
                    className="items-center animate-spin rounded-full w-5 h-5 bg-black-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                      stroke="currentColor"
                      strokeDasharray="32"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                </>
              ) : (
                <ContentCopyIcon className="white" fontSize="medium" />
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mb-2">
        <ErrorsUi errorMsg={badRequest} errorNtk={""} />
      </div>

      {isShareActive && (
        <div className="absolute top-0 left-0 right-0 z-30">
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-2xl shadow-xl w-full`}
          >
            <div className="p-4">
              <Share
                visibility={setIsShareActive}
                path={path}
                amount={selectedAmount}
                description={selectedDescription}
                token={selectedToken.label}
                network={currentChainId}
                address={recipientAddress}
              />
            </div>
          </div>
          <div
            onClick={() => setIsShareActive(false)}
            className="fixed inset-0 bg-black bg-opacity-30 z-[-1]"
          />
        </div>
      )}

      <div
        className={`flex justify-center items-center mt-5 mb-2 ${
          theme === "dark" ? "bg-[#23262F]" : "bg-white"
        }`}
      >
        <span
          className={`text-xs mr-1 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          powered by
        </span>
        <Image
          alt="Woop Logo"
          src="/woop_logo.png"
          width={45}
          height={10}
          className="inline-block"
        />
      </div>
    </>
  );
}
