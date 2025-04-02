"use client";
import { Box } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { ProgressStatus } from "@/types/models";

interface SitePageCardProps {
  pageId: number;
  siteAssessmentId: number;
  title: string;
  progress: ProgressStatus;
}

export default function SitePageCard({
  pageId,
  siteAssessmentId,
  title,
  progress,
}: SitePageCardProps) {
  const router = useRouter();
  const isLocked = progress === "LOCKED";

  const handleClick = () => {
    if (!isLocked) {
      router.push(`/assessment/${siteAssessmentId}/page/${pageId}`);
    }
  };

  const getButtonContent = () => {
    switch (progress) {
      case "LOCKED":
        return "Locked";
      case "UNSTARTEDREQUIRED":
      case "UNSTARTEDOPTIONAL":
        return "Start";
      case "STARTEDREQUIRED":
      case "STARTEDOPTIONAL":
        return "Continue";
      case "COMPLETE":
        return "Complete";
      default:
        return "View";
    }
  };

  const isComplete = progress === "COMPLETE";

  return (
    <Box
      onClick={handleClick}
      className={`flex flex-col justify-center items-center border rounded-lg shadow-sm text-center transition-all ${
        isLocked
          ? "bg-gray-300 cursor-not-allowed"
          : isComplete
            ? "bg-green-200 hover:bg-green-300 cursor-pointer"
            : "bg-[var(--secondary)] hover:shadow-md cursor-pointer"
      }`}
      width="350px"
      height="200px"
    >
      <h1 className="text-2xl font-bold text-blue-900 p-4 uppercase">
        {title}
      </h1>

      <div className="relative">
        <button
          className={`rounded-md px-5 py-3 text-white text-md mt-2 font-bold ${
            isLocked
              ? "bg-gray-500 cursor-not-allowed"
              : isComplete
                ? "bg-blue-900"
                : "bg-[var(--primary)] hover:bg-green-300"
          }`}
          disabled={isLocked}
        >
          {getButtonContent()}
        </button>
      </div>
    </Box>
  );
}
