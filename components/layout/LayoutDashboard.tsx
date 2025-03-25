import React from "react";
import Header from "../common/Header";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e6e7e9] text-black">
      <Header />
      <div className="flex justify-center items-center flex-grow mt-10">
        <div className="w-[380px] tablet:w-[450px] p-4 bg-white rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
