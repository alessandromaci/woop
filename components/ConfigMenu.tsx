import React from "react";
import Wallet from "./common/Wallet";
import Image from "next/image";
import woopLogo from "../public/woop_logo.png";
import sunDark from "../public/sun-dark.png";
import sunWhite from "../public/sun-white.png";
import moonDark from "../public/moon-dark.png";
import moonWhite from "../public/moon-light.png";
import { tokensDetails } from "../utils/constants";

interface ConfigMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
  logo: string;
  setLogo: (logo: string) => void;
  currencies: string[];
  setCurrencies: React.Dispatch<React.SetStateAction<string[]>>;
}

const ConfigMenu: React.FC<ConfigMenuProps> = ({
  theme,
  setTheme,
  logo,
  setLogo,
  currencies,
  setCurrencies,
}) => {
  const handleCurrencyToggle = (currency: string) => {
    setCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((cur) => cur !== currency)
        : [...prev, currency]
    );
  };

  return (
    <div className="text-black">
      {/* Woop Logo and Widget Button */}
      <div className="flex items-center mb-4">
        <Image alt="Woop Logo" src={woopLogo} width={100} height={80} />
        <span className="bg-blue-500 text-white text-sm px-3 py-1 ml-2 rounded-full font-sans font-medium">
          widget
        </span>
      </div>
      <hr className="my-4" />

      {/* Wallet */}
      <div className="mb-6">
        <Wallet />
      </div>
      <hr className="my-4" />

      {/* Theme Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Display Mode</h3>
        <div className="flex gap-2">
          {/* Dark Mode Button */}
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center justify-center w-full px-4 py-2 border rounded-lg text-sm font-medium font-sans ${
              theme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-white text-black"
            }`}
          >
            <Image
              src={theme === "dark" ? moonWhite : moonDark}
              alt="Dark Mode"
              className="w-5 h-5"
            />
          </button>

          {/* Light Mode Button */}
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center justify-center w-full px-4 py-2 border rounded-lg text-sm font-medium font-sans ${
              theme === "light"
                ? "bg-gray-900 text-white"
                : "bg-white text-black"
            }`}
          >
            <Image
              src={theme === "light" ? sunWhite : sunDark}
              alt="Light Mode"
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>
      <hr className="my-4" />

      {/* Logo Upload */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Logo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setLogo(URL.createObjectURL(e.target.files[0]));
            }
          }}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 cursor-pointer"
        />
      </div>
      <hr className="my-4" />

      {/* Currency Selection */}
      <div>
        <h3 className="text-sm font-medium mb-2">Currencies</h3>
        <div className="grid grid-cols-2 gap-4">
          {tokensDetails.map((token) => (
            <div
              key={token.label}
              className="flex items-center gap-2 cursor-pointer"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={currencies.includes(token.label)}
                onChange={() => handleCurrencyToggle(token.label)}
                className="w-4 h-4 cursor-pointer accent-black"
              />
              <Image
                src={token.logo}
                alt={token.label}
                width={24}
                height={24}
              />
              <span className="text-sm">{token.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfigMenu;
