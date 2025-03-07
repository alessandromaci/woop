import * as React from "react";
import Layout from "../components/layout/LayoutReceive";
//import Payment from "../components/Payment/Payment";
import RequestAmount from "../components/Payment/1_RequestAmount";
import SelectReceiptMethod from "../components/Payment/2_SelectReceiptMethod ";
import SEO from "../components/common/Seo";
import { tokensDetails } from "../utils/constants";

export default function Home() {
  const [theme] = React.useState("white");
  const [logo] = React.useState("");
  const [buttonColor] = React.useState("#007BFF");
  const [chainId, setChainId] = React.useState<string>("");
  const [currencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedAmount, setSelectedAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState();
  const [selectedDescription, setSelectedDescription] = React.useState("");

  return (
    <>
      <SEO
        title="Woop | Create Cryptocurrency Payment Requests Easily"
        description="Woop is the easiest way to create, track, and receive cryptocurrency payment requests. Designed for both crypto natives and beginners."
        rrssImg="./RRSS.jpg"
      />
      {/* <Layout>
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
      </Layout> */}
      <Layout>
        {currentStep === 1 && (
          <RequestAmount
            onContinue={(amount: any, token: any, description: string) => {
              setSelectedAmount(amount);
              setSelectedToken(token);
              setSelectedDescription(description);
              setCurrentStep(2);
            }}
            theme={theme}
            logo={logo}
            buttonColor={buttonColor}
            currencies={currencies}
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
            theme={theme}
            logo={logo}
            buttonColor={buttonColor}
            currencies={currencies}
            chainId={chainId}
            setChainId={setChainId}
          />
        )}
      </Layout>
    </>
  );
}
