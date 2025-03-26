import React, { useState, useEffect } from "react";
import Header from "../common/Header";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import Wallet from "../common/Wallet";
import Footer from "../common/Footer";
import Navigation from "../common/Navigation";
import { useRouter } from "next/router";

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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [currentWalletIndex, setCurrentWalletIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const getNextWalletIndex = (current: number) =>
    (current + 1) % wallets.length;
  const getPrevWalletIndex = (current: number) =>
    (current - 1 + wallets.length) % wallets.length;

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

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8F9FF]">
      <Header isDashboard={true} />
      <main className="flex-1 flex flex-col justify-center items-center relative pt-16 sm:py-8">
        {/* Preview Widgets - Hidden on mobile */}
        <div className="absolute w-full h-full hidden lg:flex justify-center items-center pointer-events-none">
          {/* Left Preview Widget */}
          <div className="absolute transform -translate-x-[350px] -translate-y-[50px] -rotate-[15deg] scale-[0.6] opacity-30 transition-all duration-500">
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
                            wallets[getPrevWalletIndex(currentWalletIndex)].name
                          }.png`}
                          alt={
                            wallets[getPrevWalletIndex(currentWalletIndex)].name
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
                  <Navigation activeTab="receive" />
                  {/* Placeholder Content */}
                  <div className="space-y-4">
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
          <div className="absolute transform translate-x-[350px] -translate-y-[50px] rotate-[15deg] scale-[0.6] opacity-30 transition-all duration-500">
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
                            wallets[getNextWalletIndex(currentWalletIndex)].name
                          }.png`}
                          alt={
                            wallets[getNextWalletIndex(currentWalletIndex)].name
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
                  <Navigation activeTab="receive" />
                  {/* Placeholder Content */}
                  <div className="space-y-4">
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
        <div className="relative lg:transform lg:scale-[0.75] z-10 mt-12 sm:mt-0">
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
                  <div className="w-10 h-10 rounded-full bg-white backdrop-blur-sm flex items-center justify-center p-2">
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
          <div className="w-[380px] tablet:w-[450px] p-4 bg-white rounded-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="flex flex-col w-full">
              {/* Logo and Close Button */}
              <div className="flex justify-between items-center mt-2 mb-6">
                <div className="flex justify-center">
                  <Image
                    alt="Logo"
                    src="/woop_logo.png"
                    width={90}
                    height={70}
                    priority
                  />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center cursor-pointer hover:bg-[#EBEBEB] transition-colors">
                  <button
                    className="flex p-1.5"
                    onClick={() => router.push("/")}
                    type="button"
                  >
                    <CloseIcon className="text-[#666666]" />
                  </button>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
