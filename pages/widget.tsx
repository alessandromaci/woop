import React from "react";
import SEO from "../components/common/Seo";
import WidgetLayout from "../components/layout/WidgetLayout";
import Payment from "../components/Payment/Payment";
import { tokensDetails } from "../utils/constants";

export default function WidgetPage() {
  const [theme, setTheme] = React.useState("white");
  const [logo, setLogo] = React.useState("");
  const [currencies, setCurrencies] = React.useState(
    tokensDetails.map((token) => token.label)
  );

  return (
    <>
      <SEO title="Widget" description="Customize your widget settings." />
      <WidgetLayout
        theme={theme}
        setTheme={setTheme}
        logo={logo}
        setLogo={setLogo}
        currencies={currencies}
        setCurrencies={setCurrencies}
      >
        <div className={`border border-black`}>
          <Payment logo={logo} theme={theme} />
        </div>
      </WidgetLayout>
    </>
  );
}
