"use client";

import React, { useState, useEffect } from "react";
import { InputProps } from "@/types/ui-models";

const DropdownWithOtherInput: React.FC<InputProps> = ({
  question,
  value,
  onChange,
}) => {
  const options = question.options ?? [];
  const isCustomValue = typeof value === "string" && !options.includes(value);
  const [selected, setSelected] = useState(isCustomValue ? "Other" : value);
  const [otherValue, setOtherValue] = useState(isCustomValue ? value : "");

  useEffect(() => {
    if (selected === "Other") {
      onChange(question.id, otherValue);
    } else {
      onChange(question.id, selected);
    }
  }, [selected, otherValue, onChange, question.id]);

  return (
    <div className="bg-blue-50 p-4 rounded-md border space-y-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
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
        <option value="Other">Other</option>
      </select>

      {selected === "Other" && (
        <>
          {question.subtext && (
            <p className="text-sm text-blue-900 font-medium mb-1">
              {question.subtext}
            </p>
          )}
          <input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            className="w-full px-4 py-2 rounded border text-blue-900"
            placeholder="Enter your response"
          />
        </>
      )}
    </div>
  );
};

export default DropdownWithOtherInput;
