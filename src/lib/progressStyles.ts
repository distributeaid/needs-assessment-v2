import type { ProgressStatus } from "@/types/models";
import { colors } from "@/styles/colors";

export const progressColors: Record<ProgressStatus, string> = {
  LOCKED: colors.secondary.base,
  UNSTARTEDREQUIRED: colors.primary.base,
  STARTEDREQUIRED: colors.primary.base,
  UNSTARTEDOPTIONAL: colors.secondary.base,
  STARTEDOPTIONAL: colors.secondary.base,
  COMPLETE: colors.success.base,
};

export const isRequired = (progress: ProgressStatus) =>
  progress === "UNSTARTEDREQUIRED" || progress === "STARTEDREQUIRED";
