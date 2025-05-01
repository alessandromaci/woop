import React, { useState } from "react";
import { useWidgetWallet } from "./WidgetWalletProvider";

export default function WidgetWallet() {
  const { address, isConnected, requestWallet } = useWidgetWallet();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  return (
    <div className="flex flex-col items-start">
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
      {accounts.length > 0 && (
        <div className="mt-1 text-xs text-gray-700">
          Accounts: {accounts.join(", ")}
        </div>
      )}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}
