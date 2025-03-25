import React from "react";
import Header from "../common/Header";
import Image from "next/image";
import Navigation from "../common/Navigation";
import CloseIcon from "@mui/icons-material/Close";
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

interface LayoutProps {
  children: React.ReactNode;
  activeTab: "receive" | "invest" | "nfts";
  onBack?: () => void;
}

export default function Layout({ children, activeTab, onBack }: LayoutProps) {
  const [currentWalletIndex, setCurrentWalletIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentWalletIndex((prev) => (prev + 1) % wallets.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e6e7e9] text-black">
      <Header />
      <div className="flex justify-center items-center flex-grow mt-10 relative">
        {/* Widget Container with Background Extension */}
        <div className="relative">
          {/* Wallet Header */}
          <div className="absolute w-full h-[100px] top-[-90px] rounded-t-2xl overflow-hidden">
            <div
              className={`w-full h-full bg-gradient-to-r transition-opacity duration-1000 ${
                wallets[currentWalletIndex].gradient
              } ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            >
              {/* Wallet Info */}
              <div className="absolute inset-0 flex items-center justify-between px-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white backdrop-blur-sm flex items-center justify-center p-2">
                    <Image
                      src={`/${wallets[currentWalletIndex].name}.png`}
                      alt={wallets[currentWalletIndex].name}
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
                {/* Integrate Wallet Component */}
                <Wallet />
              </div>
            </div>
          </div>

          {/* Widget Content */}
          <div className="w-[380px] tablet:w-[450px] p-4 bg-white rounded-2xl relative">
            <div className="flex flex-col w-full">
              {/* Logo and Navigation */}
              <div className="flex flex-col">
                {/* Logo and Close Button */}
                <div
                  className={`flex ${
                    onBack ? "justify-between" : "justify-center"
                  } items-center mt-2 mb-4`}
                >
                  <div
                    className={`${onBack ? "" : "flex justify-center w-full"}`}
                  >
                    <Image
                      alt="Logo"
                      src="/woop_logo.png"
                      width={90}
                      height={70}
                      priority
                    />
                  </div>
                  {onBack && (
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-colors">
                      <button
                        className="flex p-1.5"
                        onClick={onBack}
                        type="button"
                      >
                        <CloseIcon className="text-[#666666]" />
                      </button>
                    </div>
                  )}
                </div>
                {/* Navigation */}
                <Navigation activeTab={activeTab} />
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
