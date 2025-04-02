"use client";

import React from "react";
import { Question } from "@/types/models";

interface MultiSelectInputProps {
  question: Question;
  value: string | string[]; // <-- Accept array or string
  onChange: (questionId: number, value: string[] | string) => void;
}

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  question,
  value,
  onChange,
}) => {
  const selectedValues = Array.isArray(value)
    ? value
    : value
    ? value.split(",")
    : [];

  const toggleOption = (option: string) => {
    const updated = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];

    onChange(question.id, updated);
  };

  return (
    <div className="flex flex-wrap gap-2 bg-blue-50 p-4 rounded-md">
      {question.options?.map((option) => {
        const isSelected = selectedValues.includes(option);
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
    </div>
  );
};

export default MultiSelectInput;
