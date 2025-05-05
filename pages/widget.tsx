import React from "react";
import SEO from "../components/common/Seo";
import WidgetLayout from "../components/layout/WidgetLayout";
import RequestAmount from "../components/Payment/1_RequestAmount";
import { tokensDetails } from "../utils/constants";

export default function WidgetPage() {
  const [theme, setTheme] = React.useState("white");
  const [logo, setLogo] = React.useState("");
  const [buttonColor, setButtonColor] = React.useState("#007BFF");
  const [currencies, setCurrencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );
  const [chainId, setChainId] = React.useState<string>("");
  const [demoMessage, setDemoMessage] = React.useState("");
  const [continueDisabled, setContinueDisabled] = React.useState(false);

  // Handler for demo continue
  const handleDemoContinue = () => {
    setContinueDisabled(true);
    setDemoMessage("This is a demo. The continue button is disabled.");
  };

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
          className={`rounded ${
            theme === "dark" ? "bg-[#23262F]" : "bg-white"
          }`}
        >
          {continueDisabled && (
            <div className="flex items-center justify-center mt-4">
              <span className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium border border-yellow-200 shadow-sm">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                This is a demo. Continue is disabled.
              </span>
            </div>
          )}
          <RequestAmount
            onContinue={handleDemoContinue}
            theme={theme}
            logo={logo}
            buttonColor={buttonColor}
            currencies={currencies}
            chainId={chainId}
            setChainId={setChainId}
          />
        </div>
      </WidgetLayout>
    </>
  );
}
