"use client";

import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  label,
  icon,
  isActive = false,
}) => {
  return (
    <li
      className={`mb-3 w-full px-2 py-1 rounded-md text-center list-none ${
        isActive ? "bg-[#082B76] text-white" : "text-[#082B76]"
      }`}
    >
      <Link href={href} className="block w-full">
        <div className="flex flex-col items-center text-center w-full text-xs uppercase font-medium">
          <span className="mb-1 text-[10px] px-1 text-center break-words leading-tight">
            {label}
          </span>
          <div className="relative">{icon}</div>
        </div>
      </Link>
    </li>
  );
};

export default SidebarLink;
