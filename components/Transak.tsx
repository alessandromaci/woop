import { Transak } from "@transak/transak-sdk";
import React from "react";

const InstantOffRampEventsSDK = () => {
  const globalStagingAPIKey = "da9c619d-62b5-4aaf-b3f8-54911324f40e";

  React.useEffect(() => {
    // Initialize Transak
    const transak = new Transak({
      apiKey: globalStagingAPIKey,
      environment: Transak.ENVIRONMENTS.STAGING,
      isTransakStreamOffRamp: true,
      cryptoCurrencyCode: "USDC",
      network: "base",
    });

    // Mount the widget
    transak.init();

    // Add event listener for when the widget is closed
    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, (eventData) => {
      console.log("Widget Closed:", eventData);
      transak.close();
    });

    // Cleanup on component unmount
    return () => {
      transak.cleanup();
    };
  }, []);

  return <div id="transakMount" />;
};

export default InstantOffRampEventsSDK;
