import React, { useEffect, useState, JSX } from "react";
import { InputProps } from "@/types/ui-models";

type Grid = Record<string, Record<string, number>>;

interface GridInputProps extends InputProps {
  rowLabels: string[];
  colLabels: string[];
  summary?: (grid: Grid) => string | JSX.Element | null;
}

const GridInput: React.FC<GridInputProps> = ({
  question,
  value,
  onChange,
  rowLabels,
  colLabels,
  summary,
}) => {
  const parseGrid = (): Grid => {
    const empty: Grid = {};
    rowLabels.forEach((row) => {
      empty[row] = {};
      colLabels.forEach((col) => {
        empty[row][col] = 0;
      });
    });

    if (typeof value === "string" && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return Object.fromEntries(
          rowLabels.map((row) => [
            row,
            {
              ...empty[row],
              ...(parsed?.[row] ?? {}),
            },
          ]),
        ) as Grid;
      } catch {
        console.warn("Failed to parse grid JSON, using default.");
      }
    }

    return empty;
  };

  const [grid, setGrid] = useState<Grid>(parseGrid);

  useEffect(() => {
    onChange(question.id, JSON.stringify(grid));
  }, [grid, onChange, question.id]);

  const handleChange = (row: string, col: string, val: string) => {
    const num = parseInt(val) || 0;
    setGrid((prev) => ({
      ...prev,
      [row]: {
        ...prev[row],
        [col]: num,
      },
    }));
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <div className="flex items-center justify-between"></div>

      {
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th></th>
                {colLabels.map((col) => (
                  <th
                    key={col}
                    className="px-2 py-1 font-semibold text-blue-900"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowLabels.map((row) => (
                <tr key={row}>
                  <td className="font-bold text-blue-900 pr-2 whitespace-nowrap">
                    {row}:
                  </td>
                  {colLabels.map((col) => (
                    <td key={col}>
                      <input
                        type="number"
                        min="0"
                        value={grid[row][col]}
                        onChange={(e) => handleChange(row, col, e.target.value)}
                        className="mt-1 p-2 border rounded w-full"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {summary && (
            <div className="mt-2 text-sm text-gray-700">{summary(grid)}</div>
          )}
        </div>
      }
    </div>
  );
};

export default GridInput;
