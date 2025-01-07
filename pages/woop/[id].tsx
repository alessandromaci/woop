import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Confetti from "react-confetti";
import useWindowSize from "./../../hooks/useWindowSize/useWindowSize";

import {
  useSimulateContract,
  useWriteContract,
  useEstimateGas,
  useWaitForTransactionReceipt,
  useSendTransaction,
  useAccount,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  setEtherscanBase,
  setEtherscanAddress,
  tokensDetails,
  tokenIdMap,
} from "../../utils/constants";
import { sendNotification } from "../../utils/push";
import mixpanel from "mixpanel-browser";
import { getEnsName } from "../../utils/ens";
import { getCoinPrices } from "../../utils/quotes";

import ERC20 from "../../abi/ERC20.abi.json";
import Footer from "../../components/Footer";
import { parseEther } from "ethers";
import Header from "../../components/Heading";
import styles from "./woop.module.scss";
import cx from "classnames";
import Link from "next/link";
import ErrorsUi from "../../components/ErrorsUi/ErrorsUi";
import SEO from "../../components/Seo";

interface Request {
  version: string;
  from: string;
  value: string;
  decimals: number;
  tokenName: string;
  tokenAddress: string;
}

const Request = () => {
  const [request, setRequest] = React.useState<Request>();
  const [amount, setAmount] = React.useState<string>("0.01");
  const [amountPreviewToDisplay, setAmountPreviewToDisplay] = React.useState<
    string | null
  >(null);
  const [amountPreviewToPay, setAmountPreviewToPay] = React.useState<
    string | null
  >(null);
  const [recipient, setRecipient] = React.useState<`0x${string}`>("0x");
  const [description, setDescription] = React.useState<string>("");
  const [tokenAddress, setTokenAddress] = React.useState<any>("");
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
  const [ensName, setEnsName] = React.useState<string>("");
  const [network, setNetwork] = React.useState<string>("");
  const [networkName, setNetworkName] = React.useState<string>("");
  const [chainId, setChainId] = React.useState<string>("");
  const [allowPayerSelectAmount, setAllowPayerSelectAmount] =
    React.useState<boolean>(false);
  const [woopBadRequest, setWoopBadRequest] = React.useState<string>("");
  const [woopBadNetwork, setWoopBadNetwork] = React.useState<string>("");
  const [badRequest, setBadRequest] = React.useState<boolean>(false);
  const [wrongNetwork, setWrongNetwork] = React.useState<boolean>(false);
  const [isNativeTx, setIsNativeTx] = React.useState<boolean>(false);
  const [isFiatTx, setIsFiatTx] = React.useState<boolean>(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [selectorVisibility, setSelectorVisibility] =
    React.useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;
  const { isConnected: connected, address } = useAccount();
  const { chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { width, height } = useWindowSize();
  const MIXPANEL_ID = process.env.NEXT_PUBLIC_MIXPANEL_ID;
  const pinataURL = process.env.NEXT_PUBLIC_PINATA_URL;

  // initiate tracking activity
  if (MIXPANEL_ID) {
    mixpanel.init(MIXPANEL_ID);
  }

  // querying ipfs
  const callIpfs = async () => {
    try {
      const response = await fetch(`${pinataURL}${id}`);

      if (!response.ok) throw new Error(response.statusText);

      const json = await response.json();
      setRequest(json);
      setRecipient(json.from);
      setNetwork(json.network);
      setNetworkName(json.networkName);
      setDescription(json.description);
      setTokenAddress(json.tokenAddress);

      if (json.value == "allowPayerSelectAmount") {
        setAllowPayerSelectAmount(true);
        const amount: string = (
          Number("0.001") / Number(10 ** (18 - json.decimals))
        ).toFixed(18);
        setAmount(amount);
      } else {
        if (json.decimals != 18) {
          const amount: string = (
            Number(json.value) / Number(10 ** (18 - json.decimals))
          ).toFixed(18);
          setAmount(amount);
        } else {
          setAmount(json.value);
        }
      }

      let tokenName: string = json.tokenName;
      if (tokenName == "ETH" || tokenName == "MATIC") {
        setIsNativeTx(true);
      }

      if (tokenName == "USD" || tokenName == "EURO") {
        setIsFiatTx(true);
      }

      const recipient = await getEnsName(json.from);
      if (recipient) {
        setEnsName(recipient);
      }
      mixpanel.track("visit_woop_payment", {
        Token: json.tokenName,
        Network: json.networkName,
        Amount: json.value,
        Address: address,
        Link: id,
      });
    } catch (error) {
      console.error(error);
      setBadRequest(true);
    }
  };

  const callIpfsForNetwork: any = async () => {
    try {
      const response = await fetch(`${pinataURL}${id}`);

      if (!response.ok) throw new Error(response.statusText);

      const json = await response.json();
      const result = {
        network: json.network,
        networkName: json.networkName,
      };
      return result;
    } catch (error) {
      console.error(error);
    }
  };

  const checkAndUpdateNetwork = (result: any) => {
    if (result?.network != chain?.id) {
      setWrongNetwork(true);
      setWoopBadNetwork(
        `Wrong network. Please connect to ${result?.networkName}`
      );
    } else {
      setWrongNetwork(false);
      setWoopBadNetwork("");
    }
    setNetwork(result?.network);
  };

  const handleAmountChange = (event: any) => {
    const inputValue = event.target.value;

    if (inputValue === "") {
      if (request?.decimals != 18 && request) {
        const amount: string = (
          Number("0.001") / Number(10 ** (18 - request?.decimals))
        ).toFixed(18);
        setAmount(amount);
        return;
      } else {
        setAmount("0.001");
        return;
      }
    }

    if (request?.decimals != 18 && request) {
      const amount: string = (
        Number(inputValue) / Number(10 ** (18 - request?.decimals))
      ).toFixed(18);
      setAmount(amount);
    } else {
      setAmount(inputValue as string);
    }
  };

  // wagmi erc20 transaction
  const { data } = useSimulateContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20,
    functionName: "transfer",
    args: [request?.from, parseEther(amount)],
  });

  const { data: hash, writeContract } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  //wagmi native transaction
  const { data: dataNative } = useEstimateGas({
    to: recipient,
    value: amount ? BigInt(parseEther(amount).toString()) : undefined,
  });
  const { data: hashNative, sendTransaction } = useSendTransaction();

  const { isLoading: isLoadingNative, isSuccess: isSuccessNative } =
    useWaitForTransactionReceipt({
      hash: hashNative,
    });

  // react use effects
  React.useEffect(() => {
    if (!isConnected) {
      setWoopBadRequest("");
      setWoopBadNetwork("");
    } else {
      if (isNativeTx) {
        if (!sendTransaction && !badRequest) {
          setWoopBadRequest(`Insufficient balance`);
        } else {
          setWoopBadRequest("");
        }
      } else {
        if (!Boolean(data?.request) && !badRequest) {
          setWoopBadRequest(`Insufficient balance`);
        } else {
          setWoopBadRequest("");
        }
      }
    }
  }, [isNativeTx, badRequest, isConnected, sendTransaction, data]);

  React.useEffect(() => {
    if (id) {
      callIpfs();
      callIpfsForNetwork().then((result: any) => checkAndUpdateNetwork(result));
    }

    if (chain) {
      setSelectedToken(tokensDetails[0]);
      setChainId(chain.name);
    }
  }, [chain, id]);

  React.useEffect(() => {
    if (connected) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connected]);

  React.useEffect(() => {
    if (isSuccess) {
      if (request) {
        const etherscanLink = setEtherscanBase(networkName, hash);
        sendNotification(
          recipient,
          address,
          networkName,
          amount,
          description,
          request,
          etherscanLink,
          id
        );
        mixpanel.track("paid_woop", {
          Token: request?.tokenName,
          Network: networkName,
          Amount: amount,
          Address: address,
          Link: id,
        });
      }
    }
    if (isSuccessNative) {
      if (request) {
        const etherscanLink = setEtherscanBase(networkName, hashNative);
        sendNotification(
          recipient,
          address,
          networkName,
          amount,
          description,
          request,
          etherscanLink,
          id
        );
        mixpanel.track("paid_woop", {
          Token: request?.tokenName,
          Network: networkName,
          Amount: amount,
          Address: address,
          Link: id,
        });
      }
    }
  }, [isSuccess, isSuccessNative]);

  React.useEffect(() => {
    if (isFiatTx == true) {
      const fetchExchangeRateAndCalculate = async () => {
        if (selectedToken && request) {
          try {
            // Map tokenName to CoinGecko ID
            const tokenName = selectedToken?.label;

            const tokenId = tokenIdMap[tokenName];

            const currency =
              request.tokenName === "EURO"
                ? "eur"
                : request.tokenName.toLowerCase();

            if (!tokenId) {
              console.error(`Token ID not found for token name: ${tokenName}`);
              return;
            }

            // Fetch the exchange rate dynamically
            const prices = await getCoinPrices(tokenId, currency);
            const exchangeRate = prices[tokenId]?.[currency];

            if (!exchangeRate) {
              console.error(`Exchange rate not found for token ID: ${tokenId}`);
              return;
            }

            // Set token address for the selected network
            const tokenAddress =
              selectedToken[networkName as keyof typeof selectedToken];
            setTokenAddress(tokenAddress);

            // Calculate the amount to pay in tokens
            const fiatValue = parseFloat(request?.value || "0"); // Ensure fiatValue is a number
            const amountToPayInToken = fiatValue / exchangeRate;
            const amountToPayInTokenFixed = amountToPayInToken.toFixed(4);

            setAmountPreviewToDisplay(amountToPayInTokenFixed);

            // Adjust for token decimals if necessary
            if (selectedToken.decimals !== 18) {
              const adjustedAmount: string = (
                Number(amountToPayInTokenFixed) /
                Number(10 ** (18 - selectedToken.decimals))
              ).toFixed(18);
              setAmount(adjustedAmount);
            } else {
              setAmount(amountToPayInTokenFixed);
            }
          } catch (error) {
            console.error(
              "Error fetching exchange rate or calculating token amount:",
              error
            );
          }
        }
      };

      fetchExchangeRateAndCalculate();
      if (selectedToken.label == "ETH") {
        setIsNativeTx(true);
      } else {
        setIsNativeTx(false);
      }
    }
  }, [selectedToken, request, networkName]);

  const colors = [
    "rgba(16, 130, 178, 1)",
    "rgba(79, 76, 227, 1)",
    "rgba(33, 35, 167, 0.5)",
    "rgb(6, 34, 92)",
  ];

  const findIcon = (tokenName: string) => {
    const coin = tokensDetails.find((token) => tokenName === token.label);
    return (
      coin && (
        <Image
          alt={coin.label}
          src={coin.logo}
          className=""
          width={20}
          height={20}
        />
      )
    );
  };

  return (
    <div>
      <SEO
        title={"Woop Pay | Payment Request"}
        rrssImg="./RRSS.png"
        description={"You've been requested to send a payment through Woop Pay"}
      />

      <Header />

      <article
        className={cx(
          styles.baseContainer,
          "h-screen w-full flex justify-center items-center"
        )}
      >
        <section
          className={cx(
            styles.containerBase,
            "h-screen w-full absolute top-0 z-0 flex opacity-50 items-center"
          )}
        ></section>

        {isSuccess || isSuccessNative ? (
          <Confetti
            colors={colors}
            className="z-10"
            width={width}
            height={height}
          />
        ) : null}

        {/* CONTENT */}
        <Container maxWidth="xs" className="">
          {!badRequest ? (
            <div className={"mb-2 z-20"}>
              <ErrorsUi errorMsg={woopBadRequest} errorNtk={woopBadNetwork} />
            </div>
          ) : (
            <></>
          )}

          <Box
            component="form"
            className={cx(
              styles.containerBox,
              "rounded shadow-md w-full relative z-20"
            )}
          >
            <section className="justify-items-left font-base text-slate-600">
              <div
                className={cx(
                  styles.topContainer,
                  "mb-2 pl-4 pr-4 pt-4 pb-3 w-full flex justify-between items-center"
                )}
              >
                <p className="font-base font-bold text-xl">
                  {badRequest
                    ? "No Woop to pay here"
                    : isNativeTx
                    ? isSuccessNative
                      ? "Payment sent!"
                      : description
                      ? `${
                          description.charAt(0).toUpperCase() +
                          description.slice(1)
                        }`
                      : "Payment requested!"
                    : isSuccess
                    ? "Payment sent!"
                    : description
                    ? `${
                        description.charAt(0).toUpperCase() +
                        description.slice(1)
                      }`
                    : "Payment requested!"}
                </p>
              </div>
              {badRequest ? (
                <>
                  <div className="px-4 pb-4 pt-1">
                    <div className="mt-6"></div>
                    <Link href="/">
                      <button
                        className={cx(
                          "border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                        )}
                      >
                        Go back
                      </button>
                    </Link>
                  </div>
                </>
              ) : !isConnected ? (
                <div className="px-4 pb-4 pt-1 relative">
                  <>
                    <div className="absolute top-0 right-3 p-1">
                      {request && findIcon(request?.tokenName)}
                    </div>
                    <p className="font-medium font-base text-sm text-slate-600 mb-2 flex items-center">
                      <a
                        className="underline underline-offset-4"
                        href={`${setEtherscanAddress(network, request?.from)}`}
                      >
                        {ensName ? (
                          <p className="flex items-center">
                            <span className="mr-1 font-bold">{ensName}</span>
                          </p>
                        ) : (
                          <span className="font-bold">
                            {request?.from.slice(0, 4)}...
                            {request?.from.slice(-4)}
                          </span>
                        )}
                      </a>
                      <span className="ml-1">{"requested:"}</span>
                    </p>
                    <div className="mt-3 md:text-6xl text-5xl font-bold my-6">
                      {request?.value == "allowPayerSelectAmount"
                        ? "..."
                        : request?.value}{" "}
                      {request?.tokenName}
                    </div>
                  </>

                  <div className="">
                    <button
                      type="button"
                      className={cx(
                        "flex justify-center items-center border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                      )}
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              ) : isSuccess ? (
                <>
                  <div className="px-4 pb-4 pt-1">
                    <div className="mt-3 text-center w-full my-6">
                      <p className="font-bold md:text-5xl text-4xl mb-2">
                        {`${
                          isFiatTx
                            ? request?.value
                            : request?.decimals === 18
                            ? amount
                            : Number(amount) * 10 ** 12
                        } ${request?.tokenName}`}
                      </p>
                      <p className="font-medium font-base text-sm text-slate-600 mb-2 text-center">
                        <a
                          className="underline underline-offset-4 mr-1"
                          href={`${setEtherscanBase(networkName, hash)}`}
                        >
                          sent
                        </a>
                        <span className="mr-1">{"to"}</span>
                        {ensName ? (
                          <a>
                            <span className="mr-1 font-bold">{ensName}</span>
                          </a>
                        ) : (
                          <span className="font-bold">
                            {request?.from.slice(0, 4)}...
                            {request?.from.slice(-4)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Link href="/">
                      <button
                        className={cx(
                          "border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                        )}
                      >
                        Close
                      </button>
                    </Link>
                  </div>
                </>
              ) : isSuccessNative ? (
                <>
                  <div className="px-4 pb-4 pt-1">
                    <div className="mt-3 text-center w-full my-6">
                      <p className="font-bold md:text-5xl text-4xl mb-2">
                        {`${isFiatTx ? request?.value : amount} ${
                          request?.tokenName
                        }`}
                      </p>
                      <p className="font-medium font-base text-sm text-slate-600 mb-2 text-center">
                        <a
                          className="underline underline-offset-4 mr-1"
                          href={`${setEtherscanBase(networkName, hashNative)}`}
                        >
                          sent
                        </a>
                        <span className="mr-1">{"to"}</span>
                        {ensName ? (
                          <a>
                            <span className="mr-1 font-bold">{ensName}</span>
                          </a>
                        ) : (
                          <span className="font-bold">
                            {request?.from.slice(0, 4)}...
                            {request?.from.slice(-4)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Link href="/">
                      <button
                        className={cx(
                          "border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                        )}
                      >
                        Close
                      </button>
                    </Link>
                  </div>
                </>
              ) : allowPayerSelectAmount ? (
                <div className="px-4 pb-4 pt-1 relative">
                  <>
                    <div className="absolute top-0 right-3 p-1">
                      {request && findIcon(request?.tokenName)}
                    </div>
                    <div className="font-medium font-base text-sm text-slate-600 mb-2 flex items-center">
                      <a
                        className="underline underline-offset-4"
                        href={`${setEtherscanAddress(network, request?.from)}`}
                      >
                        {ensName ? (
                          <p className="flex items-center">
                            <span className="font-bold">{ensName}</span>
                          </p>
                        ) : (
                          <span className="font-bold">
                            {request?.from.slice(0, 4)}...
                            {request?.from.slice(-4)}
                          </span>
                        )}
                      </a>
                      <span className="ml-1">
                        {"requested to set an amount:"}
                      </span>
                    </div>
                    <div className="mt-3 md:text-6xl text-5xl font-bold my-6 text-center items-center">
                      <input
                        className="bg-transparent text-slate-600 text-center focus:outline-none mr-1"
                        type="number"
                        placeholder="0.001"
                        onChange={handleAmountChange}
                        style={{ maxWidth: "100%" }}
                      />
                      <div className="flex-shrink-0">{request?.tokenName}</div>
                    </div>
                  </>

                  <div className="">
                    <button
                      type="button"
                      className={cx(
                        "flex justify-center items-center border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                      )}
                      disabled={
                        (isNativeTx
                          ? !Boolean(dataNative) || isLoadingNative
                          : !Boolean(data?.request) || isLoading) ||
                        wrongNetwork
                      }
                      onClick={
                        isNativeTx
                          ? () =>
                              sendTransaction({
                                to: recipient,
                                value: amount
                                  ? BigInt(parseEther(amount).toString())
                                  : undefined,
                              })
                          : () => writeContract(data!.request)
                      }
                    >
                      {isNativeTx ? (
                        isLoadingNative ? (
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
                        ) : (
                          "Pay now"
                        )
                      ) : isLoading ? (
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
                      ) : (
                        "Pay now"
                      )}
                    </button>
                  </div>
                </div>
              ) : isFiatTx ? (
                <div className="px-4 pb-4 pt-1 relative">
                  <>
                    <div className="absolute top-0 right-3 p-1">
                      {request && findIcon(request?.tokenName)}
                    </div>
                    <p className="font-medium font-base text-sm text-slate-600 mb-2 flex items-center">
                      <a
                        className="underline underline-offset-4"
                        href={`${setEtherscanAddress(network, request?.from)}`}
                      >
                        {ensName ? (
                          <p className="flex items-center">
                            <span className="font-bold">{ensName}</span>
                          </p>
                        ) : (
                          <span className="font-bold">
                            {request?.from.slice(0, 4)}...
                            {request?.from.slice(-4)}
                          </span>
                        )}
                      </a>
                      <span className="ml-1">{"requested:"}</span>
                    </p>
                    <div className="mt-3 md:text-6xl text-5xl font-bold my-6">
                      {request?.value} {request?.tokenName}
                    </div>

                    <div className="pb-4 pt-1 relative">
                      <div className="flex items-center justify-between">
                        <p className="font-medium font-base text-sm text-slate-600">
                          {"Select token to pay:"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="md:text-6xl text-5xl font-bold text-slate-600">
                          {amountPreviewToDisplay
                            ? amountPreviewToDisplay
                            : "..."}
                        </div>
                        <button
                          type="button"
                          className="flex items-center justify-between bg-white border border-black px-3 h-14 rounded hover:bg-gray-200 hover:shadow-md transition"
                          onClick={() =>
                            setSelectorVisibility(!selectorVisibility)
                          }
                        >
                          <Image
                            alt={selectedToken.label}
                            src={selectedToken.logo}
                            className="mr-2"
                            width={20}
                            height={20}
                          />
                          <p className="text-slate-600 font-medium mr-2">
                            {selectedToken.label}
                          </p>
                          <span className="text-slate-600 text-lg">▼</span>
                        </button>
                      </div>

                      {selectorVisibility && (
                        <section className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen z-30">
                          <div
                            onClick={() =>
                              setSelectorVisibility(!selectorVisibility)
                            }
                            className="fixed top-0 left-0 w-screen h-screen bg-slate-900 opacity-30"
                          ></div>
                          <div className="z-20 bg-white rounded shadow-xl py-4 px-6 md:w-80 w-full m-5">
                            <p className="font-base font-semibold text-slate-700 pb-3 border-b mb-3">
                              Select currency
                            </p>
                            {tokensDetails
                              .filter((token) => {
                                if (["USD", "EURO"].includes(token.label))
                                  return false;
                                if (chainId === "Base")
                                  return token.label !== "WBTC";
                                return token.label !== "cbBTC";
                              })
                              .map((token, i) => (
                                <MenuItem
                                  key={token.label}
                                  onClick={() => {
                                    setSelectedToken(token);
                                    setSelectorVisibility(!selectorVisibility);
                                  }}
                                  value={token.label}
                                  className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-md flex items-center"
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
                              ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </>

                  <div className="">
                    <button
                      type="button"
                      className={cx(
                        "flex justify-center items-center border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                      )}
                      disabled={
                        (isNativeTx
                          ? !Boolean(dataNative) || isLoadingNative
                          : !Boolean(data?.request) || isLoading) ||
                        wrongNetwork
                      }
                      onClick={
                        isNativeTx
                          ? () =>
                              sendTransaction({
                                to: recipient,
                                value: amount
                                  ? BigInt(parseEther(amount).toString())
                                  : undefined,
                              })
                          : () => writeContract(data!.request)
                      }
                    >
                      {isNativeTx ? (
                        isLoadingNative ? (
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
                        ) : (
                          "Pay now"
                        )
                      ) : isLoading ? (
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
                      ) : (
                        "Pay now"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 pb-4 pt-1 relative">
                  <>
                    <div className="absolute top-0 right-3 p-1">
                      {request && findIcon(request?.tokenName)}
                    </div>
                    <p className="font-medium font-base text-sm text-slate-600 mb-2 flex items-center">
                      <a
                        className="underline underline-offset-4"
                        href={`${setEtherscanAddress(network, request?.from)}`}
                      >
                        {ensName ? (
                          <p className="flex items-center">
                            <span className="font-bold">{ensName}</span>
                          </p>
                        ) : (
                          <span className="font-bold">
                            {request?.from.slice(0, 4)}...
                            {request?.from.slice(-4)}
                          </span>
                        )}
                      </a>
                      <span className="ml-1">{"requested:"}</span>
                    </p>
                    <div className="mt-3 md:text-6xl text-5xl font-bold my-6">
                      {request?.value} {request?.tokenName}
                    </div>
                  </>

                  <div className="">
                    <button
                      type="button"
                      className={cx(
                        "flex justify-center items-center border-black border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded transition-all font-bold text-slate-600 capitalize hover:border-black hover:bg-[#007BFF] hover:text-white"
                      )}
                      disabled={
                        (isNativeTx
                          ? !Boolean(dataNative) || isLoadingNative
                          : !Boolean(data?.request) || isLoading) ||
                        wrongNetwork
                      }
                      onClick={
                        isNativeTx
                          ? () =>
                              sendTransaction({
                                to: recipient,
                                value: amount
                                  ? BigInt(parseEther(amount).toString())
                                  : undefined,
                              })
                          : () => writeContract(data!.request)
                      }
                    >
                      {isNativeTx ? (
                        isLoadingNative ? (
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
                        ) : (
                          "Pay now"
                        )
                      ) : isLoading ? (
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
                      ) : (
                        "Pay now"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>
            <div className="flex justify-center items-center mt-5 mb-3">
              <span className="text-xs text-gray-500 mr-1">powered by</span>
              <Image
                alt="Woop Logo"
                src="/woop_logo.png"
                width={45}
                height={10}
                className="inline-block"
              />
            </div>
          </Box>
        </Container>
      </article>

      <div className="absolute bottom-0 left-0 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Request;
