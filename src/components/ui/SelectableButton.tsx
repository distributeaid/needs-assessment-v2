"use client";

import React from "react";
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${statusColors.base} ${
        selected ? statusColors.selected : statusColors.unselected
      }`}
    >
      {label}
    </button>
  );
};

export default SelectableButton;
