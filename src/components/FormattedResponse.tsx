"use client";

import React from "react";

type Props = {
  value: string;
};

const isJson = (str: string) => {
  try {
    const parsed = JSON.parse(str);
    return parsed;
  } catch {
    if (Array.isArray(str)) {
      return str;
    }
    return null;
  }
};

const FormattedResponse: React.FC<Props> = ({ value }) => {
  const parsed = isJson(value);

  if (parsed === null) {
    return <p className="text-sm text-gray-700">{value}</p>;
  }

  // Handle array
  if (Array.isArray(parsed)) {
    return (
      <ul className="list-disc list-inside text-sm text-gray-700">
        {parsed.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }

  // Handle object (e.g. sizing grid)
  if (typeof parsed === "object") {
    return (
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full text-gray-700">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Group</th>
              {Object.keys(parsed[Object.keys(parsed)[0]] ?? {}).map((col) => (
                <th key={col} className="border px-2 py-1 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(parsed).map(([group, values]) => (
              <tr key={group}>
                <td className="border px-2 py-1 font-medium">{group}</td>
                {Object.values(values as Record<string, number>).map(
                  (val, idx) => (
                    <td key={idx} className="border px-2 py-1">
                      {val}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p className="text-sm text-gray-700">{value}</p>;
};

export default FormattedResponse;
