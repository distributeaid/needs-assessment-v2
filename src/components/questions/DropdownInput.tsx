"use client";

import React from "react";
import { InputProps } from "@/types/ui-models";

const DropdownInput: React.FC<InputProps> = ({ question, value, onChange }) => {
  const options = question.options ?? [];

  return (
    <div className="bg-blue-50 p-4 rounded-md border">
      <select
        value={value}
        onChange={(e) => onChange(question.id, e.target.value)}
        className={`
          w-full px-4 py-2 rounded-full border
          text-sm font-semibold text-blue-900
          bg-white hover:bg-blue-100 transition
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        <option value="" disabled>
          Click to select one
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownInput;
