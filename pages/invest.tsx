import * as React from "react";
import LayoutInvest from "../components/layout/LayoutInvest";
import SEO from "../components/common/Seo";
import InvestOverview from "../components/Invest/InvestOverview";
import InvestPositions from "../components/Invest/InvestPositions";
import InvestOptions from "../components/Invest/InvestOptions";

export default function Invest() {
  const [activeModule, setActiveModule] = React.useState<
    "receive" | "invest" | "nfts"
  >("invest");
  const [buttonColor, setButtonColor] = React.useState("#007BFF");
  const [showInvestOptions, setShowInvestOptions] = React.useState(false);

  return (
    <>
      <SEO
        title="Woop | Invest in Cryptocurrency"
        description="Invest in cryptocurrency easily with Woop. Coming soon!"
        rrssImg="./RRSS.jpg"
      />
      {showInvestOptions ? (
        <LayoutInvest
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          buttonColor={buttonColor}
          onBack={() => setShowInvestOptions(false)}
        >
          <InvestOptions
            theme="light"
            buttonColor={buttonColor}
            onBack={() => setShowInvestOptions(false)}
          />
        </LayoutInvest>
      ) : (
        <LayoutInvest
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          buttonColor={buttonColor}
        >
          <div className="flex flex-col gap-2">
            <InvestOverview onInvestClick={() => setShowInvestOptions(true)} />
            <InvestPositions />
          </div>
        </LayoutInvest>
      )}
    </>
  );
}
