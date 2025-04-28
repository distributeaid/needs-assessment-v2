"use client";

import React, { useState } from "react";
import { Question, Site } from "@/types/models";
import { colors } from "@/styles/colors";
import SizingGridInput from "@/components/questions/SizingGridInput";
import MultiSelectInput from "@/components/questions/MultiSelectInput";
import MultiSelectWithOtherInput from "@/components/questions/MultiSelectWithOtherInput";
import DemoGridInput from "@/components/questions/DemoGridInput";
import DropdownInput from "@/components/questions/DropdownInput";
import DropdownWithOtherInput from "@/components/questions/DropdownWithOtherInput";
import YesNoInput from "@/components/questions/YesNoInput";
import YesNoWithNumericEntry from "@/components/questions/YesNoWithNumericEntry";
import { InputProps } from "@/types/ui-models";
import ActionButton from "@/components/ui/ActionButton";
import { Text } from "@radix-ui/themes";

interface AssessmentFormProps {
  isConfirmationPage: boolean;
  questions: Question[];
  responses: Record<number, string | string[]>;
  onInputChange: (questionId: number, value: string | string[]) => void;
  onSubmit: (confirm: boolean, isConfirmationPage: boolean) => void;
  site?: Site;
}

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

const NumericInput = ({ question, value, onChange }: InputProps) => (
  <input
    type="number"
    className={baseInputClasses}
    style={getInputBackgroundStyle(value)}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const ShortResponseInput = ({ question, value, onChange }: InputProps) => (
  <input
    type="text"
    className={baseInputClasses}
    style={getInputBackgroundStyle(value)}
    value={value}
    onChange={(e) => onChange(question.id, e.target.value)}
  />
);

const LongResponseInput = ({ question, value, onChange }: InputProps) => (
  <textarea
    className={baseInputClasses}
    style={getInputBackgroundStyle(value)}
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
  const [requiredNotAnswered, setRequiredNotAnswered] = useState(false);
  //check if all required questions are answered
  const checkRequired = (
    questions: Question[],
    responses: Record<number, string | string[]>,
  ) => {
    const requiredQuestions = questions.filter((question) => question.required);
    // check if reponses are not empty, null or empty array
    const allRequiredAnswered = requiredQuestions.every(
      (question) =>
        responses[question.id] != null &&
        responses[question.id] !== "" &&
        responses[question.id].length != 0,
    );
    setRequiredNotAnswered(!allRequiredAnswered);
    return allRequiredAnswered;
  };

  const renderInput = (question: Question) => {
    const value = responses[question.id] || "";
    const commonProps = {
      question,
      value,
      onChange: onInputChange,
      isConfirmationPage,
    };

    switch (question.type) {
      case "DisplayText":
        return;
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
            className={baseInputClasses}
            style={getInputBackgroundStyle(value)}
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
          const showSubtext =
            !!question.subtext &&
            (!question.allowsAdditionalInput ||
              question.type === "Long Response");
          const showRedDot = question.required;
          const hasParent = question.parentQuestionId;

          return (
            <div key={question.id} className="space-y-1">
              {(!hasParent || responses[hasParent] == "true") && (
                <>
                  <label className="block font-bold text-2xl md:text-[32px] md:leading-[35px] text-[#1D2F73]">
                    {question.text}
                    {showRedDot && <span className="text-red-500"> *</span>}
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
          {requiredNotAnswered && (
            <Text>
              Please answer all required <span style={{ color: "red" }}>*</span>{" "}
              questions
            </Text>
          )}
          <ActionButton
            type="button"
            variant="primary"
            label="Save"
            onClick={() => {
              onSubmit(false, isConfirmationPage);
            }}
          />
          <ActionButton
            type="button"
            variant="success"
            label={isConfirmationPage ? "Save and Finalize" : "Save & Confirm"}
            onClick={() => {
              if (checkRequired(questions, responses))
                onSubmit(true, isConfirmationPage);
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
