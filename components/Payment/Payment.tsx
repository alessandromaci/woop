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
} from "../../utils/constants";
import mixpanel from "mixpanel-browser";
import { sendNotificationRequest } from "../../utils/push";

export default function Payment(props: any) {
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
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [allowPayerSelectAmount, setAllowPayerSelectAmount] =
    React.useState<boolean>(false);
  const { isConnected: connected, address } = useAccount();
  const [recipientAddress, setRecipientAddress] = React.useState<string>(
    address || ""
  );
  const [isEditingRecipient, setIsEditingRecipient] =
    React.useState<boolean>(false);
  const [newAddress, setNewAddress] = React.useState<string>(address || "");
  const { chain } = useAccount();
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

  //event handlers
  const handleAmountChange = (event: any) => {
    setAmount(event.target.value as string);
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

  //main functions
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
          network: chain?.id,
          networkName: chain?.name,
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
            className="fixed top-0 left-0 w-screen h-screen bg-slate-900 opacity-30"
          ></div>
          <div className="z-20 bg-white rounded shadow-xl py-4 px-6 md:w-80 w-full m-5">
            <p className="font-base font-semibold text-slate-700 pb-3 border-b mb-2">
              Select currency
            </p>
            {tokensDetails
              .filter((token) => {
                if (chainId == "Base") {
                  if (token.label != "WBTC") return token;
                } else {
                  if (token.label != "cbBTC") return token;
                }
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
                    className="cursor-pointer hover:bg-gray-300 px-4 py-2 rounded-md flex items-center"
                  >
                    <Image
                      alt={token.label}
                      src={token.logo}
                      className="mr-3"
                      width={30}
                      height={30}
                    />
                    <span className="text-gray-800 font-medium">
                      {token.label}
                    </span>
                  </MenuItem>
                );
              })}
          </div>
        </section>
      )}

      <div className="p-2 flex flex-col w-full relative">
        <div className="absolute left-2 -top-16 mb-2">
          <ErrorsUi errorMsg={badRequest} errorNtk={""} />
        </div>

        {/*Logo*/}
        <div className="flex justify-between items-center mt-2 mb-2">
          {/* Left Image */}
          <Image alt="Logo" src="/woop_logo.png" width={70} height={50} />

          {/* Styled Version*/}
          <p className="bg-[#007BFF] text-white text-sm font-bold px-4 py-1 rounded-full shadow-md lowercase tracking-wider">
            v1 BETA
          </p>
        </div>

        {/* Menu Selection */}
        <div className="flex items-center justify-center mt-2 mb-2 border border-gray-600 rounded-md overflow-hidden">
          {/* Receive Button */}
          <div
            className={cx(
              "flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/2 h-7 text-white bg-[#007BFF] transition-all"
            )}
          >
            Receive
          </div>

          {/* Track Button */}
          <Link
            href="/dashboard" // Replace with your dashboard route
            className={cx(
              "flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/2 h-7 text-black hover:bg-gray-300 transition-all"
            )}
          >
            Track
          </Link>
        </div>

        {/* Amount Input Section */}
        <p className="font-sans text-base leading-snug font-medium text-slate-600 mt-2 mb-2 pl-2">
          <span>Select amount</span>
        </p>

        <div className="relative border border-black rounded w-full mb-2 pb-4 pl-4 pr-4 pt-2">
          {/* Row with Input and Token Selector */}
          <div className="flex items-center justify-between space-x-4">
            {allowPayerSelectAmount ? (
              <div className="flex-grow">
                <input
                  autoFocus={isConnected}
                  className={cx(
                    styles.mainInput,
                    "border-none font-medium focus:outline-0 focus:border-gray-500 text-3xl text-gray-400 w-full h-20 bg-transparent placeholder-gray-400"
                  )}
                  placeholder="Open amount"
                  value={"Open amount"}
                  readOnly
                />
              </div>
            ) : (
              <div className="flex items-center flex-grow">
                {currencyPrefix && (
                  <span className="text-3xl text-gray-500 flex items-center mr-2">
                    {currencyPrefix}
                  </span>
                )}
                <input
                  autoFocus={isConnected}
                  className={cx(
                    styles.mainInput,
                    "border-none font-medium text-5xl text-slate-600 focus:outline-0 focus:border-gray-500 w-full h-20 bg-transparent placeholder-gray-400"
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
              className="flex items-center hover:bg-gray-300 border border-black px-2 rounded-full h-12"
              style={{ width: "auto", minWidth: "110px" }}
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
              <p className="ml-1 text-slate-600 font-medium text-base">
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
              className={`w-6 h-4 bg-gray-400 rounded-full cursor-pointer ${
                allowPayerSelectAmount ? "bg-slate-600" : ""
              }`}
              onClick={() => setAllowPayerSelectAmount(!allowPayerSelectAmount)}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ease-in-out ${
                  allowPayerSelectAmount ? "translate-x-2" : ""
                }`}
              ></div>
            </div>
            <span className="ml-2 text-black font-sans text-sm leading-snug">
              Any amount
            </span>
          </div>
        </div>

        {/* Recipient Section with chain name and address recipient */}
        <>
          <div className="mt-2 mb-2">
            <div className="font-sans text-base leading-snug font-medium text-slate-600 mb-2 pl-2">
              {`Receive funds on`}
            </div>
            <div className="flex items-center w-full">
              {/* Chain ID Section (1/3 of the width) */}
              <div className="flex items-center justify-center basis-1/3 h-12 border border-black rounded bg-transparent text-slate-600">
                <span className="font-medium">{chainId}</span>
              </div>

              {/* Space Between */}
              <div className="mx-1"></div>

              {/* Address Section (2/3 of the width) */}
              <div className="flex items-center justify-between basis-2/3 h-12 border border-black hover:bg-gray-300 rounded bg-transparent text-slate-600 px-4">
                {!isEditingRecipient ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingRecipient(true)}
                    className="flex items-center justify-between w-full h-full text-left"
                  >
                    {/* Recipient Address */}
                    <span className="font-medium">
                      {hydrated
                        ? `${recipientAddress.slice(
                            0,
                            6
                          )}...${recipientAddress.slice(-6)}`
                        : ""}
                    </span>

                    {/* Down Arrow */}
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
                      className="w-full h-8 rounded-md bg-transparent text-slate-600 text-center font-medium placeholder-gray"
                      value={newAddress}
                      onChange={handleNewAddressChange}
                      placeholder="0x..."
                    />
                    <button
                      type="button"
                      className="ml-5 text-blue-400"
                      onClick={saveNewAddress}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>

        {/* Request Description Input Section */}
        <div>
          <div className="font-sans text-base leading-snug font-medium text-slate-600 mt-2 mb-2 pl-2">
            {`Message `}
            <span className="text-sm font-sans">(optional)</span>
          </div>

          <div className="relative">
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-black rounded border font-medium text-[22px] focus:outline-0 focus:black w-full h-12 mb-2 font-sans text-slate-600 bg-transparent pl-4"
              )}
              type="text"
              placeholder="e.g. pizza 🍕"
              value={description}
              onChange={handleDescriptionChange}
              maxLength={MAX_CHARACTER_LIMIT}
            />
            <div className="absolute right-3 bottom-4 text-slate-600 text-[8px]">
              {characterCount}
            </div>
          </div>
        </div>

        {/* Create Payment Request with link and qr code*/}
        <button
          type="button"
          className={cx(
            "flex justify-center items-center border-black border font-sans font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white bg-[#007BFF] hover:bg-[#0056b3] hover:text-white hover:border-[#0056b3] mt-3"
          )}
          onClick={isConnected ? createRequest : openConnectModal}
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
          ) : isConnected ? (
            "Continue"
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>

      <div className="flex justify-center items-center mt-2 mb-2">
        <span className="text-xs text-gray-500 mr-1">powered by</span>
        <Image
          alt="Woop Logo"
          src="/woop_logo.png"
          width={45}
          height={10}
          className="inline-block"
        />
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
              token={selectedToken}
            />
          </div>
        </section>
      )}
    </>
  );
}
