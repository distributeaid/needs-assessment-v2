import React from "react";
import { InputProps } from "@/types/ui-models";
import GridInput from "@/components/ui/GridInput";

const categories = ["Infants", "Kids", "Teens", "Adults"];
const genders = ["Male", "Female"];

const DemoGridInput: React.FC<InputProps> = (props) => {
  return (
    <GridInput
      {...props}
      rowLabels={genders}
      colLabels={categories}
      summary={(grid) => {
        const total = Object.values(grid).reduce(
          (sum, row) => sum + Object.values(row).reduce((a, b) => a + b, 0),
          0,
        );
        return (
          <>
            Total people:{" "}
            <span className="font-semibold text-blue-900">{total}</span>
          </>
        );
      }}
    />
  );
};

export default DemoGridInput;
