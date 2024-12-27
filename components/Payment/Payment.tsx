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
        console.log(path);
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
      console.log(chain.name);
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
          <div className="z-20 bg-white rounded-xl shadow-xl py-2 px-2 md:w-80 w-full m-5">
            <p className="font-base font-semibold text-slate-700 pl-4 pb-3 pt-2 border-b mb-3">
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
                    className="cursor-pointer hover:bg-slate-200 rounded-xl p-1"
                  >
                    <div className="flex items-center">
                      <Image
                        alt={token.label}
                        src={token.logo}
                        className="p-1"
                        width={40}
                        height={40}
                      />
                      <span className="ml-3 text-slate-700 font-base font-semibold">
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

        <p className="font-medium font-base text-sm text-white mb-2 pl-2">
          <span className="md:block hidden">Select amount to request</span>
          <span className="md:hidden">Requesting</span>
        </p>

        <div className="relative">
          {allowPayerSelectAmount ? (
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-white rounded-xl border font-medium text-3l focus:outline-0 focus:white w-full h-16 mb-2 font-sans text-white bg-transparent pl-4"
              )}
              placeholder="Payer sets an amount"
              value={"Payer sets an amount"}
              readOnly
            ></input>
          ) : (
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-white rounded-xl border font-medium text-3xl focus:outline-0 focus:white w-full h-16 mb-2 font-sans text-white bg-transparent pl-4"
              )}
              type="number"
              step="0.000000"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
            ></input>
          )}

          <button
            type="button"
            style={{
              width: 110,
              height: 38,
              position: "absolute",
              top: -20,
              right: 25,
            }}
            className="bg-white shadow-md rounded-xl text-slate-900 hover:shadow-xl hover:bg-white"
            onClick={() => setSelectorVisibility(!selectorVisibility)}
          >
            <div className="flex items-center w-full ml-1">
              <Image
                alt={selectedToken.label}
                src={selectedToken.logo}
                className="pr-1 ml-1"
                width={30}
                height={30}
              />
              <span className="ml-1 text-slate-700 font-base font-semibold">
                {selectedToken.label}
              </span>
            </div>
          </button>

          <label className="flex items-center font-base text-sm text-white pl-2">
            <span className="mr-3 ">Let payer choose the amount</span>
            <div
              className={`w-8 h-4 bg-gray-400 rounded-full cursor-pointer ${
                allowPayerSelectAmount ? "bg-green-500" : ""
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

          <div className="font-medium font-base text-sm text-white mt-12 mb-2 pl-2">
            {`What's this for?`}
          </div>

          <div className="relative">
            <input
              autoFocus={isConnected}
              className={cx(
                styles.mainInput,
                "border-white rounded-xl border font-medium text-[22px] focus:outline-0 focus:white w-full h-16 mb-3 font-sans text-white bg-transparent pl-4"
              )}
              type="text"
              placeholder="coffee ☕"
              value={description}
              onChange={handleDescriptionChange}
              maxLength={MAX_CHARACTER_LIMIT}
            />
            <div className="absolute right-3 bottom-4 text-white text-[8px]">
              {characterCount}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-medium font-base text-sm text-white mb-2 pl-2">
            {`Recipient`}
          </div>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center justify-center flex-1 h-10 border border-white rounded-xl bg-transparent text-white mx-1">
              <span className="font-medium">{chainId}</span>
            </div>

            <div className="flex items-center justify-between flex-1 h-10 border border-white rounded-xl bg-transparent text-white px-4 mx-1">
              {!isEditingRecipient ? (
                <>
                  <div className="font-medium">
                    {hydrated
                      ? `${recipientAddress.slice(
                          0,
                          4
                        )}...${recipientAddress.slice(-4)}`
                      : ""}
                  </div>
                  <button
                    type="button"
                    className="text-white text-lg"
                    onClick={() => setIsEditingRecipient(true)}
                  >
                    ▼
                  </button>
                </>
              ) : (
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    className="w-full h-8 rounded-md bg-transparent text-white text-center font-medium"
                    value={newAddress}
                    onChange={handleNewAddressChange}
                    placeholder="0x..."
                  />
                  <button
                    type="button"
                    className="ml-2 text-blue-400"
                    onClick={saveNewAddress}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={cx(
            "flex justify-center items-center border-white border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded-xl transition-all font-bold text-white hover:border-white hover:bg-white hover:text-slate-700 mt-12"
          )}
          onClick={isConnected ? createRequest : openConnectModal}
        >
          {ipfsLoading ? (
            <>
              <svg
                className="animate-spin rounded-full w-5 h-5 mr-3 bg-white-500"
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
            "Create Woop"
          ) : (
            "Connect Wallet"
          )}
        </button>
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
              "z-20 rounded-3xl shadow-xl py-2 px-2 md:w-96 w-full m-5"
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
