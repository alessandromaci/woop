import * as React from "react";
import Layout from "../components/layout/LayoutPayment";
import RequestAmount from "../components/Payment/1_RequestAmount";
import SelectReceiptMethod from "../components/Payment/2_SelectReceiptMethod";
import SEO from "../components/common/Seo";
import { tokensDetails } from "../utils/constants";
import { useState } from "react";

export default function Home() {
  const [theme] = React.useState("white");
  const [logo] = React.useState("");
  const [buttonColor] = React.useState("#007BFF");
  const [chainId, setChainId] = React.useState<string>("");
  const [currencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState();
  const [selectedDescription, setSelectedDescription] = React.useState("");
  const [activeModule, setActiveModule] = useState<
    "receive" | "invest" | "nfts"
  >("receive");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FF]">
      <SEO
        title="Woop | Add More Ways For Using Your Crypto Wallet"
        description="We help crypto wallet providers expand their features. Woop Widget enables seamless integration of payment, investment, and NFT capabilities."
        rrssImg="./RRSS.svg"
      />
      <Layout
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onBack={currentStep === 2 ? () => setCurrentStep(1) : undefined}
      >
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
    </div>
  );
}
