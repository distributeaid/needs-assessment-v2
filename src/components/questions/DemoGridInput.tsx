import React, { useEffect, useState } from "react";
import { InputProps } from "@/types/ui-models";
import GridInput from "@/components/ui/GridInput";

const categories = ["Infants", "Kids", "Teens", "Adults"];
const genders = ["Male", "Female"];

type Grid = Record<string, Record<string, number>>;

const DemoGridInput: React.FC<InputProps & { peopleServed?: number }> = ({
  peopleServed,
  ...props
}) => {
  const [initialGrid, setInitialGrid] = useState<Grid | null>(null);

  useEffect(() => {
    const parsed: Grid | null =
      typeof props.value === "string" && props.value.trim()
        ? (() => {
            try {
              return JSON.parse(props.value);
            } catch {
              return null;
            }
          })()
        : null;

    const existingTotal = parsed
      ? Object.values(parsed).reduce(
          (sum, row) => sum + Object.values(row).reduce((a, b) => a + b, 0),
          0
        )
      : 0;

    if (peopleServed && existingTotal === 0) {
      const totalCells = categories.length * genders.length;
      const perCell = Math.floor(peopleServed / totalCells);
      const remaining = peopleServed % totalCells;

      const grid: Grid = {};
      let count = 0;
      genders.forEach((gender) => {
        grid[gender] = {};
        categories.forEach((cat) => {
          grid[gender][cat] = perCell + (count < remaining ? 1 : 0);
          count++;
        });
      });

      setInitialGrid(grid);
      props.onChange(props.question.id, JSON.stringify(grid));
    }
  }, [peopleServed, props]);

  return (
    <GridInput
      {...props}
      rowLabels={genders}
      colLabels={categories}
      initialGrid={initialGrid ?? undefined}
      summary={(grid) => {
        const total = Object.values(grid).reduce(
          (sum, row) => sum + Object.values(row).reduce((a, b) => a + b, 0),
          0
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
