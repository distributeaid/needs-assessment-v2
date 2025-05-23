"use client";

import Link from "next/link";
import React from "react";
import { SidebarProps } from "@/types/models";
import { Box, Heading } from "@radix-ui/themes";
import SidebarLink from "@/components/ui/SidebarLink";
import SidebarIcon from "./SidebarIcon";
import { CheckIcon } from "lucide-react";

const Sidebar: React.FC<SidebarProps> = ({
  siteAssessmentId,
  sitePages,
  currentPageId,
  confirmed,
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
      {confirmed && (
        <SidebarLink
          href={`/assessment/${siteAssessmentId}/summary`}
          label="Summary"
          icon={<CheckIcon />}
        />
      )}
      <div className="w-8 border-t border-[#082B76] my-4" />

      {[...sitePages.sort((a, b) => a.order - b.order)].map((page) => {
        const isCurrent = currentPageId === String(page.id);
        const isLocked = page.progress === "LOCKED";

        const content = (
          <div className="flex flex-col items-center text-center w-full text-xs uppercase font-medium text-[#082B76]">
            <span
              className={`mb-1 text-[10px] px-1 break-words leading-tight ${
                isCurrent ? "font-bold" : "font-medium"
              }`}
            >
              {page.title}
            </span>
            <SidebarIcon progress={page.progress} isActive={isCurrent} />
          </div>
        );

        return (
          <li
            key={page.id}
            className="mb-3 w-full px-2 py-1 rounded-md list-none"
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
