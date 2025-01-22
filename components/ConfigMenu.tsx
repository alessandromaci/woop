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
  buttonColor: string;
  setButtonColor: (buttonColor: string) => void;
  currencies: string[];
  setCurrencies: React.Dispatch<React.SetStateAction<string[]>>;
}

const ConfigMenu: React.FC<ConfigMenuProps> = ({
  theme,
  setTheme,
  logo,
  setLogo,
  buttonColor,
  setButtonColor,
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

  React.useEffect(() => {
    setTheme("light"); // light mode is selected by default
  }, [setTheme]);

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
      <div className="mb-3">
        <Wallet />
      </div>

      {/* Light/Dark Mode Selection */}
      <div className="mb-3">
        <h3 className="text-sm font-medium mb-2">Display Mode</h3>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Colour Selection */}
      <div className="mb-3">
        <h3 className="text-sm font-medium mb-2">Color Theme</h3>
        <div className="flex gap-2">
          {/* Predefined Color Options */}
          <button
            onClick={() => setButtonColor("#007BFF")} // Blue
            className={`w-8 h-8 rounded-full border-2 ${
              buttonColor === "#007BFF" ? "border-black" : "border-transparent"
            }`}
            style={{ backgroundColor: "#007BFF" }}
          ></button>
          <button
            onClick={() => setButtonColor("#FF4500")} // Orange
            className={`w-8 h-8 rounded-full border-2 ${
              buttonColor === "#FF4500" ? "border-black" : "border-transparent"
            }`}
            style={{ backgroundColor: "#FF4500" }}
          ></button>
          <button
            onClick={() => setButtonColor("#28A745")} // Green
            className={`w-8 h-8 rounded-full border-2 ${
              buttonColor === "#28A745" ? "border-black" : "border-transparent"
            }`}
            style={{ backgroundColor: "#28A745" }}
          ></button>

          {/* Optional: Color Picker */}
          <div className="relative">
            {/* The Color Picker */}
            <input
              type="color"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
            />

            {/* Rainbow Circle */}
            <div
              className="w-8 h-8 rounded-full border cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="mb-3">
        <h3 className="text-sm font-medium mb-2">Logo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setLogo(URL.createObjectURL(e.target.files[0]));
            }
          }}
          className="block w-full h-10 text-sm text-gray-500 border border-gray-300 rounded-lg p-2 cursor-pointer"
        />
      </div>

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

      <hr className="my-3" />
      {/* Deploy Section */}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target as HTMLFormElement);
            const leadDetails = {
              company: data.get("company"),
              telegram: data.get("telegram"),
            };
            window.location.href = `mailto:hello@woop.ink?subject=Widget Deployment Request&body=${encodeURIComponent(
              `Hi, I would like to integrate the Woop widget. Here is my data:

Company: ${leadDetails.company}
Telegram: ${leadDetails.telegram}

Thanks!`
            )}`;
          }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            {/* Company Name Input */}
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              required
              className="w-1/2 p-2 border border-gray-300 rounded-lg text-sm"
            />
            {/* Telegram Handle Input */}
            <input
              type="text"
              name="telegram"
              placeholder="Telegram Handle"
              required
              className="w-1/2 p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Deploy Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white text-sm py-2 rounded-full font-sans font-medium hover:bg-blue-600"
          >
            Deploy
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfigMenu;
