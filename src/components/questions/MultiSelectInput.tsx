// src/components/questions/MultiSelectInput.tsx
"use client";

import React from "react";
import { Question } from "@/types/models";
import SelectableButton from "@/components/ui/SelectableButton";

interface MultiSelectInputProps {
  question: Question;
  value: string | string[];
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
      {question.options?.map((option) => (
        <SelectableButton
          key={option}
          label={option}
          selected={selectedValues.includes(option)}
          onClick={() => toggleOption(option)}
        />
      ))}
    </div>
  );
};

export default MultiSelectInput;
