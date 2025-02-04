// src/types/models.ts

export interface Question {
  id: number;
  text: string;
  type: "Numeric" | "Dropdown" | "MultiSelect" | "Short Response" | "Long Response" | "Confirm" | "SizingGrid";
  defaultValue?: string;
}

export interface Page {
  id: number;
  title: string;
  surveyId: number;
  questions: Question[];
}

export interface Survey {
  id: number;
  year: number;
  season: string;
  pages: Page[];
}

export interface QuestionResponse {
  sitePageId: number | undefined;
  id: number;
  questionId: number;
  value: string;
}

export interface SitePage {
  id: number;
  siteSurveyId: number;
  page: {
    id: number;
    title: string;
    questions: Question[];
  };
  responses: QuestionResponse[];
}

export interface SiteSurvey {
  id: number;
  siteId: number;
  surveyId: number;
  sitePages: SitePage[];
}

export interface Site {
  id: number;
  address: string;
  organizationId: number;
  siteSurveys: SiteSurvey[];
}

export interface Organization {
  id: number;
  name: string;
  sites: Site[];
  users: User[];
}

export interface User {
  id: string;  // Remember, NextAuth expects id as string
  email: string;
  organizationId: number;
}
