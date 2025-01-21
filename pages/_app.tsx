import * as React from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { http, WagmiProvider } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  optimism,
  arbitrum,
  base,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Smartlook from "smartlook-client";

import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const config = getDefaultConfig({
  appName: "Woop",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!,
  chains: [mainnet, sepolia, base, optimism, arbitrum],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_MAINNET!),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_ETHEREUM_SEPOLIA!),
    [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_MAINNET!),
    [optimism.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_OPTIMISM_MAINNET!),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_ARBITRUM_MAINNET!),
  },
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  React.useEffect(() => {
    Smartlook.init(process.env.NEXT_PUBLIC_SMARTLOOK_KEY ?? "");
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "light" : "dark",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact">
            <ThemeProvider theme={theme}>
              <CssBaseline>
                <Component {...pageProps} />
              </CssBaseline>
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
