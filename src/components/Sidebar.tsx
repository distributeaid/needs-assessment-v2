"use client";

import Link from "next/link";
import React from "react";
import { SidebarProps } from "@/types/models";
import { Box, Flex, Heading } from "@radix-ui/themes";
import SidebarIcon from "./SidebarIcon";

const Sidebar: React.FC<SidebarProps> = ({
  siteAssessmentId,
  sitePages,
  currentPageId,
}) => {
  return (
    <Box style={{ backgroundColor: "white" }} className="w-32">
      <ul>
        <li>
          <Link
            href={`/dashboard`}
            className="flex flex-col items-center p-2 rounded-lg mb-2 cursor-pointer"
          >
            <Heading className="text-[#082B76] text-sm uppercase">Home</Heading>
            <SidebarIcon progress={"STARTEDOPTIONAL"} />
          </Link>
        </li>
        {/* <Separator color="blue" size={"4"}/> */}
        <Flex className="border border-[#082B76] w-1/2 mx-auto my-6" />
        {sitePages.map((page) => (
          <li
            key={page.id}
            className={`p-2 rounded-lg cursor-pointer text-[#082B76] transition-colors ${
              currentPageId === String(page.id)
                ? "bg-blue-600 font-semibold text-white"
                : ""
            }`}
          >
            {
              // if locked prevent user from going to that page.
              // Note: when user clicks 'save' or 'save & confirm', user is taken to next section, but that section isnt unlocked until saved
              // Note: basic information or at least 1st pg is locked on start
              page.progress === "LOCKED" ? (
                <Box className=" flex flex-col items-center text-sm uppercase text-center w-full">
                  {page.title}
                  {/* page.id start count at 1 so have to -2 to get previous, alternative is use index parameter and -1 from it */}
                  <SidebarIcon
                    prevPage={sitePages[page.id - 2]?.title}
                    isLast={page.id == sitePages.length}
                    progress={page.progress}
                  />
                </Box>
              ) : (
                <Link
                  href={`/assessment/${siteAssessmentId}/page/${page.id}`}
                  className=" flex flex-col text-center text-sm uppercase items-center w-full"
                  >
                  {page.title}
                  <SidebarIcon progress={page.progress} />
                </Link>
              )
            }

            {/* {getStatusIcon(page.progress)} */}
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default Sidebar;
