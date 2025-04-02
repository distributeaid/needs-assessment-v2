import React from "react";
import { InputProps } from "@/types/ui-models";
import GridInput from "@/components/ui/GridInput";

const groups = ["Men", "Women", "Boys", "Girls"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const SizingGridInput: React.FC<InputProps> = (props) => {
  return (
    <GridInput
      {...props}
      rowLabels={groups}
      colLabels={sizes}
      summary={(grid) => {
        const total = Object.values(grid).reduce(
          (sum, row) => sum + Object.values(row).reduce((a, b) => a + b, 0),
          0,
        );
        return (
          <>
            Total percentage:{" "}
            <span className="font-semibold text-blue-900">{total}</span>
          </>
        );
      }}
    />
  );
};

export default SizingGridInput;
