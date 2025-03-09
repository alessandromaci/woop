import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Share } from "../Share/Share";
import ErrorsUi from "../ErrorsUi/ErrorsUi";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import styles from "./payment.module.scss";
import cx from "classnames";
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

export default function SelectReceiptMethod({
  onBack,
  selectedAmount,
  selectedToken,
  selectedDescription,
  theme,
  logo,
  buttonColor,
  chainId,
  setChainId,
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
  setChainId: any;
}) {
  const [path, setPath] = React.useState<string>("");
  const [ipfsLoading, setIpfsLoading] = React.useState<boolean>(false);
  const [isEditingChain, setIsEditingChain] = React.useState(false);
  const [isCryptoPaymentMethod, setIsCryptoPaymentMethod] =
    React.useState(false);
  const [isBankPaymentMethod, setIsBankPaymentMethod] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const { isConnected: connected, address } = useAccount();
  const [recipientAddress, setRecipientAddress] = React.useState<string>(
    address || ""
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
  const [newAddress, setNewAddress] = React.useState<string>(address || "");
  const { chain } = useAccount();
  const [recipientChain, setRecipientChain] = React.useState<any>(chain || "");
  const [isShareActive, setIsShareActive] = useState<boolean>(false);
  const [badRequest, setBadRequest] = useState<any>("");
  const [hydrated, setHydrated] = useState(false);
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
    <section className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen z-30">
      <div
        className={`fixed top-0 left-0 w-screen h-screen ${
          theme === "dark" ? "bg-slate-900" : "bg-slate-100"
        } opacity-30`}
      ></div>
      <div
        className={`z-20 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } rounded shadow-xl py-4 px-6 md:w-80 w-full m-5`}
      >
        <p
          className={`font-base font-semibold ${
            theme === "dark" ? "text-gray-200" : "text-slate-700"
          } pb-3 border-b mb-2`}
        >
          Select chain
        </p>
        {Object.keys(chainLogos).map((chainName) => (
          <button
            key={chainName}
            type="button"
            className={`flex items-center w-full px-4 py-3 hover:bg-gray-200 ${
              theme === "dark" ? "hover:bg-gray-700" : ""
            }`}
            onClick={() => handleChainChange(chainName)}
          >
            <Image
              src={getLogo(chainName)}
              alt={`${chainName} logo`}
              className="h-7 w-7 mr-2"
            />
            <span className="font-medium">
              {chainName === "Any_Chain" ? "Any Network" : chainName}
            </span>
          </button>
        ))}
      </div>
    </section>
  );

  // Function to handle chain selection
  const handleChainChange = (selectedChainName: string) => {
    const chainData: Record<string, { id: number; name: string }> = {
      Ethereum: { id: 1, name: "Ethereum" },
      Base: { id: 8453, name: "Base" },
      Optimism: { id: 10, name: "OP Mainnet" },
      Arbitrum: { id: 42161, name: "Arbitrum One" },
      Sepolia: { id: 11155111, name: "Sepolia" },
      Any_Chain: { id: 0, name: "Any" },
    };

    const selectedChain = chainData[selectedChainName];

    if (selectedChain) {
      setChainId(selectedChainName);
      setRecipientChain({
        id: selectedChain.id,
        name: selectedChain.name,
      });
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
    } else {
      try {
        setIpfsLoading(true);
        const data = {
          version: "1.0.0",
          from: recipientAddress,
          value: selectedAmount,
          selectedDescription: selectedDescription,
          decimals: selectTokenDecimals(selectedToken.label),
          network: recipientChain.id,
          networkName: recipientChain.name,
          tokenName: selectedToken.label,
          tokenAddress: selectToken(selectedToken.label, chain?.name),
        };

        const path = await uploadIpfs(data).finally(() => {
          setIpfsLoading(false);
        });
        mixpanel.track("create_woop", {
          Token: selectedToken.label,
          Network: chain ? chain?.name : "",
          Amount: selectedAmount,
          Address: address,
          Link: path,
        });
        sendNotificationRequest(
          recipientAddress,
          chain?.name,
          selectedAmount,
          selectedDescription,
          selectedToken.label,
          path
        );
        setPath(path);
        return path;
      } catch (error) {
        console.error(error);
        setBadRequest("Oops! Something went wrong. Please try again later.");
        setIpfsLoading(false);
        return null;
      }
    }
  };

  const handleButtonClick = async (action: any) => {
    if (!recipientAddress) return;

    setLoadingButton(action);
    try {
      const requestPath = await createRequest(); // Ensure request is created first
      const fullRequestUrl = `${baseUrl}${requestPath}`;
      setPaymentRequest(fullRequestUrl);

      if (action === "telegram") {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            fullRequestUrl
          )}&text=${encodeURIComponent(
            `Hey, can you please send me ${selectedAmount} ${
              selectedToken.label
            } ${
              selectedDescription ? `for ${selectedDescription}` : ""
            } using the Woop link.`
          )}`
        );
      } else if (action === "copy") {
        await navigator.share({
          title: "Payment Request",
          text: `Hey, can you please send me ${selectedAmount} ${
            selectedToken.label
          } ${
            selectedDescription ? `for ${selectedDescription}` : ""
          } using the Woop link.`,
          url: paymentRequest,
        });
      } else if (action === "qr") {
        setIsShareActive(true);
      }
    } catch (error) {
      console.error("Error creating payment request", error);
    }
    setLoadingButton(null);
  };

  React.useEffect(() => {
    if (connected) {
      setIsConnected(true);
      mixpanel.track("visit_woop_create_request", {
        Address: address,
      });
      setRecipientAddress(address as string);
      setIsEditingRecipient(false);
      setNewAddress(address as string);
    } else {
      setIsConnected(false);
    }
  }, [connected]);

  React.useEffect(() => {
    if (recipientAddressTransak) {
      setRecipientAddress(recipientAddressTransak);
    }
  }, [recipientAddressTransak]);

  React.useEffect(() => {
    if (recipientNetworkTransak) {
      const formattedChainName =
        recipientNetworkTransak.charAt(0).toUpperCase() +
        recipientNetworkTransak.slice(1);
      handleChainChange(formattedChainName);
    }
  }, [recipientNetworkTransak]);

  React.useEffect(() => {
    if (chain) {
      setChainId(chain.name);
      setRecipientChain(chain);
    }
  }, [chain]);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <div className="p-2 flex flex-col w-full">
        <div className="flex justify-between items-center mt-2 mb-2">
          {/*Logo*/}
          <div className="flex justify-center items-center mt-2 mb-2">
            <Image
              alt="Logo"
              src={logo || "/woop_logo.png"}
              width={90}
              height={70}
            />
          </div>
          {/* Back */}
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
              <button
                className="flex"
                onClick={() => {
                  onBack();
                }}
                type="button"
              >
                <ArrowBackIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="flex bg-gray-100 mt-4">
          {/* Payment Details */}
          <div className="rounded-3xl relative p-4 w-4/5 items-center bg-gray-100">
            {/* Amount */}
            <div className="flex items-center whitespace-nowrap">
              <span className="font-sans font-semibold text-lg text-gray-500">
                Requested amount:
              </span>
              <span className="text-lg ml-1 font-sans font-semibold text-gray-500">
                {selectedAmount === "allowPayerSelectAmount"
                  ? "any"
                  : selectedAmount || "N/A"}{" "}
                {selectedToken?.label}{" "}
              </span>
            </div>
            <div className="flex items-center">
              {/* Description */}
              <span className="font-sans text-base font-semibold text-gray-500">
                Message:
              </span>
              {selectedDescription ? (
                <h3
                  className={`text-base ml-1 font-sans font-semibold text-gray-500 ${
                    selectedDescription && selectedDescription.length > 30
                      ? "w-3/4"
                      : "w-auto"
                  }`}
                >
                  {selectedDescription}
                </h3>
              ) : (
                <h3 className="text-base ml-1 font-sans font-semibold text-gray-500 w-auto">
                  new request
                </h3>
              )}
            </div>
          </div>
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
              }}
            >
              <div className="flex items-center">
                {/* Display logo next to chain name */}
                <Image
                  src={ethLogo}
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
                selectedToken.label === "USD" || selectedToken.label === "EURO"
                  ? "cursor-pointer hover:bg-gray-300"
                  : "cursor-not-allowed opacity-50"
              } ${
                isBankPaymentMethod &&
                (selectedToken.label === "USD" ||
                  selectedToken.label === "EURO")
                  ? "bg-blue-100 text-black"
                  : "bg-transparent"
              }`}
              onClick={() => {
                if (
                  selectedToken.label === "USD" ||
                  selectedToken.label === "EURO"
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
                    src={getLogo(chainId) || allChainsLogo}
                    alt={`${chainId} logo`}
                    className="h-7 w-7 mr-2"
                  />
                  <span className="font-medium">
                    {!chainId
                      ? "Select Network"
                      : chainId === "Any_Chain"
                      ? "Any Network"
                      : chainId}
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
                      {hydrated
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
              </div>

              {/* Labels for Network and Address */}
              <div className="mt-4">
                <div className="relative flex items-center w-full">
                  {/* Network Label */}
                  <div
                    className={`font-sans text-base leading-snug font-medium mb-2 ${
                      theme === "dark" ? "text-gray-200" : "text-slate-600"
                    }`}
                  >
                    Your bank associated crypto address
                  </div>
                </div>

                {/* Network & Wallet Address */}
                <div className="relative flex items-center w-full p-4 bg-white border rounded-lg">
                  {/* Chain */}
                  <div className="flex items-center basis-1/2">
                    <Image
                      src={allChainsLogo}
                      alt="All Chains Logo"
                      className="h-7 w-7 mr-2"
                    />
                    <span className="text-gray-700 font-medium text-lg">
                      {recipientNetworkTransak}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="text-gray-700 text-lg basis-1/2 text-right">
                    {hydrated
                      ? `${recipientAddress.slice(
                          0,
                          5
                        )}...${recipientAddress.slice(-5)}`
                      : ""}
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
        <section className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen z-30">
          <div
            onClick={() => setIsShareActive(!isShareActive)}
            className="fixed top-0 left-0 w-screen h-screen bg-slate-900 opacity-30"
          ></div>
          <div
            className={cx(
              styles.shareBackground,
              "z-20 rounded-3xl shadow-xl py-2 px-2 md:w-96 m-5"
            )}
          >
            <Share
              visibility={setIsShareActive}
              path={path}
              amount={selectedAmount}
              description={selectedDescription}
              token={selectedToken.label}
              network={chainId}
              address={recipientAddress}
            />
          </div>
        </section>
      )}

      <div className="flex justify-center items-center mt-5 mb-2">
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
