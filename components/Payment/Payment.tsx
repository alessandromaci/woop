import * as React from "react";
import { useState } from "react";
import Image from "next/image";

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
          <div className="z-20 bg-white rounded shadow-xl py-2 px-2 md:w-80 w-full m-5">
            <p className="font-base font-semibold text-slate-600 pl-4 pb-3 pt-2 border-b mb-3">
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
                    className="cursor-pointer hover:border-black hover:bg-gray-200 rounded p-1"
                  >
                    <div className="flex items-center">
                      <Image
                        alt={token.label}
                        src={token.logo}
                        className="p-1"
                        width={40}
                        height={40}
                      />
                      <span className="ml-3 text-slate-600 font-base font-semibold">
                        {token.label}
                      </span>
                    </div>
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

        {/* Logo Section */}
        <div className="flex justify-center mt-2 mb-2">
          <Image alt="Logo" src="/woop_logo.png" width={100} height={80} />
        </div>

        {/* Recipient Section with chain name and address recipient */}
        <>
          <div className="mt-1 mb-2">
            <div className="font-medium font-base text-sm text-slate-600 mb-2 pl-2">
              {`Recipient`}
            </div>
            <div className="flex items-center w-full">
              {/* Chain ID Section (1/3 of the width) */}
              <div className="flex items-center justify-center basis-1/3 h-10 border border-black rounded bg-transparent text-slate-600">
                <span className="font-medium">{chainId}</span>
              </div>

              {/* Space Between */}
              <div className="mx-2"></div>

              {/* Address Section (2/3 of the width) */}
              <div className="flex items-center justify-between basis-2/3 h-10 border border-black hover:bg-gray-200 rounded bg-transparent text-slate-600 px-4">
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
                    <span className="text-slate-600 text-lg">▼</span>
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
          <hr className="my-2 border-t border-gray-300" />
        </>

        {/* Amount Input Section */}
        <p className="font-medium font-base text-sm text-slate-600 mb-2 pl-2">
          <span>What&apos;s the amount?</span>
        </p>

        <div className="relative border border-black rounded h-16 w-full mb-3">
          {allowPayerSelectAmount ? (
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-none font-medium focus:outline-0 focus:border-gray-500 w-full h-16 px-4 bg-transparent placeholder-gray-400"
              )}
              placeholder="Payer sets an amount"
              value={"Payer sets an amount"}
              readOnly
            />
          ) : (
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-none font-medium text-3xl text-slate-600 focus:outline-0 focus:border-gray-500 w-full h-16 px-4 bg-transparent placeholder-gray-400"
              )}
              type="number"
              step="0.000000"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
            />
          )}

          <button
            type="button"
            className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center justify-between hover:bg-gray-200 border-l border border-black px-2 h-12 rounded"
            onClick={() => setSelectorVisibility(!selectorVisibility)}
          >
            <Image
              alt={selectedToken.label}
              src={selectedToken.logo}
              width={20}
              height={20}
            />
            <p className="ml-2 mr-2 text-slate-600 font-medium">
              {selectedToken.label}
            </p>
            <span className="ml-2 text-slate-600 text-lg">▼</span>
          </button>

          {/* Let Payer Choose Amount */}
          <label className="flex items-center font-base text-xs text-black pl-2 mt-1">
            <span className="mr-2">Let payer choose the amount</span>
            <div
              className={`w-8 h-4 bg-gray-400 rounded-full cursor-pointer ${
                allowPayerSelectAmount ? "bg-green-600" : ""
              }`}
              onClick={() => setAllowPayerSelectAmount(!allowPayerSelectAmount)}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ease-in-out ${
                  allowPayerSelectAmount ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Request Description Input Section */}
        <div>
          <div className="font-medium font-base text-sm text-slate-600 mt-6 mb-2 pl-2">
            {`What's this for?`}
          </div>

          <div className="relative">
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-black rounded border font-medium text-[22px] focus:outline-0 focus:black w-full h-16 mb-3 font-sans text-slate-600 bg-transparent pl-4"
              )}
              type="text"
              placeholder="coffee ☕"
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
            "flex justify-center items-center border-black border font-base text-lg focus:outline-0 focus:text-slate-600 w-full h-16 rounded transition-all font-bold text-slate-600 hover:border-black hover:bg-[#007BFF] hover:text-white mt-6"
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
            "Request"
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>

      <div className="flex justify-center items-center mt-5 mb-2">
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
