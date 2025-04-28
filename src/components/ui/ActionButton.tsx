"use client";

import React from "react";
import { colors } from "@/styles/colors";
import { statusColors } from "@/styles/statusColors";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "primary" | "secondary" | "success";
  error?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  variant = "primary",
  error = false,
  disabled,
  style,
  ...props
}) => {
  const baseClasses = statusColors.action;
  const textColor = variant === "secondary" ? "text-blue-900" : "text-white"; // 👈 dynamic text color
  const errorClasses = error ? statusColors.error : "";
  const disabledClasses = disabled ? statusColors.disabled : "";

  const backgroundColor = colors[variant]?.base ?? colors.primary.base;
  const hoverColor = colors[variant]?.hover ?? colors.primary.hover;

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${textColor} ${disabledClasses} ${errorClasses}`}
      style={{
        backgroundColor,
        transition: "background-color 0.2s ease-in-out",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = backgroundColor;
        }
      }}
      {...props}
    >
      {label}
    </button>
  );
};

export default ActionButton;
