import React, { useEffect, useRef, useState } from "react";
import {
  PlaneTakeoff,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlaneLanding,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getFlightStatus } from "@/api";

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  "On Time": { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  Delayed: { bg: "bg-orange-100", text: "text-orange-700", icon: AlertTriangle },
  Boarding: { bg: "bg-blue-100", text: "text-blue-700", icon: PlaneTakeoff },
  Departed: { bg: "bg-purple-100", text: "text-purple-700", icon: PlaneTakeoff },
  Landed: { bg: "bg-gray-200", text: "text-gray-700", icon: PlaneLanding },
};

const formatTime = (value?: string) => {
  if (!value) return "--";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

interface LiveFlightStatusProps {
  flightId: string;
  compact?: boolean;
}

const LiveFlightStatus = ({ flightId, compact = false }: LiveFlightStatusProps) => {
  const [status, setStatus] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevRef = useRef<{ status: string; delayMinutes: number } | null>(null);
  const toastTimer = useRef<any>(null);

  const poll = async () => {
    if (!flightId) return;
    try {
      const data = await getFlightStatus(flightId);
      const prev = prevRef.current;
      if (prev && (prev.status !== data.status || prev.delayMinutes !== data.delayMinutes)) {
        let message = "";
        if (data.status === "Delayed") {
          message = `Delayed by ${data.delayMinutes} min — ${data.reason}`;
        } else if (data.status === "Boarding") {
          message = "Boarding has started";
        } else if (data.status === "Departed") {
          message = "Flight has departed";
        } else if (data.status === "Landed") {
          message = "Flight has landed";
        } else {
          message = "Flight is on time";
        }
        setToast(message);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 6000);
      }
      prevRef.current = { status: data.status, delayMinutes: data.delayMinutes };
      setStatus(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      clearInterval(interval);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId]);

  if (!status) return null;

  const style = STATUS_STYLES[status.status] || STATUS_STYLES["On Time"];
  const StatusIcon = style.icon;

  if (compact) {
    return (
      <div className="relative">
        {toast && (
          <div className="absolute -top-11 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center space-x-1 z-10 whitespace-nowrap">
            <Bell className="w-3 h-3" />
            <span>{toast}</span>
          </div>
        )}
        <span
          className={`inline-flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full ${style.bg} ${style.text}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>
            {status.status}
            {status.status === "Delayed" ? ` · ${status.delayMinutes}m` : ""}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 relative">
      {toast && (
        <div className="absolute -top-3 right-6 translate-y-[-100%] bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-10">
          <Bell className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Live Flight Status</h2>
        <span
          className={`inline-flex items-center space-x-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${style.bg} ${style.text}`}
        >
          <StatusIcon className="w-4 h-4" />
          <span>{status.status}</span>
        </span>
      </div>

      {status.status === "Delayed" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-sm text-orange-800">
          Delayed by {status.delayMinutes} minutes — {status.reason}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Estimated departure
          </p>
          <p className="font-semibold">{formatTime(status.revisedDeparture)}</p>
        </div>
        <div>
          <p className="text-gray-500 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Estimated arrival
          </p>
          <p className="font-semibold">{formatTime(status.revisedArrival)}</p>
        </div>
      </div>

      {status.history && status.history.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-sm text-blue-600 flex items-center hover:text-blue-700"
          >
            {expanded ? "Hide" : "Show"} update history
            {expanded ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
          {expanded && (
            <div className="mt-3 space-y-2">
              {[...status.history].reverse().map((event: any, i: number) => (
                <div key={i} className="text-xs text-gray-600 flex items-start space-x-2">
                  <span className="text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString("en-IN")}
                  </span>
                  <span>
                    → {event.status}
                    {event.status === "Delayed"
                      ? ` (${event.delayMinutes}m — ${event.reason})`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Live tracking updates automatically every few seconds.
      </p>
    </div>
  );
};

export default LiveFlightStatus;
