import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAccount } from "wagmi";
import { supabase } from "../../utils/supabaseClient";
import { getTotalOpenInvestmentUSD } from "./InvestPositions";
import Wallet from "../common/Wallet";
import { getTokenPriceUSD as getTokenPriceUSDAsync } from "../../utils/helper";
import { tokensDetails, investmentOptions } from "../../utils/constants";
import Image from "next/image";

interface InvestOverviewProps {
  onInvestClick: () => void;
  refreshKey?: any; // pass txHash or similar to trigger refresh
}

const chartData = {
  "1D": [
    { name: "", value: 3100 },
    { name: "", value: 3123 },
    { name: "", value: 3123.67 },
  ],
  "1W": [
    { name: "Mon", value: 3000 },
    { name: "Tue", value: 3050 },
    { name: "Wed", value: 3080 },
    { name: "Thu", value: 3100 },
    { name: "Fri", value: 3123 },
    { name: "Sat", value: 3120 },
    { name: "Sun", value: 3123.67 },
  ],
  "1M": [
    { name: "W1", value: 2900 },
    { name: "W2", value: 2950 },
    { name: "W3", value: 3050 },
    { name: "W4", value: 3123.67 },
  ],
  "3M": [
    { name: "M1", value: 2500 },
    { name: "M2", value: 2700 },
    { name: "M3", value: 3123.67 },
  ],
  "1Y": [
    { name: "Q1", value: 2000 },
    { name: "Q2", value: 2200 },
    { name: "Q3", value: 2500 },
    { name: "Q4", value: 3123.67 },
  ],
};

const timeRanges = ["1D", "1W", "1M", "3M", "1Y"] as const;
type TimeRange = (typeof timeRanges)[number];

// Helper to get token price in USD
function getTokenPriceUSD(tokenLabel: string): number {
  if (tokenLabel === "ETH") return 2200;
  if (tokenLabel === "BTC") return 100000;
  return 1; // fallback for other tokens
}

export default function InvestOverview({
  onInvestClick,
  refreshKey,
}: InvestOverviewProps) {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [totalInvested, setTotalInvested] = useState(0);
  const [openInvestments, setOpenInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const totalReturn = 768.98; // TODO: calculate from investments if needed

  const [formattedInvested, setFormattedInvested] = useState("");
  const [formattedReturn, setFormattedReturn] = useState("");
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");

  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [usdLoading, setUsdLoading] = useState(false);

  // Fetch open investments for the connected address
  useEffect(() => {
    async function fetchInvestments() {
      if (!address) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("investments")
        .select(
          "amount, token, protocol, tx_hash, chain_id, created_at, status"
        )
        .eq("address", address?.toLowerCase())
        .eq("status", "open");
      if (error) {
        setOpenInvestments([]);
        setTotalInvested(0);
        setLoading(false);
        return;
      }
      setOpenInvestments(data || []);
      // Aggregate by protocol+token before calculating total
      const aggregated = Object.values(
        (data || []).reduce((agg, pos) => {
          const key = `${pos.protocol}_${pos.token}`;
          if (!agg[key]) {
            agg[key] = { ...pos, amount: Number(pos.amount) };
          } else {
            agg[key].amount += Number(pos.amount);
          }
          return agg;
        }, {} as Record<string, { amount: number; token: string }>)
      );
      console.log("Aggregated open investments for total:", aggregated);
      const totalUSD = getTotalOpenInvestmentUSD(aggregated);
      console.log("Total USD calculated:", totalUSD);
      setTotalInvested(totalUSD);
      setLoading(false);
    }
    fetchInvestments();
  }, [address, refreshKey]);

  useEffect(() => {
    setFormattedInvested(
      totalInvested.toLocaleString("en-US", { maximumFractionDigits: 2 })
    );
    setFormattedReturn(
      totalReturn.toLocaleString("en-US", { maximumFractionDigits: 2 })
    );
  }, [totalInvested, totalReturn]);

  useEffect(() => {
    let mounted = true;
    setUsdLoading(true);
    Promise.all(
      openInvestments.map(async (inv) => {
        const price = await getTokenPriceUSDAsync(inv.token);
        return { token: inv.token, price };
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
  }, [openInvestments]);

  // Format Y axis as round $Xk (no decimals)
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }
    return `$${value}`;
  };

  const getPlatformDetails = (protocol: string, token: string) => {
    const opt = investmentOptions.find(
      (o) =>
        o.platformName?.toLowerCase().includes(protocol.toLowerCase()) &&
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
    <div className="rounded-2xl bg-white p-4 flex flex-col items-left relative">
      {!mounted ? (
        <div className="h-40" />
      ) : !address ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-2xl">
          <div className="text-gray-700 text-lg font-semibold mb-2">
            Connect your wallet to start
          </div>
          <Wallet />
        </div>
      ) : null}
      <div
        className={`text-blue-600 text-5xl font-bold mb-2 transition-all ${
          mounted && !address
            ? "filter blur-sm pointer-events-none select-none"
            : ""
        }`}
      >
        ${formattedInvested}
      </div>
      <div
        className={`flex items-center gap-5 ${
          mounted && !address
            ? "filter blur-sm pointer-events-none select-none"
            : ""
        }`}
      >
        <div>
          <div className="text-gray-500 text-xs font-semibold">
            TOTAL RETURN
          </div>
          <div className="text-green-600 text-sm font-semibold">
            + ${formattedReturn}
          </div>
        </div>
        <div className="text-gray-500 text-xs font-semibold">
          <div className="text-gray-500 text-xs font-semibold">RETURN RATE</div>
          <div className="text-green-600 text-sm font-semibold">+ 5.2%</div>
        </div>
      </div>
      {/* Investment Performance Graph */}
      <div className="-mx-2 w-[calc(100%+16px)]">
        <div className="w-full h-40 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData[selectedRange]}
              margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              {/* Remove XAxis labels/ticks */}
              <XAxis hide dataKey="name" />
              <YAxis
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={formatYAxis}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => formatYAxis(value)}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Time Range Selector below the graph, edge-to-edge */}
      <div className="flex gap-3 mb-6 justify-between w-full px-0">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`flex-1 px-0 py-1 rounded-full text-xs font-semibold transition border
              ${
                selectedRange === range
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>
      <div className="flex gap-4 w-full">
        <button
          onClick={onInvestClick}
          className="flex-1 h-12 rounded-full bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition"
        >
          Invest
        </button>
        <button className="flex-1 h-12 rounded-full border border-blue-600 text-blue-600 font-bold text-lg shadow hover:bg-blue-50 transition">
          Withdraw
        </button>
      </div>
    </div>
  );
}
