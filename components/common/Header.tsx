import React from "react";
import Image from "next/image";
import Logo from "../../public/woop_logo.png";
import Wallet from "./Wallet";
import { useRouter } from "next/router";
import { telegramLink } from "../../utils/constants";

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 w-full flex justify-between p-7 z-30 items-center bg-transparent">
      {/* Logo Section with Dropdown */}
      <div className="relative">
        {/* Logo */}
        <div className="flex items-center">
          <Image alt="woop" src={Logo} width={80} height={60} />

          {/* Dropdown Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-2 flex items-center focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-6 w-6 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 8h16M4 16h16"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <p className="block w-full text-left font-sans text-bold font-medium px-4 py-2 text-gray-800">
              App
            </p>
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/");
              }}
              className="block w-full text-left font-sans font-medium px-4 py-2 text-gray-400 hover:bg-gray-100"
            >
              {`Request`}
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/widget");
              }}
              className="block w-full text-left font-sans font-medium px-4 py-2 text-gray-400 hover:bg-gray-100"
            >
              {`Widget`}
            </button>
            <p className="block w-full text-left font-sans text-bold font-medium px-4 py-2 text-gray-800 mt-4">
              Need help?
            </p>
            {/* Updated Contact Us Button */}
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left font-sans font-medium px-4 py-2 text-gray-400 hover:bg-gray-100"
            >
              {`Contact us`}
            </a>
          </div>
        )}
      </div>

      {/* Wallet Section */}
      <Wallet />
    </div>
  );
};

export default Header;
