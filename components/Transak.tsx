import { Transak } from "@transak/transak-sdk";
import React from "react";

interface InstantOffRampProps {
  onWalletAddressReceived: (address: string) => void;
}

const InstantOffRampEventsSDK: React.FC<InstantOffRampProps> = ({
  onWalletAddressReceived,
}) => {
  const globalStagingAPIKey = "da9c619d-62b5-4aaf-b3f8-54911324f40e";

  React.useEffect(() => {
    const transak = new Transak({
      apiKey: globalStagingAPIKey,
      environment: Transak.ENVIRONMENTS.STAGING,
      isTransakStreamOffRamp: true,
      cryptoCurrencyCode: "USDC",
      networks: "base",
      productsAvailed: "SELL",
    });

    transak.init();

    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, (eventData: any) => {
      console.log("Widget Closed:", eventData);
      transak.close();

      if (eventData?.status.offRampStreamWalletAddress) {
        const walletAddress = eventData.status.offRampStreamWalletAddress;
        onWalletAddressReceived(walletAddress);
        console.log(walletAddress);
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
