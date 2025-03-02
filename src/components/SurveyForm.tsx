"use client";

import React from "react";
import { Question } from "@/types/models";
import SizingGridInput from "@/components/questions/SizingGridInput";

interface SurveyFormProps {
  title: string;
  questions: Question[];
  responses: { [key: number]: string };
  onInputChange: (questionId: number, value: string) => void;
  onSubmit: (confirm: boolean) => void;
}

interface InputProps {
  question: Question;
  value: string;
  onChange: (questionId: number, value: string) => void;
}

const NumericInput: React.FC<InputProps> = ({ question, value, onChange }) => (
  <input
    type="number"
    className="mt-1 p-2 border text-gray-900 rounded w-full"
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const DropdownInput: React.FC<InputProps> = ({ question, value, onChange }) => (
  <select
    className="mt-1 p-2 border text-gray-900 rounded w-full"
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  >
    {question.options?.map((option: string) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const MultiSelectInput: React.FC<InputProps> = ({
  question,
  value,
  onChange,
}) => {
  // Convert value to array; if empty string, use an empty array.
  const selectedValues = value ? value.split(",") : [];

  return (
    <select
      multiple
      className="mt-1 p-2 border text-gray-900 rounded w-full"
      value={selectedValues}
      onChange={(e) => {
        const newValues = Array.from(
          e.target.selectedOptions,
          (option) => option.value,
        );
        onChange(question.id, newValues.join(","));
      }}
    >
      {question.options?.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const ShortResponseInput: React.FC<InputProps> = ({
  question,
  value,
  onChange,
}) => (
  <input
    type="text"
    className="mt-1 p-2 border text-gray-900 rounded w-full"
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const LongResponseInput: React.FC<InputProps> = ({
  question,
  value,
  onChange,
}) => (
  <textarea
    className="mt-1 p-2 border text-gray-900 rounded w-full"
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const SurveyForm: React.FC<SurveyFormProps> = ({
  title,
  questions,
  responses,
  onInputChange,
  onSubmit,
}) => {
  const renderInput = (question: Question) => {
    const value = responses[question.id] || "";
    switch (question.type) {
      case "Numeric":
        return (
          <NumericInput
            question={question}
            value={value}
            onChange={onInputChange}
          />
        );
      case "Dropdown":
        return (
          <DropdownInput
            question={question}
            value={value}
            onChange={onInputChange}
          />
        );
      case "MultiSelect":
        return (
          <MultiSelectInput
            question={question}
            value={value}
            onChange={onInputChange}
          />
        );
      case "Short Response":
        return (
          <ShortResponseInput
            question={question}
            value={value}
            onChange={onInputChange}
          />
        );
      case "Long Response":
        return (
          <LongResponseInput
            question={question}
            value={value}
            onChange={onInputChange}
          />
        );
      case "SizingGrid":
        return (
          <SizingGridInput
            question={question}
            value={value}
            onChange={onInputChange}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onInputChange(question.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {questions.map((question) => (
          <div key={question.id}>
            <label className="block text-lg font-medium">{question.text}</label>
            {renderInput(question)}
          </div>
        ))}
        <div className="flex space-x-4">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => onSubmit(false)}
          >
            Save
          </button>
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => onSubmit(true)}
          >
            Save & Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyForm;
