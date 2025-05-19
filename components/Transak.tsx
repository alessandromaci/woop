import { Transak } from "@transak/transak-sdk";
import React from "react";

interface InstantOffRampProps {
  onWalletAddressReceived: (address: string) => void;
  onNetworkReceived: (address: string) => void;
  onBankMethodReceived: (address: string) => void;
  onBankCardNumberReceived: (address: string) => void;
}

const InstantOffRampEventsSDK: React.FC<InstantOffRampProps> = ({
  onWalletAddressReceived,
  onNetworkReceived,
  onBankMethodReceived,
  onBankCardNumberReceived,
}) => {
  const globalStagingAPIKey = process.env.NEXT_PUBLIC_TRANSAK_API!;

  React.useEffect(() => {
    const transak = new Transak({
      apiKey: globalStagingAPIKey,
      environment: Transak.ENVIRONMENTS.PRODUCTION,
      isTransakStreamOffRamp: true,
      cryptoCurrencyCode: "USDC",
      networks: "base,ethereum,arbitrum,optimism",
      redirectURL: "https://www.app.woopwidget.com/",
    });

    transak.init();

    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, (eventData: any) => {
      console.log("Widget Closed:", eventData);
      transak.close();

      if (eventData?.status.offRampStreamWalletAddress) {
        const walletAddress = eventData.status.offRampStreamWalletAddress;
        const network = eventData.status.network;
        const bankMethod = eventData.status.withdrawalMethod;
        const bankCardNumber = eventData.status.withdrawalInstrument;
        onNetworkReceived(network);
        onBankMethodReceived(bankMethod);
        onBankCardNumberReceived(bankCardNumber);
        onWalletAddressReceived(walletAddress);
      }
    });

    return () => {
      transak.cleanup();
      setTimeout(() => {
        const transakRoot = document.getElementById("transakRoot");
        if (transakRoot) transakRoot.remove();
      }, 500);
    };
  }, []);

  return <div id="transakMount" />;
};

export default InstantOffRampEventsSDK;
