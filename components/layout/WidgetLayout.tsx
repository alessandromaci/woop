import React, { useState, useEffect } from "react";
import ConfigMenu from "../ConfigMenu";
import Image from "next/image";
import Header from "../common/Header";
import Footer from "../common/Footer";
import Navigation from "../common/Navigation";
import Wallet from "../common/Wallet";

const wallets = [
  {
    name: "MetaMask",
    gradient: "from-[#FFB23D] to-[#FF7C3D]",
  },
  {
    name: "Phantom",
    gradient: "from-[#C49FFF] to-[#9F7FFF]",
  },
  {
    name: "TrustWallet",
    gradient: "from-[#33C5BB] to-[#3375FF]",
  },
];

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
  const [currentWalletIndex, setCurrentWalletIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldScale, setShouldScale] = useState(false);
  const [activeModule, setActiveModule] = useState<
    "receive" | "invest" | "nfts"
  >("receive");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentWalletIndex((prev) => (prev + 1) % wallets.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getNextWalletIndex = (current: number) =>
    (current + 1) % wallets.length;
  const getPrevWalletIndex = (current: number) =>
    (current - 1 + wallets.length) % wallets.length;

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FF] p-6">
        <div className="text-center space-y-4 max-w-md">
          <Image
            alt="Logo"
            src="/woop_logo.png"
            width={120}
            height={90}
            priority
            className="mx-auto"
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Desktop Only Feature
          </h1>
          <p className="text-gray-600">
            The Woop widget configuration is currently only available on desktop
            devices. Please access this page from your computer for the best
            experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FF]">
      {/* Header */}
      <Header isWidget={true} isDashboard={false} />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Config Menu */}
        <div className="w-[280px] bg-white border-r border-gray-200 relative z-10 flex flex-col">
          <div className="py-6 px-2 origin-top transform scale-[0.85]">
            <ConfigMenu
              theme={theme}
              setTheme={setTheme}
              logo={logo}
              setLogo={setLogo}
              buttonColor={buttonColor}
              setButtonColor={setButtonColor}
              currencies={currencies}
              setCurrencies={setCurrencies}
              hideDeploySection={true}
            />
          </div>
        </div>

        {/* Center Preview with Carousel */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Preview Widgets - Hidden on mobile */}
          <div className="absolute w-full h-full hidden lg:flex justify-center items-center">
            {/* Left Preview Widget */}
            <div className="absolute transform -translate-x-[350px] -rotate-[15deg] scale-[0.6] opacity-30 transition-all duration-500">
              <div className="relative mt-[90px]">
                <div className="absolute w-full h-[100px] top-[-90px] rounded-t-2xl overflow-hidden shadow-lg">
                  <div
                    className={`w-full h-full bg-gradient-to-r ${
                      wallets[getPrevWalletIndex(currentWalletIndex)].gradient
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-between px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white backdrop-blur-sm flex items-center justify-center p-2 shadow-md">
                          <Image
                            src={`/${
                              wallets[getPrevWalletIndex(currentWalletIndex)]
                                .name
                            }.png`}
                            alt={
                              wallets[getPrevWalletIndex(currentWalletIndex)]
                                .name
                            }
                            width={32}
                            height={32}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[380px] h-[400px] bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-8">
                    {/* Woop Logo */}
                    <div className="flex justify-center mb-6">
                      <Image
                        alt="Logo"
                        src="/woop_logo.png"
                        width={90}
                        height={70}
                        priority
                      />
                    </div>
                    <Navigation
                      modules={{
                        enableReceive: true,
                        enableInvest: true,
                        enableNFTs: true,
                      }}
                      activeModule={activeModule}
                      setActiveModule={setActiveModule}
                    />
                    {/* Placeholder Content */}
                    <div className="p-6 space-y-4">
                      <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="h-12 bg-gray-100 rounded-full mt-6 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Preview Widget */}
            <div className="absolute transform translate-x-[350px] rotate-[15deg] scale-[0.6] opacity-30 transition-all duration-500">
              <div className="relative mt-[90px]">
                <div className="absolute w-full h-[100px] top-[-90px] rounded-t-2xl overflow-hidden shadow-lg">
                  <div
                    className={`w-full h-full bg-gradient-to-r ${
                      wallets[getNextWalletIndex(currentWalletIndex)].gradient
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-between px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white backdrop-blur-sm flex items-center justify-center p-2 shadow-md">
                          <Image
                            src={`/${
                              wallets[getNextWalletIndex(currentWalletIndex)]
                                .name
                            }.png`}
                            alt={
                              wallets[getNextWalletIndex(currentWalletIndex)]
                                .name
                            }
                            width={32}
                            height={32}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[380px] h-[400px] bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-8">
                    {/* Woop Logo */}
                    <div className="flex justify-center mb-6">
                      <Image
                        alt="Logo"
                        src="/woop_logo.png"
                        width={90}
                        height={70}
                        priority
                      />
                    </div>
                    <Navigation
                      modules={{
                        enableReceive: true,
                        enableInvest: true,
                        enableNFTs: true,
                      }}
                      activeModule={activeModule}
                      setActiveModule={setActiveModule}
                    />
                    {/* Placeholder Content */}
                    <div className="p-6 space-y-4">
                      <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="h-12 bg-gray-100 rounded-full mt-6 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Widget */}
          <div className="relative mt-[90px] transform scale-[0.75] z-10">
            {/* Wallet Header */}
            <div className="absolute w-full h-[100px] top-[-90px] rounded-t-2xl overflow-hidden shadow-lg">
              <div
                className={`w-full h-full bg-gradient-to-r transition-opacity duration-1000 ${
                  wallets[currentWalletIndex].gradient
                } ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              >
                {/* Wallet Info */}
                <div className="absolute inset-0 flex items-center justify-between px-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white backdrop-blur-sm flex items-center justify-center p-2 shadow-md">
                      <Image
                        src={`/${wallets[currentWalletIndex].name}.png`}
                        alt={wallets[currentWalletIndex].name}
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                  <Wallet />
                </div>
              </div>
            </div>

            {/* Widget Content */}
            <div className="w-[380px] tablet:w-[450px] p-4 bg-white rounded-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
              <div className="flex flex-col w-full">
                {/* Woop Logo */}
                <div className="flex justify-center mt-4 mb-6">
                  <Image
                    alt="Logo"
                    src="/woop_logo.png"
                    width={90}
                    height={70}
                    priority
                  />
                </div>
                <Navigation
                  modules={{
                    enableReceive: true,
                    enableInvest: true,
                    enableNFTs: true,
                  }}
                  activeModule={activeModule}
                  setActiveModule={setActiveModule}
                />
                {children}
              </div>
            </div>
          </div>
        </div>

        {/* Right Integration Details */}
        <div className="w-[280px] bg-white py-6 px-6 border-l border-gray-200 relative z-10">
          {/* Integration Steps */}
          <div>
            <p className="text-sm text-gray-600 mb-6">
              {`Fill in your company name and Telegram handle above and click
              Deploy.`}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {`We'll send you a custom code snippet via email that's ready to
              use.`}
            </p>
            <p className="text-sm text-gray-600">
              {`Simply add the code snippet to your website's HTML and you're
              ready to go!`}
            </p>
          </div>
          <div className="mt-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.target as HTMLFormElement);
                const leadDetails = {
                  company: data.get("company"),
                  telegram: data.get("telegram"),
                };
                window.location.href = `mailto:hello@woop.ink?subject=Widget Deployment Request&body=${encodeURIComponent(
                  `Hi, I would like to integrate the Woop widget. Here is my data:

Company: ${leadDetails.company}
Telegram: ${leadDetails.telegram}

Thanks!`
                )}`;
              }}
              className="space-y-4"
            >
              <div className="space-y-3">
                {/* Company Name Input */}
                <input
                  type="text"
                  name="company"
                  placeholder="Company Name"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                {/* Telegram Handle Input */}
                <input
                  type="text"
                  name="telegram"
                  placeholder="Telegram Handle"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Deploy Button */}
              <button
                type="submit"
                className="w-full bg-[#4B6BFB] text-white text-sm py-2 rounded-full font-sans font-medium hover:bg-[#3b56e6] transition-colors"
              >
                Deploy
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WidgetLayout;
