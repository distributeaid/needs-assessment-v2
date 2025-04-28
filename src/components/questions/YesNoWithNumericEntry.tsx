"use client";

import React, { useState, useEffect } from "react";
import { InputProps } from "@/types/ui-models";
import SelectableButton from "@/components/ui/SelectableButton";
import { colors } from "@/styles/colors";

const YesNoWithNumericEntryInput: React.FC<InputProps> = ({
  question,
  value,
  onChange,
}) => {
  const [selected, setSelected] = useState<"Yes" | "No" | "">("");
  const [extra, setExtra] = useState("");

  // Parse initial value
  useEffect(() => {
    if (typeof value === "string") {
      const [choice, number] = value.includes("|")
        ? value.split("|")
        : [value, ""];
      if (choice === "Yes" || choice === "No") {
        setSelected(choice);
        setExtra(number);
      }
    }
  }, [value]);

  // Push updated value to parent
  useEffect(() => {
    if (selected === "Yes") {
      onChange(question.id, `Yes|${extra}`);
    } else if (selected === "No") {
      onChange(question.id, "No");
    }
  }, [selected, extra, onChange, question.id]);

  return (
    <div className="flex flex-col gap-4 bg-blue-50 p-4 rounded-md">
      {/* YES/NO buttons */}
      <div className="flex justify-center gap-4">
        {["Yes", "No"].map((choice) => (
          <SelectableButton
            key={choice}
            label={choice}
            selected={selected === choice}
            onClick={() => setSelected(choice as "Yes" | "No")}
          />
        ))}
      </div>

      {/* Subtext and number input */}
      {selected === "Yes" && (
        <div className="flex flex-col gap-2 items-center">
          {question.subtext && (
            <p className="text-base text-blue-900 font-medium text-center">
              {question.subtext}
            </p>
          )}
          <input
            type="number"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className="w-full p-2 text-gray-900 rounded transition-colors duration-300 h-10"
            style={{
              backgroundColor: extra ? colors.input.filled : colors.input.empty,
            }}
            placeholder="Enter a number"
          />
        </div>
      )}
    </div>
  );
};

export default YesNoWithNumericEntryInput;
