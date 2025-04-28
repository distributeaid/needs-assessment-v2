"use client";

import React from "react";
import { colors } from "@/styles/colors";
import { statusColors } from "@/styles/statusColors";

interface SelectableButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const SelectableButton: React.FC<SelectableButtonProps> = ({
  label,
  selected,
  onClick,
}) => {
  const backgroundColor = selected
    ? colors.primary.base
    : colors.secondary.base;
  const hoverColor = selected ? colors.primary.hover : colors.secondary.hover;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${statusColors.choice} ${selected ? "text-white" : "text-blue-900"}`}
      style={{
        backgroundColor,
        transition: "background-color 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
      }}
    >
      {label}
    </button>
  );
};

export default SelectableButton;
