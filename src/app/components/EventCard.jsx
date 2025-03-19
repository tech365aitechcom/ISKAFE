import React from "react";
import { Flag } from "lucide-react";

const EventCard = ({
  imageUrl,
  imageAlt,
  location,
  month,
  day,
  title,
  description,
  className,
  onClick,
}) => {
  return (
    <div
      className={`w-full max-w-sm overflow-hidden rounded-lg bg-black text-white border border-[#D9E2F930] ${className}`}
      onClick={onClick}
    >
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 left-4 flex items-center bg-black bg-opacity-70 px-2 py-1 rounded">
          <div className="mr-2">
            <Flag className="h-4 w-4 text-red-500" />
          </div>
          <span className="text-xs font-medium">{location}</span>
        </div>
      </div>
      <div className="p-4 flex">
        <div className="flex flex-col items-center justify-center mr-4">
          <div className="text-yellow-500 text-xs font-bold">{month}</div>
          <div className="text-white text-2xl font-bold">{day}</div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-lg leading-tight mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
