"use client";

import React from "react";
import { InputProps } from "@/types/ui-models";
import SelectableButton from "@/components/ui/SelectableButton";

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
  const otherValue =
    selected
      .find((v) => v.startsWith(OTHER_PREFIX))
      ?.slice(OTHER_PREFIX.length) || "";

  const toggleOption = (option: string) => {
    const isSelected = baseSelections.includes(option);
    const updated = isSelected
      ? baseSelections.filter((v) => v !== option)
      : [...baseSelections, option];

    // Preserve "Other" if it was selected
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
        {question.options?.map((option) => (
          <SelectableButton
            key={option}
            label={option}
            selected={selected.includes(option)}
            onClick={() => toggleOption(option)}
          />
        ))}
        <SelectableButton
          key="other"
          label="Other"
          selected={isOtherSelected}
          onClick={() => {
            if (isOtherSelected) {
              onChange(question.id, baseSelections);
            } else {
              onChange(question.id, [...baseSelections, `${OTHER_PREFIX}`]);
            }
          }}
        />
      </div>

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
            className="w-full mt-1 p-2 text-gray-900 rounded transition-colors duration-300 h-10"
            style={{
              backgroundColor: otherValue ? "#5AC597" : "#C5CFE4",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MultiSelectWithOtherInput;
