import React from "react";
import ConfigMenu from "../ConfigMenu";

const WidgetLayout = ({
  children,
  theme,
  setTheme,
  logo,
  setLogo,
  currencies,
  setCurrencies,
}: any) => {
  return (
    <div className="flex h-screen">
      {/* Left Config Menu */}
      <div className="w-5/12 md:w-fit h-screen bg-white p-4 border-r border-gray-300">
        <ConfigMenu
          theme={theme}
          setTheme={setTheme}
          logo={logo}
          setLogo={setLogo}
          currencies={currencies}
          setCurrencies={setCurrencies}
        />
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white p-4">
        <div
          className={`max-w-2xl mx-auto ${theme == "dark" ? "bg-black" : ""} `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default WidgetLayout;
