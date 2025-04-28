"use client";

import React from "react";
import { InputProps } from "@/types/ui-models";
import SelectableButton from "@/components/ui/SelectableButton";

const YesNoInput: React.FC<InputProps> = ({ question, value, onChange }) => {
  const handleClick = (selectedValue: string) => {
    onChange(question.id, selectedValue);
  };

  return (
    <div className="flex gap-2">
      <SelectableButton
        label="Yes"
        selected={value === "true"}
        onClick={() => handleClick("true")}
      />
      <SelectableButton
        label="No"
        selected={value === "false"}
        onClick={() => handleClick("false")}
      />
    </div>
  );
};

export default YesNoInput;
