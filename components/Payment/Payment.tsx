import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Share } from "../Share/Share";
import ErrorsUi from "../ErrorsUi/ErrorsUi";
import MenuItem from "@mui/material/MenuItem";
import styles from "./payment.module.scss";
import cx from "classnames";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import { uploadIpfs } from "../../utils/ipfs";
import {
  selectToken,
  selectTokenDecimals,
  tokensDetails,
  MAX_CHARACTER_LIMIT,
  darkenColor,
} from "../../utils/constants";
import mixpanel from "mixpanel-browser";
import { sendNotificationRequest } from "../../utils/push";
import ethLogo from "../../public/ethereum.svg";
import baseLogo from "../../public/base.png";
import arbitrumLogo from "../../public/arbitrum.png";
import optimismLogo from "../../public/optimism.png";
import allChainsLogo from "../../public/allChains.png";

export default function Payment({
  theme,
  logo,
  currencies,
  buttonColor,
}: {
  theme: string;
  logo: any;
  buttonColor: string;
  currencies: any;
}) {
  const [selectedToken, setSelectedToken] = React.useState<{
    label: string;
    logo: any;
    decimals: number;
    Ethereum: string | null;
    Sepolia: string | null;
    Optimism: string | null;
    Arbitrum: string | null;
    Base: string | null;
  }>(tokensDetails[0]);
  const [amount, setAmount] = React.useState<string>("");
  const [currencyPrefix, setCurrencyPrefix] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [characterCount, setCharacterCount] = useState(MAX_CHARACTER_LIMIT);
  const [path, setPath] = React.useState<string>("");
  const [ipfsLoading, setIpfsLoading] = React.useState<boolean>(false);
  const [chainId, setChainId] = React.useState<string>("");
  const [isEditingChain, setIsEditingChain] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [allowPayerSelectAmount, setAllowPayerSelectAmount] =
    React.useState<boolean>(false);
  const { isConnected: connected, address } = useAccount();
  const [recipientAddress, setRecipientAddress] = React.useState<string>(
    address || ""
  );
  const [isEditingRecipient, setIsEditingRecipient] =
    React.useState<boolean>(false);
  const [isEditingManualRequest, setIsEditingManualRequest] =
    React.useState<boolean>(false);
  const [newAddress, setNewAddress] = React.useState<string>(address || "");
  const { chain } = useAccount();
  const [recipientChain, setRecipientChain] = React.useState<any>(chain || "");
  const { openConnectModal } = useConnectModal();
  const [selectorVisibility, setSelectorVisibility] =
    React.useState<boolean>(false);
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

  //event handlers
  const handleAmountChange = (event: any) => {
    setAmount(event.target.value as string);
  };

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

  const handleDescriptionChange = (event: any) => {
    const inputDescription = event.target.value as string;
    if (inputDescription.length <= MAX_CHARACTER_LIMIT) {
      setDescription(inputDescription);
      setCharacterCount(MAX_CHARACTER_LIMIT - inputDescription.length);
    }
  };

  const saveNewAddress = () => {
    setBadRequest("");
    if (isAddress(newAddress)) {
      setRecipientAddress(newAddress);
      setIsEditingRecipient(false);
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

    if (amount == "0") {
      setBadRequest("The requested amount must be higher than zero");
    } else if (amount == "") {
      setBadRequest("The requested amount must be higher than zero");
    } else if (isEditingRecipient) {
      setBadRequest("Enter a valid Ethereum address");
    } else {
      try {
        setIpfsLoading(true);
        const data = {
          version: "1.0.0",
          from: recipientAddress,
          value: amount,
          description: description,
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
          Amount: amount,
          Address: address,
          Link: path,
        });
        sendNotificationRequest(
          address,
          chain?.name,
          amount,
          description,
          selectedToken.label,
          path
        );
        setPath(path);

        setIsShareActive(true);
      } catch (error) {
        console.error(error);
        setBadRequest("Oops! Something went wrong. Please try again later.");
        setIpfsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    if (connected) {
      setIsConnected(true);
      mixpanel.track("visit_woop_create_request", {
        Address: address,
      });
    } else {
      setIsConnected(false);
    }
  }, [connected]);

  React.useEffect(() => {
    if (allowPayerSelectAmount) {
      setAmount("allowPayerSelectAmount");
    }
  }, [allowPayerSelectAmount]);

  React.useEffect(() => {
    if (selectedToken.label === "USD") {
      setCurrencyPrefix("$");
    } else if (selectedToken.label === "EURO") {
      setCurrencyPrefix("€");
    } else {
      setCurrencyPrefix(""); // No prefix for crypto assets
    }
  }, [selectedToken]);

  React.useEffect(() => {
    if (chain) {
      setSelectedToken(tokensDetails[0]);
      setChainId(chain.name);
      setRecipientChain(chain);
    }
  }, [chain]);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      {selectorVisibility && (
        <section className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen z-30">
          <div
            onClick={() => setSelectorVisibility(!selectorVisibility)}
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
              Select currency
            </p>
            {tokensDetails
              .filter((token) => {
                // Default to showing all tokens if currencies is undefined or empty
                const isCurrencySelected =
                  !currencies ||
                  currencies.length === 0 ||
                  currencies.includes(token.label);

                if (!isCurrencySelected) return false;
                if (chainId === "Base" && token.label === "WBTC") return false;
                if (chainId !== "Base" && token.label === "cbBTC") return false;

                return true;
              })
              .map((token, i) => {
                return (
                  <MenuItem
                    key={token.label}
                    onClick={() => {
                      setSelectedToken(token);
                      setSelectorVisibility(!selectorVisibility);
                    }}
                    value={token.label}
                    sx={{
                      marginBottom: tokensDetails.length - 1 === i ? 0 : 1,
                    }}
                    className={`cursor-pointer hover:$
                      {theme === "dark" ? "bg-gray-700" : "bg-gray-300"} px-4 py-2 rounded-md flex items-center`}
                  >
                    <Image
                      alt={token.label}
                      src={token.logo}
                      className="mr-3"
                      width={30}
                      height={30}
                    />
                    <span
                      className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-800"
                      } font-medium`}
                    >
                      {token.label}
                    </span>
                  </MenuItem>
                );
              })}
          </div>
        </section>
      )}

      <div className="p-2 flex flex-col w-full">
        {/*Logo*/}
        <div className="flex justify-center items-center mt-2 mb-2">
          <Image
            alt="Logo"
            src={logo || "/woop_logo.png"}
            width={70}
            height={50}
          />
        </div>

        {/* Menu Selection */}
        <div className="flex items-center justify-center mt-2 mb-2 border border-gray-600 rounded-md overflow-hidden">
          {/* Receive Button */}
          <div
            className={`flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/2 h-7 text-white transition-all`}
            style={{ backgroundColor: buttonColor ? buttonColor : "#007BFF" }}
          >
            Receive
          </div>

          {/* Track Button */}
          <Link
            href="/dashboard"
            className={`flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/2 h-7 ${
              theme === "dark"
                ? "text-gray-400 hover:bg-gray-700"
                : "text-black hover:bg-gray-300"
            } transition-all`}
          >
            Track
          </Link>
        </div>

        {/* Amount Input Section */}
        <p
          className={`font-sans text-base leading-snug font-medium ${
            theme === "dark" ? "text-gray-200" : "text-slate-600"
          } mt-2 mb-2 pl-2`}
        >
          <span>Select amount</span>
        </p>

        <div
          className={`relative border rounded w-full mb-2 pb-4 pl-4 pr-4 pt-2 ${
            theme === "dark" ? "border-gray-700" : "border-black"
          }`}
        >
          <div className="flex items-center justify-between space-x-4">
            {allowPayerSelectAmount ? (
              <div className="flex-grow">
                <input
                  autoFocus={isConnected}
                  className={`border-none font-medium focus:outline-0 text-3xl w-full h-20 bg-transparent placeholder-gray-400 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                  placeholder="Open amount"
                  value={"Open amount"}
                  readOnly
                />
              </div>
            ) : (
              <div className="flex items-center flex-grow">
                {currencyPrefix && (
                  <span
                    className={`text-3xl flex items-center mr-2 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {currencyPrefix}
                  </span>
                )}
                <input
                  autoFocus={isConnected}
                  className={cx(
                    styles.mainInput,
                    `border-none font-medium text-5xl focus:outline-0 w-full h-20 bg-transparent placeholder-gray-400 ${
                      theme === "dark" ? "text-gray-400" : "text-slate-600"
                    }`
                  )}
                  type="number"
                  step="0.000000"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
            )}

            <button
              type="button"
              className={`flex items-center justify-between border px-2 rounded-full h-12 ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-black hover:bg-gray-300"
              }`}
              style={{ width: "auto", minWidth: "120px" }}
              onClick={() => setSelectorVisibility(!selectorVisibility)}
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

          {/* "Any amount" toggle below */}
          <div className="flex items-center mt-2">
            <div
              className={`w-6 h-4 rounded-full cursor-pointer ${
                allowPayerSelectAmount
                  ? theme === "dark"
                    ? "bg-slate-600"
                    : "bg-slate-400"
                  : "bg-gray-400"
              }`}
              onClick={() => setAllowPayerSelectAmount(!allowPayerSelectAmount)}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ease-in-out ${
                  allowPayerSelectAmount ? "translate-x-2" : ""
                }`}
              ></div>
            </div>
            <span
              className={`ml-2 font-sans text-sm leading-snug ${
                theme === "dark" ? "text-gray-200" : "text-black"
              }`}
            >
              Any amount
            </span>
          </div>
        </div>

        {/* Recipient Section with chain name and address recipient */}
        {(isConnected || isEditingManualRequest) && (
          <div className="mt-2 mb-2">
            <div
              className={`font-sans text-base leading-snug font-medium mb-2 pl-2 ${
                theme === "dark" ? "text-gray-200" : "text-slate-600"
              }`}
            >
              Receive funds on
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

        {/* Request Description Input Section */}
        {(isConnected || isEditingManualRequest) && (
          <div>
            <div
              className={`font-sans text-base leading-snug font-medium mt-2 mb-2 pl-2 ${
                theme === "dark" ? "text-gray-200" : "text-slate-600"
              }`}
            >
              Message <span className="text-sm font-sans">(optional)</span>
            </div>

            <div className="relative">
              <input
                autoFocus={isConnected}
                className={cx(
                  styles.mainInput,
                  `border rounded font-medium text-[22px] focus:outline-0 w-full h-12 mb-2 font-sans bg-transparent pl-4 ${
                    theme === "dark"
                      ? "text-gray-300 border-gray-700"
                      : "text-slate-600 border-black"
                  }`
                )}
                type="text"
                placeholder="e.g. pizza 🍕"
                value={description}
                onChange={handleDescriptionChange}
                maxLength={MAX_CHARACTER_LIMIT}
              />
              <div
                className={`absolute right-3 bottom-4 text-[8px] ${
                  theme === "dark" ? "text-gray-400" : "text-slate-600"
                }`}
              >
                {characterCount}
              </div>
            </div>
          </div>
        )}

        {/* Create Payment Request with link and qr code*/}
        <button
          type="button"
          className={cx(
            "flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3"
          )}
          style={{
            backgroundColor: buttonColor || "#007BFF",
            borderColor: buttonColor || "#007BFF",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = buttonColor
              ? darkenColor(buttonColor, 20) // Adjusts the hover color dynamically
              : "#0056b3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = buttonColor || "#007BFF";
          }}
          onClick={() => {
            if (isConnected || isEditingManualRequest) {
              createRequest();
            } else if (openConnectModal) {
              openConnectModal();
            } else {
              setBadRequest("Error connecting wallet. Try again.");
            }
          }}
        >
          {ipfsLoading ? (
            <>
              <svg
                className="animate-spin rounded-full w-5 h-5 mr-3 bg-black-500"
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
          ) : isConnected || isEditingManualRequest ? (
            "Continue"
          ) : (
            "Connect Wallet"
          )}
        </button>

        {!isConnected && !isEditingManualRequest && (
          <div
            className="m-2 text-xs font-sans font-medium text-slate-700 text-center cursor-pointer underline"
            onClick={() => setIsEditingManualRequest(true)}
          >
            Enter Address Manually
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
              amount={amount}
              description={description}
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
