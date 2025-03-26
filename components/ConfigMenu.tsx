import React from "react";
import Wallet from "./common/Wallet";
import Image from "next/image";
import woopLogo from "../public/woop_logo.png";
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
  hideDeploySection?: boolean;
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
  hideDeploySection = false,
}) => {
  const handleCurrencyToggle = (currency: string) => {
    setCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((cur) => cur !== currency)
        : [...prev, currency]
    );
  };

  React.useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-gray-800 mb-3">{children}</h3>
  );

  return (
    <div className="text-gray-800 space-y-6">
      {/* Display Mode */}
      <div>
        <SectionTitle>Display Mode</SectionTitle>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              theme === "light"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              theme === "dark"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Dark
          </button>
        </div>
      </div>

      {/* Color Theme */}
      <div>
        <SectionTitle>Color Theme</SectionTitle>
        <div className="flex flex-wrap gap-3">
          {[
            "#4B6BFB", // Blue
            "#FF4500", // Orange
            "#28A745", // Green
            "#6C5CE7", // Purple
            "#00B894", // Teal
            "#FF6B6B", // Red
          ].map((color) => (
            <button
              key={color}
              onClick={() => setButtonColor(color)}
              className={`w-10 h-10 rounded-xl transition-transform hover:scale-110 ${
                buttonColor === color
                  ? "ring-2 ring-offset-2 ring-gray-800"
                  : ""
              }`}
              style={{ backgroundColor: color }}
            ></button>
          ))}
          <div className="relative">
            <input
              type="color"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
            />
            <div
              className="w-10 h-10 rounded-xl cursor-pointer transition-transform hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, #FF0000, #FF8C00, #FFD700, #28A745, #4B6BFB, #8A2BE2)",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <SectionTitle>Logo</SectionTitle>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setLogo(URL.createObjectURL(e.target.files[0]));
              }
            }}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="flex items-center justify-center w-full h-12 px-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-600">Choose Logo File</span>
          </label>
        </div>
      </div>

      {/* Currencies */}
      <div>
        <SectionTitle>Supported Currencies</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {tokensDetails.map((token) => (
            <label
              key={token.label}
              className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${
                currencies.includes(token.label)
                  ? "bg-blue-50 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border transition-colors ${
                  currencies.includes(token.label)
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-400"
                }`}
              >
                {currencies.includes(token.label) && (
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src={token.logo}
                  alt={token.label}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">{token.label}</span>
              </div>
              <input
                type="checkbox"
                checked={currencies.includes(token.label)}
                onChange={() => handleCurrencyToggle(token.label)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfigMenu;
