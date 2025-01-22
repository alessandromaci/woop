import React from "react";
import Header from "../common/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-screen w-full flex justify-center items-center bg-[#e6e7e9] text-black">
        <div className="w-[380px] tablet:w-[450px] p-4 bg-white rounded-lg">
          {children}
        </div>
      </div>
    </>
  );
}
