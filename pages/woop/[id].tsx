import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
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
import { parseEther } from "ethers";
import styles from "./woop.module.scss";
import cx from "classnames";
import Link from "next/link";
import ErrorsUi from "../../components/ErrorsUi/ErrorsUi";
import SEO from "../../components/common/Seo";
import Layout from "../../components/layout/LayoutPayment";

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
  }>(tokensDetails[2]);
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
  const [copiedReceipt, setCopiedReceipt] = React.useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;
  const { isConnected: connected, address } = useAccount();
  const { chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { width, height } = useWindowSize();
  const MIXPANEL_ID = process.env.NEXT_PUBLIC_MIXPANEL_ID;
  const pinataURL = process.env.NEXT_PUBLIC_PINATA_URL;
  const [hydrated, setHydrated] = React.useState(false);

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
      setDescription(json.selectedDescription);
      setTokenAddress(json.tokenAddress);

      console.log(json);

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
    if (result?.networkName === "Any") {
      // If "Any" is selected, don't check for network mismatch
      setWrongNetwork(false);
      setWoopBadNetwork("");
    } else if (result?.network !== chain?.id) {
      // Mismatch logic applies only when networkName is not "Any"
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
      setSelectedToken(tokensDetails[2]);
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
            const fiatValue = parseFloat(
              request?.value == "allowPayerSelectAmount"
                ? "1"
                : request?.value || ""
            ); // Ensure fiatValue is a number
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

  React.useEffect(() => {
    setHydrated(true);
  }, []);

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
          width={28}
          height={28}
        />
      )
    );
  };

  return (
    <>
      <SEO
        title={"Woop | Payment Request"}
        rrssImg="./RRSS.jpg"
        description={"You've been requested to send a crypto payment"}
      />
      <Layout showNavigation={false} activeTab="receive">
        {hydrated ? (
          <div className={"w-full flex justify-center items-center"}>
            <Box
              component="form"
              className={cx(styles.containerBox, "rounded z-20")}
            >
              <div className="justify-items-left font-base text-slate-600">
                <div className="relative w-full px-4 pt-4 pb-2">
                  <div className="flex justify-end mb-4">
                    <Image
                      alt="Woop Logo"
                      src="/woop_logo.png"
                      width={80}
                      height={20}
                      className="inline-block"
                    />
                  </div>
                  <div className="">
                    <p className="font-base font-bold text-2xl">
                      {badRequest
                        ? "No Woop to pay here"
                        : isNativeTx
                        ? isSuccessNative
                          ? "Paid successfully!"
                          : `For ${description}`
                          ? `For ${
                              description.charAt(0).toUpperCase() +
                              description.slice(1)
                            }`
                          : "Payment requested!"
                        : isSuccess
                        ? "Paid successfully!"
                        : `For ${description}`
                        ? `For ${
                            description.charAt(0).toUpperCase() +
                            description.slice(1)
                          }`
                        : "Payment requested!"}
                    </p>
                  </div>
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
                      <p className="font-medium font-base text-base text-slate-600 mb-2 flex items-center">
                        <a
                          className="underline underline-offset-4"
                          href={`${setEtherscanAddress(
                            network,
                            request?.from
                          )}`}
                        >
                          {ensName ? (
                            <p className="flex items-center">
                              <span className="text-lg font-bold">
                                {ensName}
                              </span>
                            </p>
                          ) : (
                            <span className="text-lg font-bold">
                              {request?.from.slice(0, 4)}...
                              {request?.from.slice(-4)}
                            </span>
                          )}
                        </a>
                        <span className="ml-2 text-base">{"requested:"}</span>
                      </p>
                      <div className="mt-3 md:text-6xl text-5xl font-bold my-6">
                        {request?.value == "allowPayerSelectAmount"
                          ? "..."
                          : request?.value}{" "}
                        {request?.tokenName}{" "}
                        {<p className="ml-1 text-lg">on {networkName}</p>}
                      </div>
                    </>

                    <div className="">
                      <button
                        type="button"
                        className="flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3 bg-[#007BFF] hover:bg-[#0067EB]"
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
                        <p className="font-bold text-5xl mb-2">
                          {`${
                            isFiatTx
                              ? request?.value
                              : request?.decimals === 18
                              ? amount
                              : Number(amount) * 10 ** 12
                          } ${request?.tokenName}`}
                        </p>
                        <p className="font-medium font-base text-base text-slate-600 mb-2 text-center">
                          <span className="mr-1">{"To:"}</span>
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
                        <p className="font-medium font-base text-base text-slate-600 mb-2 text-center">
                          <span className="mr-1">{"Receipt:"}</span>
                          <button
                            className="underline underline-offset-4 mr-1 text-slate-600"
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${setEtherscanBase(networkName, hashNative)}`
                              );
                              setCopiedReceipt(true); // Set the copied state to true
                              setTimeout(() => setCopiedReceipt(false), 2000); // Reset after 2 seconds
                            }}
                          >
                            {copiedReceipt ? "copied" : "copy link"}
                          </button>
                        </p>
                      </div>
                      <Link href="/">
                        <button className="flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3 bg-[#007BFF] hover:bg-[#0067EB]">
                          New request
                        </button>
                      </Link>
                    </div>
                  </>
                ) : isSuccessNative ? (
                  <>
                    <div className="px-4 pb-4 pt-1">
                      <div className="mt-3 text-center w-full my-6">
                        <p className="font-bold text-5xl mb-2">
                          {`${isFiatTx ? request?.value : amount} ${
                            request?.tokenName
                          }`}
                        </p>
                        <p className="font-medium font-base text-base text-slate-600 mb-2 text-center">
                          <span className="mr-1">{"To:"}</span>
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
                        <p className="font-medium font-base text-base text-slate-600 mb-2 text-center">
                          <span className="mr-1">{"Receipt:"}</span>
                          <button
                            className="underline underline-offset-4 mr-1 text-slate-600"
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${setEtherscanBase(networkName, hashNative)}`
                              );
                              setCopiedReceipt(true); // Set the copied state to true
                              setTimeout(() => setCopiedReceipt(false), 2000); // Reset after 2 seconds
                            }}
                          >
                            {copiedReceipt ? "copied" : "copy link"}
                          </button>
                        </p>
                      </div>
                      <Link href="/">
                        <button className="flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3 bg-[#007BFF] hover:bg-[#0067EB]">
                          New request
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
                          href={`${setEtherscanAddress(
                            network,
                            request?.from
                          )}`}
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
                        <div className="flex-shrink-0">
                          {request?.tokenName}{" "}
                          {
                            <p className="ml-1 text-lg">
                              on{" "}
                              {networkName === "Any"
                                ? "any network"
                                : networkName}
                            </p>
                          }
                        </div>
                      </div>
                    </>

                    <div className="">
                      <button
                        type="button"
                        className="flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3 bg-[#007BFF] hover:bg-[#0067EB]"
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
                          href={`${setEtherscanAddress(
                            network,
                            request?.from
                          )}`}
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
                        {request?.value} {request?.tokenName}{" "}
                        {
                          <p className="ml-1 text-lg">
                            on{" "}
                            {networkName === "Any"
                              ? "any network"
                              : networkName}
                          </p>
                        }
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
                            className="flex items-center justify-between bg-white border border-black px-2 h-12 rounded-full hover:bg-gray-300 hover:shadow-md transition"
                            style={{ width: "auto", minWidth: "120px" }}
                            onClick={() =>
                              setSelectorVisibility(!selectorVisibility)
                            }
                          >
                            <Image
                              alt={selectedToken.label}
                              src={selectedToken.logo}
                              width={24}
                              height={24}
                            />
                            <p className="text-slate-600 font-medium text-base ml-2">
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

                        {selectorVisibility && (
                          <>
                            <div
                              className="fixed inset-x-0 top-[0px] z-30 mx-auto"
                              style={{ maxWidth: "480px" }}
                            >
                              <div className="bg-white rounded-2xl shadow-xl w-full">
                                <div className="p-4">
                                  <div className="flex items-center mb-4">
                                    <button
                                      onClick={() =>
                                        setSelectorVisibility(false)
                                      }
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
                                        className="text-gray-600"
                                      >
                                        <path d="M19 12H5M12 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                    <p className="font-base font-semibold text-slate-700">
                                      Select asset
                                    </p>
                                  </div>
                                  <div className="max-h-[450px] overflow-y-auto">
                                    {tokensDetails
                                      .filter((token) => {
                                        if (
                                          ["USD", "EURO"].includes(token.label)
                                        )
                                          return false;
                                        if (chainId === "Base")
                                          return token.label !== "WBTC";
                                        return token.label !== "cbBTC";
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
                                            <div className="font-medium text-gray-800">
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
                            </div>
                            <div
                              onClick={() => setSelectorVisibility(false)}
                              className="fixed inset-0 bg-black bg-opacity-30 z-20"
                            />
                          </>
                        )}
                      </div>
                    </>

                    <div className="">
                      <button
                        type="button"
                        className="flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3 bg-[#007BFF] hover:bg-[#0067EB]"
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
                          href={`${setEtherscanAddress(
                            network,
                            request?.from
                          )}`}
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
                        {request?.value} {request?.tokenName}{" "}
                        {
                          <p className="ml-1 text-lg">
                            on{" "}
                            {networkName === "Any"
                              ? "any network"
                              : networkName}
                          </p>
                        }
                      </div>
                    </>

                    <div className="">
                      <button
                        type="button"
                        className="flex justify-center items-center border-black border font-sans leading-snug font-medium text-lg focus:outline-0 w-full h-14 rounded transition-all font-bold text-white mt-3 bg-[#007BFF] hover:bg-[#0067EB]"
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
              </div>

              {!badRequest ? (
                <div className={"mb-2"}>
                  <ErrorsUi
                    errorMsg={woopBadRequest}
                    errorNtk={woopBadNetwork}
                  />
                </div>
              ) : (
                <></>
              )}

              <div className="flex justify-center items-center mt-5">
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
          </div>
        ) : (
          <></>
        )}
      </Layout>
    </>
  );
};

export default Request;
