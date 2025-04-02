"use client";

import React from "react";
import { Question } from "@/types/models";
import SizingGridInput from "@/components/questions/SizingGridInput";

interface AssessmentFormProps {
  questions: Question[];
  responses: Record<number, string>;
  onInputChange: (questionId: number, value: string) => void;
  onSubmit: (confirm: boolean) => void;
}

interface InputProps {
  question: Question;
  value: string;
  onChange: (questionId: number, value: string) => void;
}

const inputBaseClass = "mt-1 p-2 border text-gray-900 rounded w-full";

const NumericInput = ({ question, value, onChange }: InputProps) => (
  <input
    type="number"
    className={inputBaseClass}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const DropdownInput = ({ question, value, onChange }: InputProps) => (
  <select
    className={inputBaseClass}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  >
    {question.options?.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const MultiSelectInput = ({ question, value, onChange }: InputProps) => {
  const selectedValues = value ? value.split(",") : [];
  return (
    <select
      multiple
      className={inputBaseClass}
      value={selectedValues}
      onChange={(e) => {
        const newValues = Array.from(
          e.target.selectedOptions,
          (opt) => opt.value,
        );
        onChange(question.id, newValues.join(","));
      }}
    >
      {question.options?.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const ShortResponseInput = ({ question, value, onChange }: InputProps) => (
  <input
    type="text"
    className={inputBaseClass}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const LongResponseInput = ({ question, value, onChange }: InputProps) => (
  <textarea
    className={inputBaseClass}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  questions,
  responses,
  onInputChange,
  onSubmit,
}) => {
  const renderInput = (question: Question) => {
    const value = responses[question.id] || "";
    const commonProps = { question, value, onChange: onInputChange };

    switch (question.type) {
      case "Numeric":
        return <NumericInput {...commonProps} />;
      case "Dropdown":
        return <DropdownInput {...commonProps} />;
      case "MultiSelect":
        return <MultiSelectInput {...commonProps} />;
      case "Short Response":
        return <ShortResponseInput {...commonProps} />;
      case "Long Response":
        return <LongResponseInput {...commonProps} />;
      case "SizingGrid":
        return <SizingGridInput {...commonProps} />;
      default:
        return (
          <input
            type="text"
            className={inputBaseClass}
            value={value}
            onChange={(e) => onInputChange(question.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex-1 px-4 md:px-8 py-6">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {questions.map((question) => (
          <div key={question.id}>
            <label className="block text-lg font-medium mb-1">
              {question.text}
            </label>
            {renderInput(question)}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <button
            type="button"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => onSubmit(false)}
          >
            Save
          </button>
          <button
            type="button"
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
            onClick={() => onSubmit(true)}
          >
            Save & Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
