// src/components/ShareableCarousel.tsx
"use client";

import React, { useRef } from "react";
import html2canvas from "html2canvas";

interface ShareableCardData {
  title: string;
  highlight: string;
  subtext: string;
  backgroundColor: string;
}

interface ShareableCarouselProps {
  organizationName: string;
  peopleServed: string;
  cards: ShareableCardData[];
}

const ShareableCarousel: React.FC<ShareableCarouselProps> = ({
  organizationName,
  peopleServed,
  cards,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (index: number) => {
    if (!containerRef.current) return;
    const card = containerRef.current.children[index] as HTMLElement;
    const canvas = await html2canvas(card);
    const link = document.createElement("a");
    link.download = `card-${index + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Shareable Highlights</h2>
      <p className="text-gray-700 mb-6">
        {organizationName} is serving {peopleServed} people. Here’s a snapshot of their needs:
      </p>

      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-4"
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="relative snap-center shrink-0"
            style={{
              width: 518,
              height: 502,
              backgroundColor: card.backgroundColor,
              borderRadius: 16,
              color: "white",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h3 className="text-3xl font-extrabold mb-2">{card.title}</h3>
            <p className="text-5xl font-extrabold mb-4">{card.highlight}</p>
            <p className="text-lg">{card.subtext}</p>
            <button
              className="absolute bottom-4 right-4 text-sm bg-white text-blue-700 px-3 py-1 rounded hover:bg-blue-100"
              onClick={() => handleDownload(idx)}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareableCarousel;
