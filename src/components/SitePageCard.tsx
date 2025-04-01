// components/SitePageCard.tsx
"use client";
import { Box } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

interface SitePageCardProps {
  pageId: number;
  siteAssessmentId: number;
  title: string;
  progress: string;
}

export default function SitePageCard({
  pageId,
  siteAssessmentId,
  title,
  progress,
}: SitePageCardProps) {
  const router = useRouter();
  const isLocked = progress === "Locked";

  return (
    <Box
      className={`flex flex-col justify-center items-center border rounded-lg shadow-sm text-center transition-all ${
        isLocked
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-[var(--secondary)] hover:shadow-md"
      }`}
      width="350px"
      height="200px"
    >
      <h1 className="text-2xl font-bold text-blue-900 p-4">{title}</h1>

      <button
        className={`rounded-md px-5 py-3 text-white text-md mt-4 ${
          isLocked
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-[var(--primary)] hover:bg-green-300"
        }`}
        onClick={() => {
          if (!isLocked) {
            router.push(`/assessment/${siteAssessmentId}/page/${pageId}`);
          }
        }}
        disabled={isLocked}
      >
        {isLocked ? "Locked" : "View"}
      </button>
    </Box>
  );
}
