// src/components/questions/YesNoInput.tsx
"use client";

import React from "react";
import { InputProps } from "@/types/ui-models";
import SelectableButton from "@/components/ui/SelectableButton";

const YesNoInput: React.FC<InputProps> = ({ question, value, onChange }) => {
  return (
    <div className="flex gap-4">
      <SelectableButton
        label="YES"
        selected={value === "true"}
        onClick={() => onChange(question.id, "true")}
      />
      <SelectableButton
        label="NO"
        selected={value === "false"}
        onClick={() => onChange(question.id, "false")}
      />
    </div>
  );
};

export default YesNoInput;
