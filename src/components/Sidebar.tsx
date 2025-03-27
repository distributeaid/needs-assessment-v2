"use client";

import Link from "next/link";
import React from "react";
import { CheckCircle, Lock, Circle, PlayCircle, PauseCircle } from "lucide-react";
import { SidebarProps } from "@/types/models";

const getStatusIcon = (progress: SidebarProps["sitePages"][0]["progress"]) => {
  switch (progress) {
    case 'LOCKED':
      return <Lock className="text-gray-400 mr-2" size={18} />;
    case 'UNSTARTEDREQUIRED':
    case 'UNSTARTEDOPTIONAL':
      return <Circle className="text-gray-400 mr-2" size={18} />;
    case 'STARTEDREQUIRED':
    case 'STARTEDOPTIONAL':
      return <PlayCircle className="text-yellow-500 mr-2" size={18} />;
    case 'COMPLETE':
      return <CheckCircle className="text-green-500 mr-2" size={18} />;
    default:
      return <PauseCircle className="text-gray-400 mr-2" size={18} />;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ assessmentId, sitePages, currentPageId }) => {
  return (
    <aside className="w-64 p-4 border-r h-full">
      <h2 className="text-xl font-bold mb-4">Progress</h2>
      <ul>
        {sitePages.map((page) => (
          <li
            key={page.id}
            className={`flex items-center p-2 rounded-lg mb-2 cursor-pointer  transition-colors ${
              currentPageId === String(page.id) ? "bg-blue-600 font-semibold" : ""
            }`}
          >
            {getStatusIcon(page.progress)}
            <Link href={`/assessment/${assessmentId}/page/${page.id}`} className="flex-1">
              {page.title}
            </Link>
          </li>
        ))}
        <li> <Link href={`/dashboard`} className="flex-1">
              <b>Return to Dashboard</b>
            </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
