import React from "react";
import { Check } from "lucide-react";

export const ROOM_TYPES = [
  {
    key: "Standard",
    label: "Standard Room",
    multiplier: 1,
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80",
    description: "Comfortable room with essential amenities.",
  },
  {
    key: "Deluxe",
    label: "Deluxe Room",
    multiplier: 1.4,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80",
    description: "Spacious room with premium furnishings and a city view.",
  },
  {
    key: "Suite",
    label: "Suite",
    multiplier: 1.8,
    image:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&q=80",
    description: "Luxury suite with a separate living area and best views.",
  },
];

interface RoomTypeGridProps {
  basePrice: number;
  selected: string;
  onSelect: (roomType: string) => void;
}

const RoomTypeGrid = ({ basePrice, selected, onSelect }: RoomTypeGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {ROOM_TYPES.map((room) => {
        const isSelected = selected === room.key;
        const price = Math.round(basePrice * room.multiplier);
        return (
          <button
            type="button"
            key={room.key}
            onClick={() => onSelect(room.key)}
            className={`text-left border-2 rounded-xl overflow-hidden transition-all ${
              isSelected ? "border-red-600 ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="relative h-28 w-full">
              <img
                src={room.image}
                alt={room.label}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm">{room.label}</p>
              <p className="text-xs text-gray-500 mt-1">{room.description}</p>
              <p className="text-sm font-bold mt-2">
                ₹{price.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-gray-500"> / night</span>
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoomTypeGrid;
