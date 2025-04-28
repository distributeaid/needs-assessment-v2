"use client";

import React from "react";
import { colors } from "@/styles/colors";
import { InputProps } from "@/types/ui-models";

const baseInputClasses =
  "mt-1 p-2 text-gray-900 rounded w-full transition-colors duration-300 h-10";

const getInputBackgroundStyle = (value: string | string[]) => ({
  backgroundColor: Array.isArray(value)
    ? value.length > 0
      ? colors.input.filled
      : colors.input.empty
    : value
      ? colors.input.filled
      : colors.input.empty,
});

const DropdownInput: React.FC<InputProps> = ({ question, value, onChange }) => (
  <select
    className={baseInputClasses}
    style={getInputBackgroundStyle(value)}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  >
    <option value="">Select an option</option>
    {question.options?.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export default DropdownInput;
