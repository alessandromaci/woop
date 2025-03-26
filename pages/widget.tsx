import React from "react";
import SEO from "../components/common/Seo";
import WidgetLayout from "../components/layout/WidgetLayout";
import RequestAmount from "../components/Payment/1_RequestAmount";
import SelectReceiptMethod from "../components/Payment/2_SelectReceiptMethod ";
//import Payment from "../components/Payment/Payment";
import { tokensDetails } from "../utils/constants";

export default function WidgetPage() {
  const [theme, setTheme] = React.useState("white");
  const [logo, setLogo] = React.useState("");
  const [buttonColor, setButtonColor] = React.useState("#007BFF");

  const [currencies, setCurrencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );
  const [chainId, setChainId] = React.useState<string>("");
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedAmount, setSelectedAmount] = React.useState("");
  const [selectedToken, setSelectedToken] = React.useState();
  const [selectedDescription, setSelectedDescription] = React.useState("");

  return (
    <>
      <SEO title="Widget" description="Customize your widget settings." />
      <WidgetLayout
        theme={theme}
        setTheme={setTheme}
        logo={logo}
        setLogo={setLogo}
        buttonColor={buttonColor}
        setButtonColor={setButtonColor}
        currencies={currencies}
        setCurrencies={setCurrencies}
      >
        <div
          className={`rounded ${theme === "dark" ? "bg-black" : "bg-white"}`}
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
        </div>
      </WidgetLayout>
    </>
  );
}
