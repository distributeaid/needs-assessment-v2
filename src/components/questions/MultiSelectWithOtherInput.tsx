"use client";

import React from "react";
import { InputProps } from "@/types/ui-models";

const OTHER_PREFIX = "Other:";

const MultiSelectWithOtherInput: React.FC<InputProps> = ({
  question,
  value,
  onChange,
}) => {
  const selected: string[] = Array.isArray(value)
    ? value
    : typeof value === "string" && value.includes(",")
      ? value.split(",")
      : [];

  const baseSelections = selected.filter((v) => !v.startsWith(OTHER_PREFIX));
  const otherValue = selected.find((v) => v.startsWith(OTHER_PREFIX))?.slice(OTHER_PREFIX.length) || "";

  const toggleOption = (option: string) => {
    const isSelected = baseSelections.includes(option);
    const updated = isSelected
      ? baseSelections.filter((v) => v !== option)
      : [...baseSelections, option];

    // If "Other" was selected, preserve it
    if (selected.some((v) => v.startsWith(OTHER_PREFIX))) {
      updated.push(`${OTHER_PREFIX}${otherValue}`);
    }

    onChange(question.id, updated);
  };

  const handleOtherChange = (text: string) => {
    const updated = [...baseSelections];
    if (text.trim()) {
      updated.push(`${OTHER_PREFIX}${text.trim()}`);
    }
    onChange(question.id, updated);
  };

  const isOtherSelected = selected.some((v) => v.startsWith(OTHER_PREFIX));

  return (
    <div className="flex flex-col gap-4 bg-blue-50 p-4 rounded-md">
      <div className="flex flex-wrap gap-2">
        {question.options?.map((option) => {
          const isSelected = baseSelections.includes(option);
          return (
            <button
              type="button"
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-blue-800 border border-blue-300 hover:bg-blue-100"
                }`}
            >
              {option}
            </button>
          );
        })}

        {/* "Other" button */}
        <button
          type="button"
          onClick={() => {
            if (isOtherSelected) {
              // remove Other
              onChange(question.id, baseSelections);
            } else {
              // add empty Other
              onChange(question.id, [...baseSelections, `${OTHER_PREFIX}`]);
            }
          }}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition
            ${
              isOtherSelected
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-blue-800 border border-blue-300 hover:bg-blue-100"
            }`}
        >
          Other
        </button>
      </div>

      {/* Show input field if "Other" is selected */}
      {isOtherSelected && (
        <div>
          {question.subtext && (
            <p className="text-sm text-blue-900 font-medium mb-1">
              {question.subtext}
            </p>
          )}
          <input
            type="text"
            value={otherValue}
            onChange={(e) => handleOtherChange(e.target.value)}
            placeholder="Please specify..."
            className="w-full mt-1 p-2 border rounded text-blue-900"
          />
        </div>
      )}
    </div>
  );
};

export default MultiSelectWithOtherInput;
