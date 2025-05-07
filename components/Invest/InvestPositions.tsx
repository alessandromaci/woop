import React from "react";
import Image from "next/image";

const fakePositions = [
  {
    platform: "Morpho",
    logo: "/morpho.png",
    name: "USDC Lending",
    invested: 1369.57,
    return: 110.03,
  },
  // Add more fake positions as needed
];

export default function InvestPositions() {
  return (
    <div>
      <div className="text-blue-600 font-semibold mb-2">Open investments</div>
      <div className="flex flex-col gap-3">
        {fakePositions.map((pos, i) => (
          <div
            key={i}
            className="flex items-center bg-gray-50 rounded-xl p-4 shadow"
          >
            <Image
              src={pos.logo}
              alt={pos.platform}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-4 flex-1">
              <div className="font-bold text-gray-800">{pos.name}</div>
              <div className="text-sm text-gray-500">
                Platform: {pos.platform}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800">
                ${pos.invested.toLocaleString()}
              </div>
              <div className="text-green-500 text-xs">
                (+${pos.return.toLocaleString()})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
