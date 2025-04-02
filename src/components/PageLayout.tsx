"use client";

import Sidebar from "@/components/Sidebar";
import PageTitle from "@/components/PageTitle";
import { SitePage } from "@/types/models";
import { Box, Separator } from "@radix-ui/themes";
import React from "react";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  withSidebar?: boolean;
  sidebarProps?: {
    siteAssessmentId: string;
    sitePages: {
      id: number;
      title: string;
      progress: SitePage["progress"];
      order: number;
    }[];
    currentPageId?: string;
  };
}

export default function PageLayout({
  title,
  children,
  withSidebar = false,
  sidebarProps,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {withSidebar && sidebarProps && (
        <Sidebar
          siteAssessmentId={sidebarProps.siteAssessmentId}
          sitePages={sidebarProps.sitePages}
          currentPageId={sidebarProps.currentPageId}
        />
      )}

      <Box className="flex-1 px-6 py-10 max-w-4xl mx-auto">
        <PageTitle title={title} />
        <Separator size="4" className="w-3/4 mx-auto mt-2 mb-8" />
        {children}
      </Box>
    </div>
  );
}
