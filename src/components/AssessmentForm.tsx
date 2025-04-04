"use client";

import React from "react";
import { Question, Site } from "@/types/models";
import SizingGridInput from "@/components/questions/SizingGridInput";
import MultiSelectInput from "@/components/questions/MultiSelectInput";
import MultiSelectWithOtherInput from "@/components/questions/MultiSelectWithOtherInput";
import DemoGridInput from "@/components/questions/DemoGridInput";
import DropdownInput from "@/components/questions/DropdownInput";
import DropdownWithOtherInput from "@/components/questions/DropdownWithOtherInput";
import YesNoInput from "@/components/questions/YesNoInput";
import YesNoWithNumericEntry from "@/components/questions/YesNoWithNumericEntry";
import { InputProps } from "@/types/ui-models";

interface AssessmentFormProps {
  isConfirmationPage: boolean;
  questions: Question[];
  responses: Record<number, string | string[]>;
  onInputChange: (questionId: number, value: string | string[]) => void;
  onSubmit: (confirm: boolean, isConfirmationPage: boolean) => void;
  site: Site;
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
  isConfirmationPage,
  site,
}) => {
  const renderInput = (question: Question) => {
    const value = responses[question.id] || "";
    const commonProps = {
      question,
      value,
      onChange: onInputChange,
      isConfirmationPage,
    };
    switch (question.type) {
      case "Numeric":
        return <NumericInput {...commonProps} />;
      case "YesNo":
        return question.allowsAdditionalInput ? (
          <YesNoWithNumericEntry {...commonProps} />
        ) : (
          <YesNoInput {...commonProps} />
        );
      case "Dropdown":
        return question.allowsAdditionalInput ? (
          <DropdownWithOtherInput {...commonProps} />
        ) : (
          <DropdownInput {...commonProps} />
        );
      case "MultiSelect":
        return question.allowsAdditionalInput ? (
          <MultiSelectWithOtherInput {...commonProps} />
        ) : (
          <MultiSelectInput {...commonProps} />
        );
      case "Short Response":
        return <ShortResponseInput {...commonProps} />;
      case "Long Response":
        return <LongResponseInput {...commonProps} />;
      case "SizingGrid":
        return <SizingGridInput {...commonProps} />;
      case "DemoGrid":
        return (
          <DemoGridInput {...commonProps} peopleServed={site?.peopleServed} />
        );
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
        {questions.map((question) => {
          const input = renderInput(question);
          const isInline =
            question.type === "YesNo" || question.type === "Short Response";

          const showSubtext =
            !!question.subtext &&
            (!question.allowsAdditionalInput ||
              question.type === "Long Response");

          return (
            <div key={question.id} className="space-y-1">
              {isInline ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="block text-base font-medium text-blue-900">
                    {question.text}
                  </label>
                  {input}
                </div>
              ) : (
                <>
                  <label className="block text-lg font-medium text-blue-900">
                    {question.text}
                  </label>
                  {showSubtext && (
                    <p className="text-sm text-blue-700">{question.subtext}</p>
                  )}
                  {input}
                </>
              )}
            </div>
          );
        })}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <button
            type="button"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => onSubmit(false, isConfirmationPage)}
          >
            Save
          </button>
          <button
            type="button"
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
            onClick={() => onSubmit(true, isConfirmationPage)}
          >
            {isConfirmationPage ? "Save and Finalize" : "Save & Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
