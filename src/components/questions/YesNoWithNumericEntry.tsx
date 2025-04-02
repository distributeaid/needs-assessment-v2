"use client";

import React, { useState, useEffect } from "react";
import { InputProps } from "@/types/ui-models";

const YesNoWithNumericEntryInput: React.FC<InputProps> = ({ question, value, onChange }) => {
  const [selected, setSelected] = useState<"Yes" | "No" | "">("");
  const [extra, setExtra] = useState("");

  // Parse initial value
  useEffect(() => {
    if (typeof value === "string") {
      const [choice, number] = value.includes("|") ? value.split("|") : [value, ""];
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
    <div className="flex flex-col gap-3">
      <div className="flex gap-4">
        {["Yes", "No"].map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setSelected(choice as "Yes" | "No")}
            className={`px-4 py-2 rounded-full font-semibold transition
              ${selected === choice
                ? choice === "Yes"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-green-500 text-white shadow-md"
                : "bg-gray-200 text-blue-900 hover:bg-blue-100"}`}
          >
            {choice.toUpperCase()}
          </button>
        ))}
      </div>

      {selected === "Yes" && (
        <>
          {question.subtext && (
            <p className="text-sm text-blue-900 font-medium">{question.subtext}</p>
          )}
          <input
            type="number"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className="w-full px-4 py-2 rounded border text-blue-900"
            placeholder="Enter a number"
          />
        </>
      )}
    </div>
  );
};

export default YesNoWithNumericEntryInput;
