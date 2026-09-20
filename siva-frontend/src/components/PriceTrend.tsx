import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Snowflake, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { getPricing, freezePrice } from "@/api";

const DEMAND_STYLES: Record<string, { bg: string; text: string }> = {
  Low: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Medium: { bg: "bg-blue-100", text: "text-blue-700" },
  High: { bg: "bg-orange-100", text: "text-orange-700" },
  Peak: { bg: "bg-red-100", text: "text-red-700" },
};

const Sparkline = ({ points }: { points: number[] }) => {
  if (points.length < 2) return null;
  const width = 200;
  const height = 40;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const trendingUp = points[points.length - 1] >= points[0];
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={coords}
        fill="none"
        stroke={trendingUp ? "#dc2626" : "#059669"}
        strokeWidth="2"
      />
    </svg>
  );
};

const formatCountdown = (expiresAt: string) => {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface PriceTrendProps {
  targetType: "Flight" | "Hotel";
  targetId: string;
  onPriceChange?: (price: number) => void;
}

const PriceTrend = ({ targetType, targetId, onPriceChange }: PriceTrendProps) => {
  const user = useSelector((state: any) => state.user.user);
  const [pricing, setPricing] = useState<any>(null);
  const [freezing, setFreezing] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const lastPriceRef = useRef<number | null>(null);

  const load = async () => {
    if (!targetId) return;
    try {
      const data = await getPricing(targetType, targetId, user?.id);
      setPricing(data);
      if (onPriceChange && data?.effectivePrice !== lastPriceRef.current) {
        lastPriceRef.current = data.effectivePrice;
        onPriceChange(data.effectivePrice);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, user?.id]);

  useEffect(() => {
    if (!pricing?.freeze) {
      setCountdown(null);
      return;
    }
    const tick = () => {
      const c = formatCountdown(pricing.freeze.expiresAt);
      setCountdown(c);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [pricing?.freeze]);

  const handleFreeze = async () => {
    if (!user?.id) return;
    setFreezing(true);
    try {
      await freezePrice(targetType, targetId, user.id);
      await load();
    } catch (error) {
      console.log(error);
    } finally {
      setFreezing(false);
    }
  };

  if (!pricing) return null;

  const demandStyle = DEMAND_STYLES[pricing.demandLevel] || DEMAND_STYLES.Medium;
  const trendingUp = pricing.currentPrice >= pricing.basePrice;
  const isFrozen = !!pricing.freeze && countdown;
  const historyPrices = (pricing.history || []).map((h: any) => h.price);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          Price Trends
          <button
            onClick={() => setShowInfo((s) => !s)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <Info className="w-4 h-4" />
          </button>
        </h2>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${demandStyle.bg} ${demandStyle.text}`}
        >
          {pricing.demandLevel} demand
        </span>
      </div>

      {showInfo && (
        <p className="text-xs text-gray-500 bg-gray-50 border rounded-lg p-3 mb-4">
          Prices change automatically based on simulated demand and seasonal
          trends. Freeze the price to lock it in for {3} minutes while you
          decide.
        </p>
      )}

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">
              ₹{Math.round(pricing.effectivePrice).toLocaleString("en-IN")}
            </span>
            {pricing.currentPrice !== pricing.basePrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{Math.round(pricing.basePrice).toLocaleString("en-IN")}
              </span>
            )}
            {trendingUp ? (
              <TrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          {isFrozen ? (
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <Snowflake className="w-3.5 h-3.5 mr-1" />
              Price locked at ₹{Math.round(pricing.freeze.frozenPrice).toLocaleString("en-IN")}{" "}
              — expires in {countdown}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              Live price, updates automatically
            </p>
          )}
        </div>
        <Sparkline points={historyPrices} />
      </div>

      {user?.id && !isFrozen && (
        <button
          onClick={handleFreeze}
          disabled={freezing}
          className="mt-4 flex items-center space-x-1.5 text-sm border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg disabled:opacity-60"
        >
          <Snowflake className="w-4 h-4" />
          <span>{freezing ? "Freezing..." : "Freeze this price"}</span>
        </button>
      )}
    </div>
  );
};

export default PriceTrend;
