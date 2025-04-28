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
  const backgroundColor = selected ? colors.input.filled : colors.input.empty;
  const textColor = selected ? "text-white" : "text-blue-900";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${statusColors.choice} ${textColor} transform transition-transform duration-200 hover:scale-105`}
      style={{
        backgroundColor,
        transition: "background-color 0.2s ease-in-out",
      }}
    >
      {label}
    </button>
  );
};

export default SelectableButton;
