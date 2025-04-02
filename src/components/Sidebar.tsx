"use client";

import Link from "next/link";
import React from "react";
import { SidebarProps } from "@/types/models";
import { Box, Heading } from "@radix-ui/themes";
import SidebarIcon from "./SidebarIcon";

const Sidebar: React.FC<SidebarProps> = ({
  siteAssessmentId,
  sitePages,
  currentPageId,
}) => {
  return (
    <Box
      className="w-24 bg-white py-6 border-r border-gray-300 flex flex-col items-center"
      style={{ minWidth: "6rem" }}
    >
      <Link
        href="/dashboard"
        className="flex flex-col items-center mb-4 text-center group"
      >
        <Heading
          className={`text-sm uppercase font-bold mb-1 ${
            !currentPageId ? "text-[#082B76]" : "text-gray-400"
          }`}
        >
          Home
        </Heading>
        <SidebarIcon progress="STARTEDOPTIONAL" />
      </Link>

      <div className="w-8 border-t border-[#082B76] my-4" />

      {[
      // Required + complete pages first
      ...sitePages
        .filter(p => p.progress === "UNSTARTEDREQUIRED" || p.progress === "STARTEDREQUIRED" || p.progress === "COMPLETE")
        .sort((a, b) => a.order - b.order),

      // Optional
      ...sitePages
        .filter(p =>
          p.progress === "UNSTARTEDOPTIONAL" ||
          p.progress === "STARTEDOPTIONAL"
        )
        .sort((a, b) => a.order - b.order),

      // Locked pages last
      ...sitePages
        .filter(p => p.progress === "LOCKED")
        .sort((a, b) => a.order - b.order)
    ].map((page) => {
      const isCurrent = currentPageId === String(page.id);
      const isLocked = page.progress === "LOCKED";
      const showRedDot =
        page.progress === "UNSTARTEDREQUIRED" ||
        page.progress === "STARTEDREQUIRED";

      const content = (
        <div
          className={`flex flex-col items-center text-center w-full text-xs uppercase font-medium ${
            isCurrent ? "text-white" : "text-[#082B76]"
          }`}
        >
          <span className="mb-1 text-[10px] px-1 text-center break-words leading-tight">
            {page.title}
          </span>
          <div className="relative">
            <SidebarIcon progress={page.progress} />
            {showRedDot && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full translate-x-1 -translate-y-1" />
            )}
          </div>
        </div>
      );

      return (
        <li
          key={page.id}
          className={`mb-3 w-full px-2 py-1 rounded-md text-center list-none ${
            isCurrent ? "bg-[#082B76]" : ""
          }`}
        >
          {isLocked ? (
            <div className="cursor-not-allowed">{content}</div>
          ) : (
            <Link
              href={`/assessment/${siteAssessmentId}/page/${page.id}`}
              className="block w-full"
            >
              {content}
            </Link>
          )}
        </li>
      );
    })}



    </Box>
  );
};

export default Sidebar;
