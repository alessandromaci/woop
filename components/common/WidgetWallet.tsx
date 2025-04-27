import React from "react";
import { useWidgetWallet } from "./WidgetWalletProvider";

export default function WidgetWallet() {
  const { address, isConnected } = useWidgetWallet();

  return (
    <div className="flex items-center">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          Waiting for wallet connection...
        </div>
      )}
    </div>
  );
}
