import ConfigMenu from "../ConfigMenu";
import { ReactNode } from "react";

const WidgetLayout = ({ children, theme, setTheme, logo, setLogo }: any) => {
  return (
    <div className="flex h-screen">
      {/* Left Config Menu */}
      <ConfigMenu
        theme={theme}
        setTheme={setTheme}
        logo={logo}
        setLogo={setLogo}
      />

      {/* Main Content */}
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export default WidgetLayout;
