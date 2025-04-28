"use client";

import Image from "next/image";
import { Flex, Box, Text } from "@radix-ui/themes";
import * as Tooltip from "@radix-ui/react-tooltip";
import { progressColors } from "@/lib/progressStyles";
import { SidebarProps } from "@/types/models";

interface SidebarIconProps {
  progress: SidebarProps["sitePages"][0]["progress"];
  isActive?: boolean;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({
  progress,
  isActive = false,
}) => {
  const isLocked = progress === "LOCKED";

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        backgroundColor: progressColors[progress],
        width: 50,
        height: 50,
        boxShadow: isActive ? "0 0 0 3px rgba(8, 43, 118, 0.5)" : undefined, // 🌟 active glow
      }}
      className="rounded-md transition-all duration-300"
    >
      {isLocked ? (
        <Tooltip.Provider>
          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger asChild>
              <div className="flex items-center justify-center w-full h-full">
                <Image
                  src="/images/fingerprint.png"
                  alt="Fingerprint"
                  width={30}
                  height={30}
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="right" sideOffset={5}>
                <Box
                  className="p-2 rounded"
                  style={{ backgroundColor: progressColors[progress] }}
                >
                  <Text>Please complete the required pages.</Text>
                </Box>
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      ) : (
        <Image
          src="/images/fingerprint.png"
          alt="Fingerprint"
          width={30}
          height={30}
          style={{ width: "auto", height: "auto" }}
          priority
        />
      )}
    </Flex>
  );
};

export default SidebarIcon;
