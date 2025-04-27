import React, { createContext, useContext, useEffect, useState } from "react";

interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

interface WidgetWalletProvider {
  request: (args: RequestArguments) => Promise<unknown>;
  on?: (event: string, callback: any) => void;
  removeListener?: (event: string, callback: any) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

interface WidgetWalletContextType {
  address: string | null;
  chainId: string | null;
  provider: WidgetWalletProvider | null;
  isConnected: boolean;
}

const WidgetWalletContext = createContext<WidgetWalletContextType | null>(null);

export const useWidgetWallet = () => {
  const context = useContext(WidgetWalletContext);
  if (!context) {
    throw new Error(
      "useWidgetWallet must be used within a WidgetWalletProvider"
    );
  }
  return context;
};

export const WidgetWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [provider, setProvider] = useState<WidgetWalletProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://www.app.woopwidget.com",
        "https://app.woopwidget.com",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Unauthorized origin:", event.origin);
        return;
      }

      const { type, payload } = event.data;

      if (type === "WOOP_CONNECT") {
        const { address, chainId: newChainId, provider } = payload;
        console.log("Received wallet info:", { address, chainId: newChainId });

        setAddress(address);
        setChainId(newChainId);
        setProvider(provider);
        setIsConnected(true);

        // Store provider in window for component access
        (window as any).ethereum = provider;
      }
    };

    // Only add event listener if we're in an iframe
    if (window !== window.parent) {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  return (
    <WidgetWalletContext.Provider
      value={{
        address,
        chainId,
        provider,
        isConnected,
      }}
    >
      {children}
    </WidgetWalletContext.Provider>
  );
};
