import { Question } from "@/types/models";

export interface InputProps {
  question: Question;
  value: string | string[];
  onChange: (questionId: number, value: string | string[]) => void;
}
