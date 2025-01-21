import React from "react";
import Header from "../common/Header";
import Container from "@mui/material/Container";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div
        className={
          "min-h-screen w-full flex justify-center items-center bg-[#e6e7e9] text-black"
        }
      >
        <Container className="relative z-10 w-full max-w-screen-xl p-2 mt-8 md:mt-16 bg-white rounded-lg">
          {children}
        </Container>
      </div>
    </>
  );
}
