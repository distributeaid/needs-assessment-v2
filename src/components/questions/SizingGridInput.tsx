import React, { useState, useEffect } from "react";
import { InputProps } from "@/types/ui-models";

interface Distribution {
  [category: string]: {
    percentage: number;
    sizes: { [size: string]: number };
  };
}

const categories = ["Men", "Women", "Boys", "Girls"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

const getDefaultDistribution = (): Distribution =>
  categories.reduce((acc, category) => {
    acc[category] = {
      percentage: 0,
      sizes: sizeOptions.reduce(
        (sAcc, size) => {
          sAcc[size] = 0;
          return sAcc;
        },
        {} as { [size: string]: number },
      ),
    };
    return acc;
  }, {} as Distribution);

const SizingGridInput: React.FC<InputProps> = ({
    question,
    value,
    onChange,
  }) => {
    const parsedValue =
      typeof value === "string" && value.trim() !== "" ? value : "{}";

    const [distribution, setDistribution] = useState<Distribution>(() => {
      try {
        return JSON.parse(parsedValue);
      } catch (err) {
        console.error("Error parsing sizing grid value:", err);
        return getDefaultDistribution();
      }
    });


  // Track collapsed/expanded state; collapsed by default
  const [isExpanded, setIsExpanded] = useState(false);

  // Whenever distribution changes, update the parent value as a JSON string
  useEffect(() => {
    onChange(question.id, JSON.stringify(distribution));
  }, [distribution, question.id, onChange]);

  const handlePercentageChange = (category: string, newVal: string) => {
    const newPercentage = parseFloat(newVal) || 0;
    setDistribution((prev) => ({
      ...prev,
      [category]: { ...prev[category], percentage: newPercentage },
    }));
  };

  const handleSizeChange = (category: string, size: string, newVal: string) => {
    const newSizeVal = parseInt(newVal) || 0;
    setDistribution((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        sizes: { ...prev[category].sizes, [size]: newSizeVal },
      },
    }));
  };

  const totalPercentage = categories.reduce(
    (sum, cat) => sum + distribution[cat].percentage,
    0,
  );
  const isValid = totalPercentage === 100;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Enter sizing information here</h3>
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-blue-500 underline"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h4 className="text-lg font-semibold">{category}</h4>
              <label className="block mb-2">
                Percentage: {distribution[category].percentage}%
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={distribution[category].percentage}
                  onChange={(e) =>
                    handlePercentageChange(category, e.target.value)
                  }
                  className="mt-1 p-2 border rounded w-full"
                />
              </label>
              <div className="grid grid-cols-3 gap-4">
                {sizeOptions.map((size) => (
                  <div key={size}>
                    <label className="block text-sm font-medium">
                      {size}:
                      <input
                        type="number"
                        min="0"
                        value={distribution[category].sizes[size]}
                        onChange={(e) =>
                          handleSizeChange(category, size, e.target.value)
                        }
                        className="mt-1 p-2 border rounded w-full"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!isValid && (
            <p className="text-red-500 font-semibold">
              Total percentage must equal 100%. Current total: {totalPercentage}
              %
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SizingGridInput;
