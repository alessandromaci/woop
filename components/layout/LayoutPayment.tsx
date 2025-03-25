import React from "react";
import Header from "../common/Header";
import Image from "next/image";
import Navigation from "../common/Navigation";
import CloseIcon from "@mui/icons-material/Close";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: "receive" | "invest" | "nfts";
  onBack?: () => void;
}

export default function Layout({ children, activeTab, onBack }: LayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e6e7e9] text-black">
      <Header />
      <div className="flex justify-center items-center flex-grow mt-10">
        <div className="w-[380px] tablet:w-[450px] p-4 bg-white rounded-lg">
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
  );
}
