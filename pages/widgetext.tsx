import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SEO from "../components/common/Seo";
import RequestAmount from "../components/Payment/1_RequestAmount";
import SelectReceiptMethod from "../components/Payment/2_SelectReceiptMethod";
import Navigation from "../components/common/Navigation";
import { tokensDetails } from "../utils/constants";

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

export default function WidgetExt() {
  const router = useRouter();
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  // Existing widget state
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedAmount, setSelectedAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState();
  const [selectedDescription, setSelectedDescription] = React.useState("");
  const [chainId, setChainId] = React.useState<string>("");

  // Navigation state
  const [activeModule, setActiveModule] = React.useState("receive");

  // Check if we're in an iframe
  useEffect(() => {
    setIsIframe(window !== window.parent);
  }, []);

  // Parse URL parameters and set initial config
  useEffect(() => {
    if (!router.isReady) return;

    const { appCode, assets, modules, networks, theme, buttonColor, logo } =
      router.query;

    // Only update config if we're in an iframe and have parameters
    if (isIframe && appCode) {
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
  }, [router.isReady, router.query, isIframe]);

  // Handle postMessage communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In development, you might want to allow localhost
      const allowedOrigins = [
        "https://your-wallet-sdk-client.com",
        "http://localhost:3000",
        "http://localhost:8000",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Unauthorized origin:", event.origin);
        return;
      }

      const { type, payload } = event.data;

      if (type === "WOOP_CONNECT") {
        const { address, chainId: newChainId, provider } = payload;
        console.log("Received wallet info:", { address, chainId: newChainId });

        setWallet({ address, chainId: newChainId, provider });
        setChainId(newChainId);

        // Store provider in window for component access
        (window as any).ethereum = provider;
      }
    };

    if (isIframe) {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, [isIframe]);

  return (
    <>
      <SEO title="Woop Widget" description="Woop Payment Widget" />
      <div
        className={`rounded ${
          config.theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        {/* Navigation Menu */}
        <Navigation
          modules={config.modules}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          theme={config.theme}
        />

        {/* Widget Content based on active module */}
        {activeModule === "receive" && (
          <>
            {currentStep === 1 && (
              <RequestAmount
                onContinue={(amount: any, token: any, description: string) => {
                  setSelectedAmount(amount);
                  setSelectedToken(token);
                  setSelectedDescription(description);
                  setCurrentStep(2);
                }}
                theme={config.theme}
                logo={config.logo}
                buttonColor={config.buttonColor}
                currencies={config.assets}
                chainId={chainId}
                setChainId={setChainId}
              />
            )}
            {currentStep === 2 && (
              <SelectReceiptMethod
                onBack={() => setCurrentStep(1)}
                selectedAmount={selectedAmount}
                selectedToken={selectedToken}
                selectedDescription={selectedDescription}
                theme={config.theme}
                logo={config.logo}
                buttonColor={config.buttonColor}
                currencies={config.assets}
                chainId={chainId}
                setChainId={setChainId}
              />
            )}
          </>
        )}
        {/* Add other module components here (invest, NFTs, etc.) */}
      </div>
    </>
  );
}
