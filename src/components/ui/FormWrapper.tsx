"use client";

import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Question } from "@/types/models";

type FormWrapperProps = {
  status: "authenticated" | "unauthenticated" | "loading";
  questions: Question[];
  error: string | null;
  children: React.ReactNode;
};

export default function FormWrapper({
  status,
  questions,
  error,
  children,
}: FormWrapperProps) {
  if (status === "loading" || questions.length === 0) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  return <>{children}</>;
}
