// components/ShareableCard.tsx
"use client";

import React, { forwardRef } from "react";

interface ShareableCardProps {
  orgName: string;
  peopleServed: number;
  needs: string[];
  color?: string; // optional background color
}

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ orgName, peopleServed, needs, color = "#082B76" }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[518px] h-[502px] text-white p-6 flex flex-col justify-between"
        style={{ backgroundColor: color }}
      >
        <div>
          <h1 className="text-xl font-bold underline">
            HELP {orgName.toUpperCase()}
          </h1>
          <h2 className="text-lg font-bold mt-2">HELP {peopleServed} PEOPLE</h2>
          <p className="text-sm mt-1">With clothing, food, & shelter</p>
        </div>
        <div>
          <p className="text-lg font-semibold mb-2">IMMEDIATE NEEDS:</p>
          <ul className="space-y-1">
            {needs.map((item, i) => (
              <li key={i} className="text-md">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-center mt-4 opacity-80">© Distribute Aid</p>
      </div>
    );
  },
);

ShareableCard.displayName = "ShareableCard";
export default ShareableCard;
