import React, { createContext, useContext, useEffect, useState } from "react";

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

interface WidgetWalletProvider {
  request: (args: RequestArguments) => Promise<unknown>;
  on?: (event: string, callback: any) => void;
  removeListener?: (event: string, callback: any) => void;
}

interface WidgetWalletContextType {
  address: string | null;
  chainId: string | null;
  provider: WidgetWalletProvider | null;
  isConnected: boolean;
  requestWallet: (method: string, params?: any) => Promise<any>;
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
        "https://woop-git-handlewalletconnectionwidget-woop-pay.vercel.app",
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Unauthorized origin:", event.origin);
        return;
      }

      const { type, payload, method, params, id } = event.data;

      if (type === "WOOP_CONNECT") {
        const { address, chainId: newChainId, provider: newProvider } = payload;
        console.log("Received WOOP_CONNECT:", {
          address,
          chainId: newChainId,
          hasProvider: !!newProvider,
          origin: event.origin,
        });

        if (!address || !newChainId) {
          console.warn("Missing required wallet info:", {
            address,
            chainId: newChainId,
          });
          return;
        }

        // Convert chainId to decimal if it's in hex format
        const normalizedChainId = newChainId.startsWith("0x")
          ? parseInt(newChainId, 16).toString()
          : newChainId;

        // Update state atomically to avoid race conditions
        setAddress(address);
        setChainId(normalizedChainId);
        setIsConnected(true);

        // Create a generic proxy provider that will relay requests to the parent
        const proxyProvider: WidgetWalletProvider = {
          request: (args: RequestArguments) => {
            return requestWallet(args.method, args.params);
          },
        };

        setProvider(proxyProvider);

        // Store provider in window for component access
        (window as any).ethereum = proxyProvider;

        // Notify any listeners that wallet is connected
        window.dispatchEvent(
          new CustomEvent("walletConnected", {
            detail: { address, chainId: normalizedChainId },
          })
        );
      }

      // Handle wallet requests
      if (type === "WOOP_WALLET_REQUEST" && provider) {
        (async () => {
          let result, error;
          try {
            result = await provider.request({ method, params });
          } catch (e) {
            error = e;
            console.error("Wallet request failed:", e);
          }

          // Always include current wallet state in response
          event.source?.postMessage(
            {
              type: "WOOP_WALLET_RESPONSE",
              method,
              result,
              error,
              id,
              // Include current wallet state
              walletState: {
                address,
                chainId,
                isConnected,
              },
            },
            event.origin as any
          );
        })();
      }
    };

    // Only add event listener if we're in an iframe
    if (window !== window.parent) {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  // Relay utility for wallet actions
  function requestWallet(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).slice(2);
      function handleResponse(event: MessageEvent) {
        if (
          event.data.type === "WOOP_WALLET_RESPONSE" &&
          event.data.id === id
        ) {
          window.removeEventListener("message", handleResponse);
          if (event.data.error) reject(event.data.error);
          else resolve(event.data.result);
        }
      }
      window.addEventListener("message", handleResponse);
      window.parent.postMessage(
        { type: "WOOP_WALLET_REQUEST", method, params, id },
        "*"
      );
    });
  }

  return (
    <WidgetWalletContext.Provider
      value={{
        address,
        chainId,
        provider,
        isConnected,
        requestWallet,
      }}
    >
      {children}
    </WidgetWalletContext.Provider>
  );
};
