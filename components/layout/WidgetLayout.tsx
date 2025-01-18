import React from "react";
import ConfigMenu from "../ConfigMenu";

const WidgetLayout = ({
  children,
  theme,
  setTheme,
  logo,
  setLogo,
  buttonColor,
  setButtonColor,
  currencies,
  setCurrencies,
}: any) => {
  return (
    <div className="flex h-screen">
      {/* Left Config Menu */}
      <div className="w-5/12 lg:w-1/4 md:w-fit h-screen bg-white p-4 border-r border-gray-300">
        <ConfigMenu
          theme={theme}
          setTheme={setTheme}
          logo={logo}
          setLogo={setLogo}
          buttonColor={buttonColor}
          setButtonColor={setButtonColor}
          currencies={currencies}
          setCurrencies={setCurrencies}
        />
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-200 flex items-center justify-center">
        <div className={`w-full max-w-2xl md:max-w-lg sm:max-w-sm p-4`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default WidgetLayout;
