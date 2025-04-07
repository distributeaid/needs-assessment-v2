"use client";

import React, { useEffect, useState } from "react";
import { InputProps } from "@/types/ui-models";

interface ItemEstimate {
  item: string;
  guessed: number;
  final: number;
}

const SummaryInput: React.FC<InputProps> = ({ question, onChange }) => {
  const [estimates, setEstimates] = useState<ItemEstimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimates = async () => {
      setLoading(true);
      try {
        const res = await fetch("/flask-api/estimate-needs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id }),
        });
        const data = await res.json();
        type EstimateResponse = { item: string; guessed: number };
        const processed = data.estimates.map((e: EstimateResponse) => ({
          item: e.item,
          guessed: e.guessed,
          final: e.guessed,
        }));
        setEstimates(processed);
      } catch (err) {
        console.error("Error fetching estimates", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, [question.id]);

  useEffect(() => {
    const toSave = estimates.map((e) => ({ item: e.item, quantity: e.final }));
    onChange(question.id, JSON.stringify(toSave));
  }, [estimates, onChange, question.id]);

  const handleChange = (item: string, value: string) => {
    setEstimates((prev) =>
      prev.map((e) =>
        e.item === item ? { ...e, final: parseInt(value) || 0 } : e,
      ),
    );
  };

  if (loading) return <p>Loading summary...</p>;

  return (
    <div className="p-4 border rounded bg-blue-50 space-y-4">
      <p className="text-sm text-blue-900 font-medium">{question.subtext}</p>
      {estimates.map((e) => (
        <div key={e.item} className="flex gap-4 items-center">
          <label className="w-1/2 font-semibold text-blue-900">{e.item}</label>
          <input
            type="number"
            className="p-2 border rounded w-1/2"
            value={e.final}
            onChange={(ev) => handleChange(e.item, ev.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default SummaryInput;
