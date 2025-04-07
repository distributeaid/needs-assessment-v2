"use client";

import React from "react";
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
  ...props
}) => {
  const baseClasses = statusColors.action;
  const variantClasses = statusColors.variants[variant];
  const errorClasses = error ? statusColors.error : "";
  const disabledClasses = disabled ? statusColors.disabled : "";

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${errorClasses}`}
      {...props}
    >
      {label}
    </button>
  );
};

export default ActionButton;
