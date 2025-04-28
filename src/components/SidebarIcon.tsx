import Image from "next/image";
import { SidebarProps } from "@/types/models";
import { Flex, Box, Text } from "@radix-ui/themes";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Lock } from "lucide-react";
import { progressColors } from "@/lib/progressStyles";

interface SidebarIconProps {
  progress: SidebarProps["sitePages"][0]["progress"];
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ progress }) => {
  const isLocked = progress === "LOCKED";

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        backgroundColor: progressColors[progress],
        borderRadius: "8px",
        position: "relative",
        width: "50px",
        height: "50px",
      }}
    >
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={0}>
          <Tooltip.Trigger asChild>
            {isLocked ? (
              <Lock
                size={40} // Same size as the fingerprint
                strokeWidth={1.5} // Optional: make it thinner
                color="gray"
                style={{ opacity: 0.7 }}
              />
            ) : (
              <Image
                src="/images/fingerprint.png"
                alt="Fingerprint"
                width={40}
                height={40}
                style={{ opacity: 1 }}
              />
            )}
          </Tooltip.Trigger>
          {isLocked && (
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
          )}
        </Tooltip.Root>
      </Tooltip.Provider>
    </Flex>
  );
};

export default SidebarIcon;
