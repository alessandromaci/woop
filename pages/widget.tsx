import React from "react";
import SEO from "../components/common/Seo";
import WidgetLayout from "../components/layout/WidgetLayout";
import Payment from "../components/Payment/Payment";

export default function WidgetPage() {
  const [theme, setTheme] = React.useState("white");
  const [logo, setLogo] = React.useState("/default_logo.png");

  return (
    <>
      <SEO title="Widget" description="Customize your widget settings." />
      <WidgetLayout
        theme={theme}
        setTheme={setTheme}
        logo={logo}
        setLogo={setLogo}
      >
        <div
          className={`h-full ${
            theme === "black" ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <Payment />
        </div>
      </WidgetLayout>
    </>
  );
}
