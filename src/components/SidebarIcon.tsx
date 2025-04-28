import Image from "next/image";
import { SidebarProps } from "@/types/models";
import { Flex, Box, Text } from "@radix-ui/themes";
import * as Tooltip from "@radix-ui/react-tooltip";
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
      style={{ backgroundColor: progressColors[progress], borderRadius: "8px" }}
    >
      {isLocked ? (
        <Tooltip.Provider>
          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger asChild>
              <Image
                width={40}
                height={40}
                src="/images/fingerprint.png"
                alt="Fingerprint"
                style={{ opacity: 0.5 }} // 👈 add lower opacity when locked
              />
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
          width={40}
          height={40}
          src="/images/fingerprint.png"
          alt="Fingerprint"
          style={{ opacity: 1 }} // 👈 fully visible when not locked
        />
      )}
    </Flex>
  );
};

export default SidebarIcon;
