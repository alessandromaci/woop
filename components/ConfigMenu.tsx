import React from "react";

interface ConfigMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
  logo: string;
  setLogo: (logo: string) => void;
}

const ConfigMenu: React.FC<ConfigMenuProps> = ({
  theme,
  setTheme,
  logo,
  setLogo,
}) => {
  return (
    <div className="w-2/5 h-screen bg-gray-100 p-6 border-r border-gray-300">
      <h2 className="text-2xl font-bold mb-6">Customize</h2>

      {/* Theme Selector */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Theme</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("black")}
            className={`w-full py-2 rounded-lg ${
              theme === "black"
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Black
          </button>
          <button
            onClick={() => setTheme("white")}
            className={`w-full py-2 rounded-lg ${
              theme === "white"
                ? "bg-white text-black border border-gray-300"
                : "bg-gray-200 text-black"
            }`}
          >
            White
          </button>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <h3 className="text-lg font-medium mb-3">Logo</h3>
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
        {logo && (
          <img
            src={logo}
            alt="Uploaded Logo"
            className="mt-4 w-24 h-24 object-contain border border-gray-300"
          />
        )}
      </div>
    </div>
  );
};

export default ConfigMenu;
