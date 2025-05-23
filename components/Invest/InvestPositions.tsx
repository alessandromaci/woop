import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { supabase } from "../../utils/supabaseClient";

// Type for investment position
interface InvestmentPosition {
  protocol: string;
  token: string;
  amount: number;
  return?: number;
  name?: string;
  status: string;
}

// Helper to get platform logo by protocol name
function getPlatformLogo(protocol: string): string {
  if (protocol === "Morpho") return "/morpho.png";
  if (protocol === "Lido") return "/lido.png";
  // Add more as needed
  return "/ethereum.svg";
}

// Helper to get token price in USD
function getTokenPriceUSD(token: string): number {
  if (token === "ETH") return 2200;
  if (token === "BTC") return 100000;
  return 1;
}

// Helper to sum total open investment in USD
export function getTotalOpenInvestmentUSD(
  positions: { amount: number; token: string }[]
): number {
  return positions.reduce(
    (sum, pos) => sum + Number(pos.amount) * getTokenPriceUSD(pos.token),
    0
  );
}

export default function InvestPositions() {
  const { address } = useAccount();
  const [positions, setPositions] = useState<InvestmentPosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPositions() {
      console.log("Connected address:", address);
      const queryAddress = address?.toLowerCase();
      console.log("Querying for address:", queryAddress);
      if (!queryAddress) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("investments")
        .select("protocol, token, amount, status")
        .eq("address", queryAddress)
        .eq("status", "open");
      console.log("Supabase data:", data, "error:", error);
      if (error) {
        setPositions([]);
        setLoading(false);
        return;
      }
      setPositions((data as InvestmentPosition[]) || []);
      setLoading(false);
    }
    fetchPositions();
  }, [address]);

  return (
    <div>
      <div className="text-blue-600 font-semibold mb-2">Open investments</div>
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-xs text-gray-400">Loading...</div>
        ) : positions.length === 0 ? null : (
          Object.values(
            positions.reduce((agg, pos) => {
              const key = `${pos.protocol}_${pos.token}`;
              if (!agg[key]) {
                agg[key] = { ...pos, amount: Number(pos.amount) };
              } else {
                agg[key].amount += Number(pos.amount);
              }
              return agg;
            }, {} as Record<string, InvestmentPosition>)
          ).map((pos, i) => {
            const usdValue = Number(pos.amount) * getTokenPriceUSD(pos.token);
            return (
              <div
                key={i}
                className="flex items-center bg-gray-50 rounded-xl p-4 shadow"
              >
                <Image
                  src={getPlatformLogo(pos.protocol)}
                  alt={pos.protocol}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-4 flex-1">
                  <div className="font-bold text-gray-800">
                    {`${pos.protocol} ${pos.token}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    Platform: {pos.protocol}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {Number(pos.amount).toLocaleString("en-US", {
                      maximumFractionDigits: 6,
                    })}{" "}
                    {pos.token}
                  </div>
                  <div className="text-xs text-gray-500">
                    ≈ $
                    {usdValue.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
