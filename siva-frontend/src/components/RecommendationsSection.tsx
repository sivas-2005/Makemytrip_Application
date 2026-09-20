import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Plane, Building2, Star, Info, ThumbsUp, ThumbsDown } from "lucide-react";
import { getRecommendations, sendRecommendationFeedback } from "@/api";

const RecommendationsSection = () => {
  const user = useSelector((state: any) => state.user.user);
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [openReasonFor, setOpenReasonFor] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const load = async () => {
    if (!user?.id) return;
    try {
      const data = await getRecommendations(user.id);
      setItems(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleFeedback = async (
    e: React.MouseEvent,
    item: any,
    feedback: "helpful" | "irrelevant"
  ) => {
    e.stopPropagation();
    try {
      await sendRecommendationFeedback(user.id, item.targetType, item.targetId, feedback);
      if (feedback === "irrelevant") {
        setDismissedIds((prev) => [...prev, item.targetId]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const goToItem = (item: any) => {
    if (item.targetType === "Flight") {
      router.push(`/book-flight/${item.targetId}`);
    } else {
      router.push(`/book-hotel/${item.targetId}`);
    }
  };

  const visibleItems = items.filter((i) => !dismissedIds.includes(i.targetId));

  if (!user?.id || visibleItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-1">Picked for you</h2>
      <p className="text-sm text-gray-500 mb-6">
        Based on your travel history and what other travellers love.
      </p>
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {visibleItems.map((item) => (
          <div
            key={`${item.targetType}-${item.targetId}`}
            onClick={() => goToItem(item)}
            className="min-w-[260px] bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-4 relative"
          >
            <div className="flex items-center space-x-2 mb-2">
              {item.targetType === "Flight" ? (
                <div className="bg-blue-100 p-1.5 rounded-lg">
                  <Plane className="w-4 h-4 text-blue-600" />
                </div>
              ) : (
                <div className="bg-green-100 p-1.5 rounded-lg">
                  <Building2 className="w-4 h-4 text-green-600" />
                </div>
              )}
              <span className="font-semibold text-sm truncate">{item.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{item.subtitle}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">
                ₹{Math.round(item.price).toLocaleString("en-IN")}
              </span>
              {item.rating && (
                <span className="flex items-center text-xs text-yellow-600">
                  <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                  {item.rating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenReasonFor(
                    openReasonFor === item.targetId ? null : item.targetId
                  );
                }}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700"
              >
                <Info className="w-3.5 h-3.5 mr-1" />
                Why this?
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleFeedback(e, item, "helpful")}
                  className="text-gray-400 hover:text-emerald-600"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleFeedback(e, item, "irrelevant")}
                  className="text-gray-400 hover:text-red-600"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {openReasonFor === item.targetId && (
              <div className="mt-2 text-xs bg-gray-50 border rounded-lg p-2 text-gray-600">
                {item.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;
