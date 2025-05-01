import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SEO from "../components/common/Seo";
import RequestAmount from "../components/Payment/1_RequestAmount";
import SelectReceiptMethod from "../components/Payment/2_SelectReceiptMethod";
import Navigation from "../components/common/Navigation";
import { tokensDetails, getNetworkName } from "../utils/constants";
import Image from "next/image";
import {
  WidgetWalletProvider,
  useWidgetWallet,
} from "../components/common/WidgetWalletProvider";
import WidgetWallet from "../components/common/WidgetWallet";

// Add prop types for components
type NavigationProps = {
  modules: {
    enableReceive: boolean;
    enableInvest: boolean;
    enableNFTs: boolean;
  };
  activeModule: string;
  setActiveModule: React.Dispatch<React.SetStateAction<string>>;
  theme: "light" | "dark" | "system";
};

interface PaymentComponentProps {
  theme: "light" | "dark" | "system";
  logo: string;
  buttonColor: string;
  currencies: string[];
  chainId: string;
  setChainId: (chainId: string) => void;
}

interface RequestAmountProps extends PaymentComponentProps {
  onContinue: (amount: string, token: string, description: string) => void;
}

interface SelectReceiptMethodProps extends PaymentComponentProps {
  onBack: () => void;
  selectedAmount: string;
  selectedToken: string;
  selectedDescription: string;
  networks: {
    mainnet?: boolean;
    sepolia?: boolean;
    polygon?: boolean;
    optimism?: boolean;
    arbitrum?: boolean;
    base?: boolean;
  };
  widgetAddress: string;
}

interface WidgetConfig {
  appCode: string;
  assets: string[];
  modules: {
    enableReceive: boolean;
    enableInvest: boolean;
    enableNFTs: boolean;
  };
  networks?: {
    mainnet?: boolean;
    sepolia?: boolean;
    polygon?: boolean;
    optimism?: boolean;
    arbitrum?: boolean;
    base?: boolean;
  };
  theme: "light" | "dark" | "system";
  buttonColor: string;
  logo: string;
}

interface WalletConnection {
  address: string;
  chainId: string;
  provider: {
    request: (args: any) => Promise<any>;
    on?: (event: string, callback: any) => void;
    removeListener?: (event: string, callback: any) => void;
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
  };
}

// Default configuration when accessed directly
const DEFAULT_CONFIG: WidgetConfig = {
  appCode: "DEMO-WALLET",
  assets: tokensDetails.map((token) => token.label),
  modules: {
    enableReceive: true,
    enableInvest: true,
    enableNFTs: true,
  },
  networks: {
    mainnet: true,
    sepolia: true,
    polygon: true,
    optimism: true,
    arbitrum: true,
    base: true,
  },
  theme: "light",
  buttonColor: "#007BFF",
  logo: "/woop_logo.png",
};

function WidgetContent() {
  const { address, chainId, isConnected } = useWidgetWallet();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedAmount, setSelectedAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState<string>("");
  const [selectedDescription, setSelectedDescription] = React.useState("");
  const [activeModule, setActiveModule] = React.useState<
    "receive" | "invest" | "nfts"
  >("receive");
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const router = useRouter();

  // Parse URL parameters and set initial config
  useEffect(() => {
    if (!router.isReady) return;

    const { appCode, assets, modules, networks, theme, buttonColor, logo } =
      router.query;

    // Only update config if we're in an iframe and have parameters
    if (window !== window.parent && appCode) {
      setConfig({
        appCode: appCode as string,
        assets: (assets as string)?.split(",") || DEFAULT_CONFIG.assets,
        modules: modules
          ? JSON.parse(modules as string)
          : DEFAULT_CONFIG.modules,
        networks: networks
          ? JSON.parse(networks as string)
          : DEFAULT_CONFIG.networks,
        theme: (theme as "light" | "dark" | "system") || DEFAULT_CONFIG.theme,
        buttonColor: (buttonColor as string) || DEFAULT_CONFIG.buttonColor,
        logo: (logo as string) || DEFAULT_CONFIG.logo,
      });
    }
  }, [router.isReady, router.query]);

  const handleRequestAmountContinue = (
    amount: string,
    token: string,
    description: string
  ) => {
    setSelectedAmount(amount);
    setSelectedToken(token);
    setSelectedDescription(description);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const setChainId = (chainId: string) => {
    if (!chainId) return;

    // Convert chainId to network name if needed
    const networkName = getNetworkName(
      chainId
    ).toLowerCase() as keyof typeof config.networks;

    // Update the chain ID in the widget state
    if (config.networks && config.networks[networkName]) {
      window.parent.postMessage(
        {
          type: "WOOP_NETWORK_CHANGE",
          chainId: chainId,
          networkName: networkName,
        },
        "*"
      );
    }
  };

  return (
    <>
      <SEO title="Woop Widget" description="Woop Widget" />
      <div
        className={`flex flex-col max-w-md mx-auto ${
          config.theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
        }`}
        style={{
          backgroundColor: config.theme === "dark" ? "#111827" : "#fff",
        }}
      >
        {/* Header Section */}
        <div className={`flex justify-between items-center py-5 px-4 `}>
          {/* Logo */}
          <Image
            src={config.logo || DEFAULT_CONFIG.logo}
            alt="Logo"
            width={100}
            height={24}
            className="h-6 object-contain"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_CONFIG.logo;
            }}
          />

          {/* Back Button - Only show in step 2 */}
          {currentStep === 2 && (
            <button
              onClick={() => setCurrentStep(1)}
              className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  config.theme === "dark" ? "text-gray-300" : "text-gray-600"
                }
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* Wallet Info */}
          <WidgetWallet />
        </div>

        <div className="px-4 flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Navigation Menu */}
          <Navigation
            modules={config.modules}
            activeModule={activeModule as "receive" | "invest" | "nfts"}
            setActiveModule={setActiveModule}
            theme={config.theme}
          />
          {/* Widget Content */}
          <div className="flex-1">
            {activeModule === "receive" && (
              <>
                {currentStep === 1 && (
                  <RequestAmount
                    onContinue={handleRequestAmountContinue}
                    theme={config.theme}
                    logo={config.logo}
                    buttonColor={config.buttonColor}
                    currencies={config.assets}
                    chainId={chainId || ""}
                    setChainId={setChainId}
                  />
                )}
                {currentStep === 2 && (
                  <SelectReceiptMethod
                    onBack={handleBack}
                    selectedAmount={selectedAmount}
                    selectedToken={selectedToken}
                    selectedDescription={selectedDescription}
                    theme={config.theme}
                    logo={config.logo}
                    buttonColor={config.buttonColor}
                    currencies={config.assets}
                    chainId={chainId || ""}
                    setChainId={setChainId}
                    networks={config.networks}
                    widgetAddress={address || ""}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function WidgetExt() {
  return (
    <WidgetWalletProvider>
      <WidgetContent />
    </WidgetWalletProvider>
  );
}
