import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { supabase } from "../../utils/supabaseClient";
import { getTokenPriceUSD as getTokenPriceUSDAsync } from "../../utils/helper";
import { investmentOptions } from "../../utils/constants";

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
  const [mounted, setMounted] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [usdLoading, setUsdLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    let mounted = true;
    setUsdLoading(true);
    Promise.all(
      positions.map(async (pos) => {
        const price = await getTokenPriceUSDAsync(pos.token);
        return { token: pos.token, price };
      })
    )
      .then((prices) => {
        if (mounted) {
          const priceMap: Record<string, number> = {};
          prices.forEach((p) => (priceMap[p.token] = p.price));
          setTokenPrices(priceMap);
        }
      })
      .finally(() => setUsdLoading(false));
    return () => {
      mounted = false;
    };
  }, [positions]);

  const normalize = (str: string) =>
    str?.toLowerCase().replace(/[^a-z0-9]/g, "");

  const getPlatformDetails = (protocol: string, token: string) => {
    const normProtocol = normalize(protocol);
    // Try to match by platformName, name, or action
    const opt = investmentOptions.find(
      (o) =>
        (normalize(o.platformName)?.includes(normProtocol) ||
          normalize(o.name)?.includes(normProtocol) ||
          normalize(o.action)?.includes(normProtocol)) &&
        o.token === token
    );
    return (
      opt || {
        platformLogo: "/ethereum.svg",
        platformName: protocol,
        name: token,
      }
    );
  };

  return (
    <div>
      <div className="text-blue-600 font-semibold mb-2">Open investments</div>
      <div className="flex flex-col gap-3">
        {!mounted ? (
          <div className="h-10" />
        ) : !address ? (
          <div className="text-xs text-gray-400">
            Connect your wallet to view open investments
          </div>
        ) : loading ? (
          <div className="text-xs text-gray-400">Loading...</div>
        ) : positions.length === 0 ? (
          <div className="text-xs text-gray-400">No investments found</div>
        ) : (
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
                  src={getPlatformDetails(pos.protocol, pos.token).platformLogo}
                  alt={getPlatformDetails(pos.protocol, pos.token).platformName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-4 flex-1">
                  <div className="font-bold text-gray-800">
                    {getPlatformDetails(pos.protocol, pos.token).platformName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {" "}
                    {getPlatformDetails(pos.protocol, pos.token).name}
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
