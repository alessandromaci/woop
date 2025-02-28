import * as React from "react";
import Layout from "../components/layout/LayoutReceive";
import Payment from "../components/Payment/Payment";
import InstantOffRampEventsSDK from "../components/Transak";
import SEO from "../components/common/Seo";
import { tokensDetails } from "../utils/constants";

export default function Home() {
  const [theme] = React.useState("white");
  const [logo] = React.useState("");
  const [buttonColor] = React.useState("#007BFF");
  const [recipientAddressTransak, setRecipientAddressTransak] =
    React.useState("");
  const [chainId, setChainId] = React.useState<string>("");
  const [currencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );

  return (
    <>
      <SEO
        title="Woop | Create Cryptocurrency Payment Requests Easily"
        description="Woop is the easiest way to create, track, and receive cryptocurrency payment requests. Designed for both crypto natives and beginners."
        rrssImg="./RRSS.jpg"
      />
      <Layout>
        <Payment
          logo={logo}
          theme={theme}
          buttonColor={buttonColor}
          currencies={currencies}
          recipientAddressTransak={recipientAddressTransak}
          chainId={chainId}
          setChainId={setChainId}
        />
        {chainId === "Bank" && (
          <InstantOffRampEventsSDK
            onWalletAddressReceived={setRecipientAddressTransak}
          />
        )}
      </Layout>
    </>
  );
}
