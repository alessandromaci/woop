import router from "next/router";
import React from "react";

interface NavigationProps {
  modules: {
    enableReceive: boolean;
    enableInvest: boolean;
    enableNFTs: boolean;
  };
  activeModule: "receive" | "invest" | "nfts";
  setActiveModule: React.Dispatch<
    React.SetStateAction<"receive" | "invest" | "nfts">
  >;
  theme: "light" | "dark" | "system";
  buttonColor: string;
}

export default function Navigation({
  modules,
  activeModule,
  setActiveModule,
  buttonColor,
  theme,
}: NavigationProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-2 mb-2">
      {/* Receive Tab */}
      <button
        className={`flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/3 h-10 rounded-lg transition-colors ${
          activeModule === "receive"
            ? "text-white" + (theme === "dark" ? " bg-blue-600" : "")
            : theme === "dark"
            ? "bg-gray-700 text-gray-400"
            : "bg-[#F5F5F5] text-[#666666]"
        }`}
        style={
          activeModule === "receive"
            ? { backgroundColor: buttonColor, borderColor: buttonColor }
            : {}
        }
        onClick={() => {
          setActiveModule("receive");
          router.push("/");
        }}
      >
        Receive
      </button>
      {/* Invest Tab */}
      <button
        className={`relative w-1/3 flex justify-center items-center font-sans text-sm leading-snug font-medium h-10 rounded-lg transition-colors ${
          activeModule === "invest"
            ? "text-white" + (theme === "dark" ? " bg-blue-600" : "")
            : theme === "dark"
            ? "bg-gray-700 text-gray-400"
            : "bg-[#F5F5F5] text-[#666666]"
        }`}
        style={
          activeModule === "invest"
            ? { backgroundColor: buttonColor, borderColor: buttonColor }
            : {}
        }
        onClick={() => {
          setActiveModule("invest");
          router.push("/invest");
        }}
      >
        Invest
      </button>
      {/* NFTs - Coming Soon */}
      <div className="relative w-1/3">
        <div
          className={`flex justify-center items-center font-sans text-sm leading-snug font-medium h-10 rounded-lg ${
            theme === "dark"
              ? "bg-gray-700 text-gray-400"
              : "bg-[#F5F5F5] text-[#666666]"
          } opacity-75`}
        >
          NFTs
        </div>
        <div className="absolute right-0 top-0 -translate-y-1/2 px-2 py-1 bg-blue-400 text-white text-xs rounded-full font-sans">
          WIP
        </div>
      </div>
    </div>
  );
}
