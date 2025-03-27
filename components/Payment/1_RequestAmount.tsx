import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ErrorsUi from "../ErrorsUi/ErrorsUi";
import MenuItem from "@mui/material/MenuItem";
import styles from "./payment.module.scss";
import cx from "classnames";
import { useAccount } from "wagmi";
import {
  tokensDetails,
  MAX_CHARACTER_LIMIT,
  darkenColor,
  maxAmounts,
} from "../../utils/constants";
import mixpanel from "mixpanel-browser";

export default function RequestAmount({
  onContinue,
  theme,
  logo,
  currencies,
  buttonColor,
  chainId,
  setChainId,
}: {
  onContinue: (amount: any, token: any, description: string) => void;
  theme: string;
  logo: any;
  buttonColor: string;
  currencies: any;
  chainId: string;
  setChainId: any;
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
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [allowPayerSelectAmount, setAllowPayerSelectAmount] =
    React.useState<boolean>(false);
  const { chain, address } = useAccount();
  const [selectorVisibility, setSelectorVisibility] =
    React.useState<boolean>(false);
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
        <div className="absolute top-0 left-0 right-0 z-30">
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-2xl shadow-xl w-full`}
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
                  Select asset
                </p>
              </div>
              <div className="max-h-[450px] overflow-y-auto">
                {tokensDetails
                  .filter((token) => {
                    // Default to showing all tokens if currencies is undefined or empty
                    const isCurrencySelected =
                      !currencies ||
                      currencies.length === 0 ||
                      currencies.includes(token.label);

                    if (!isCurrencySelected) return false;
                    if (chainId === "Base" && token.label === "WBTC")
                      return false;
                    if (chainId !== "Base" && token.label === "cbBTC")
                      return false;

                    return true;
                  })
                  .map((token, i) => (
                    <div
                      key={token.label}
                      onClick={() => {
                        setSelectedToken(token);
                        setSelectorVisibility(false);
                      }}
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg ${
                        i !== 0 ? "mt-1" : ""
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
                        <div className="text-sm text-gray-500">
                          {chain?.name || "Ethereum"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div
            onClick={() => setSelectorVisibility(false)}
            className="fixed inset-0 bg-black bg-opacity-30 z-[-1]"
          />
        </div>
      )}

      <div className="p-2 flex flex-col w-full">
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

          {/* Quick Selection Buttons */}
          {/* <div className="grid grid-cols-4 gap-2 mt-3 mb-5 w-full">
            {[0.4, 0.8, 2, 4].map((quarter) => {
              const fractionValue =
                (maxAmounts[selectedToken.label] * quarter) / 4;
              const isCryptoAndStable = ![
                "USD",
                "EURO",
                "USDC",
                "USDT",
              ].includes(selectedToken.label);
              const formattedValue = isCryptoAndStable
                ? fractionValue.toFixed(4)
                : fractionValue.toFixed(0);

              return (
                <button
                  key={quarter}
                  className="flex justify-center items-center rounded-full text-black border border-black px-2 py-2 text-xs transition-all hover:bg-[#007BFF] hover:text-white focus:outline-none w-full font-sans"
                  onClick={() => setAmount(formattedValue)}
                >
                  {formattedValue} {selectedToken.label}
                </button>
              );
            })}
          </div> */}

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

        {/* Request Description Input Section */}
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

        {/* Continue to step 2*/}
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
            const tokenLabel = selectedToken.label as keyof typeof maxAmounts;

            const maxAmount = maxAmounts[tokenLabel] ?? 250; // Default max is 250 if undefined

            if (amount === "0" || amount === "") {
              setBadRequest("The requested amount must be higher than zero");
            } else if (parseFloat(amount) > maxAmount) {
              setBadRequest(
                `The requested amount exceeds the limit of ${maxAmount} ${selectedToken.label}`
              );
            } else {
              setBadRequest("");
              onContinue(amount, selectedToken, description);
            }
          }}
        >
          Continue
        </button>
      </div>

      <div className="mb-2">
        <ErrorsUi errorMsg={badRequest} errorNtk={""} />
      </div>

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
