import React from "react";
import Link from "next/link";

interface NavigationProps {
  activeTab: "receive" | "invest" | "nfts";
}

export default function Navigation({ activeTab }: NavigationProps) {
  return (
    <div className="flex items-center justify-between gap-2 mt-2 mb-2">
      <Link
        href="/"
        className={`flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/3 h-10 rounded-lg transition-all ${
          activeTab === "receive"
            ? "bg-[#4285F4] text-white"
            : "bg-[#F5F5F5] text-[#666666] hover:bg-[#EBEBEB]"
        }`}
      >
        Receive
      </Link>
      {/* Invest - Coming Soon */}
      <div className="relative w-1/3">
        <div className="flex justify-center items-center font-sans text-sm leading-snug font-medium h-10 rounded-lg bg-[#F5F5F5] text-[#666666] opacity-75">
          Invest
        </div>
        <div className="absolute right-0 top-0 -translate-y-1/2 px-2 py-1 bg-blue-400 text-white text-xs rounded-full font-sans">
          WIP
        </div>
      </div>
      {/* NFTs - Coming Soon */}
      <div className="relative w-1/3">
        <div className="flex justify-center items-center font-sans text-sm leading-snug font-medium h-10 rounded-lg bg-[#F5F5F5] text-[#666666] opacity-75">
          NFTs
        </div>
        <div className="absolute right-0 top-0 -translate-y-1/2 px-2 py-1 bg-blue-400 text-white text-xs rounded-full font-sans">
          WIP
        </div>
      </div>
    </div>
  );
}
