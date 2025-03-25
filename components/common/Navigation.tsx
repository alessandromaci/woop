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
      <Link
        href="/invest"
        className={`flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/3 h-10 rounded-lg transition-all ${
          activeTab === "invest"
            ? "bg-[#4285F4] text-white"
            : "bg-[#F5F5F5] text-[#666666] hover:bg-[#EBEBEB]"
        }`}
      >
        Invest
      </Link>
      <Link
        href="/nfts"
        className={`flex justify-center items-center font-sans text-sm leading-snug font-medium w-1/3 h-10 rounded-lg transition-all ${
          activeTab === "nfts"
            ? "bg-[#4285F4] text-white"
            : "bg-[#F5F5F5] text-[#666666] hover:bg-[#EBEBEB]"
        }`}
      >
        NFTs
      </Link>
    </div>
  );
}
