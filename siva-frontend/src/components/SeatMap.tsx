import React from "react";
import { Armchair } from "lucide-react";

interface SeatMapProps {
  totalSeats: number;
  bookedSeats: string[];
  requiredCount: number;
  selectedSeats: string[];
  onChange: (seats: string[]) => void;
  premiumSurcharge?: number;
}

const COLUMNS = ["A", "B", "C", "D", "E", "F"];
const PREMIUM_ROWS = 2; // first 2 rows are premium

const SeatMap = ({
  totalSeats,
  bookedSeats,
  requiredCount,
  selectedSeats,
  onChange,
  premiumSurcharge = 500,
}: SeatMapProps) => {
  const totalRows = Math.max(1, Math.ceil(totalSeats / COLUMNS.length));

  const toggleSeat = (label: string) => {
    if (bookedSeats.includes(label)) return;
    if (selectedSeats.includes(label)) {
      onChange(selectedSeats.filter((s) => s !== label));
      return;
    }
    if (selectedSeats.length >= requiredCount) {
      // Replace the first selected seat to keep the count matching requiredCount
      onChange([...selectedSeats.slice(1), label]);
      return;
    }
    onChange([...selectedSeats, label]);
  };

  return (
    <div>
      <div className="flex items-center flex-wrap gap-4 text-xs text-gray-600 mb-4">
        <div className="flex items-center space-x-1">
          <Armchair className="w-4 h-4 text-gray-300" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <Armchair className="w-4 h-4 text-red-600" />
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-1">
          <Armchair className="w-4 h-4 text-gray-500" />
          <span>Booked</span>
        </div>
        <div className="flex items-center space-x-1">
          <Armchair className="w-4 h-4 text-yellow-500" />
          <span>Premium (+₹{premiumSurcharge})</span>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto border rounded-lg p-4">
        {Array.from({ length: totalRows }).map((_, rowIdx) => {
          const rowNum = rowIdx + 1;
          const isPremiumRow = rowNum <= PREMIUM_ROWS;
          return (
            <div key={rowNum} className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-xs text-gray-400 w-5">{rowNum}</span>
              {COLUMNS.map((col, colIdx) => {
                const label = `${rowNum}${col}`;
                const seatIndex = rowIdx * COLUMNS.length + colIdx;
                if (seatIndex >= totalSeats) return <div key={col} className="w-7" />;
                const isBooked = bookedSeats.includes(label);
                const isSelected = selectedSeats.includes(label);
                return (
                  <React.Fragment key={col}>
                    <button
                      type="button"
                      disabled={isBooked}
                      onClick={() => toggleSeat(label)}
                      title={label}
                      className="disabled:cursor-not-allowed"
                    >
                      <Armchair
                        className={`w-6 h-6 ${
                          isBooked
                            ? "text-gray-400"
                            : isSelected
                            ? "text-red-600"
                            : isPremiumRow
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-gray-300 hover:text-gray-400"
                        }`}
                      />
                    </button>
                    {colIdx === 2 && <span className="w-3" />}
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {selectedSeats.length} of {requiredCount} seat
        {requiredCount !== 1 ? "s" : ""} selected
        {selectedSeats.length > 0 && `: ${selectedSeats.join(", ")}`}
      </p>
    </div>
  );
};

export default SeatMap;
