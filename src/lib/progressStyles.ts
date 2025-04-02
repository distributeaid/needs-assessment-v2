// src/lib/progressStyles.ts
import type { ProgressStatus } from "@/types/models";

export const progressColors: Record<ProgressStatus, string> = {
  LOCKED: "#A3A3A3",
  UNSTARTEDREQUIRED: "#082B76",
  STARTEDREQUIRED: "#082B76",
  UNSTARTEDOPTIONAL: "#6B8FD6",
  STARTEDOPTIONAL: "#6B8FD6",
  COMPLETE: "#5AC597",
};

export const isRequired = (progress: ProgressStatus) =>
  progress === "UNSTARTEDREQUIRED" || progress === "STARTEDREQUIRED";
