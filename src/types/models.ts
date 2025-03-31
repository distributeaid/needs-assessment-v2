// src/types/models.ts

export type ProgressStatus =
  | "LOCKED"
  | "UNSTARTEDREQUIRED"
  | "STARTEDREQUIRED"
  | "UNSTARTEDOPTIONAL"
  | "STARTEDOPTIONAL"
  | "COMPLETE";

export interface Question {
  id: number;
  type:
    | "Numeric"
    | "Dropdown"
    | "MultiSelect"
    | "Short Response"
    | "Long Response"
    | "SizingGrid"
    | "YesNo";
  pageId: number;
  text: string;
  defaultValue: string;
  options?: string[]; // Added options for Dropdown, MultiSelect, and SizingGrid types
}

export interface Page {
  id: number;
  title: string;
  assessmentId: number;
  questions: Question[];
}

export interface Assessment {
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
  siteAssessmentId: number;
  progress: ProgressStatus;
  page: {
    id: number;
    title: string;
    questions: Question[];
  };
  responses: QuestionResponse[];
}

export interface SiteAssessment {
  id: number;
  siteId: number;
  assessmentId: number;
  sitePages: SitePage[];
  assessment: Assessment;
}

export interface Site {
  id: number;
  users: User[];
  name: string;
  siteAssessments: SiteAssessment[];
}

export interface SidebarProps {
  assessmentId: string;
  sitePages: { id: number; title: string; progress: ProgressStatus }[];
  currentPageId: string;
}

export interface User {
  id: string; // Remember, NextAuth expects id as string
  email: string;
  siteId: number;
  site: Site;
}
