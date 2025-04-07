import Image from "next/image";
import { SidebarProps } from "@/types/models";
import { Flex, Box, Text } from "@radix-ui/themes";
import { Tooltip } from "radix-ui";
import { progressColors } from "@/lib/progressStyles";
interface SidebarIconProps {
  progress: SidebarProps["sitePages"][0]["progress"];
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ progress }) => {
  const isLocked = progress === "LOCKED";

  const imageComponent = (
    <Image
      width={40}
      height={40}
      src="/images/fingerprint.png"
      alt="Fingerprint"
    />
  );

  return (
    <Flex
      align={"center"}
      justify={"center"}
      style={{ backgroundColor: progressColors[progress] }}
    >
      {isLocked ? (
        <Tooltip.Provider>
          {/* show tooltip instantly */}
          <Tooltip.Root delayDuration={0}>
            <Tooltip.Trigger asChild>
              {/* component to be hovered to trigger tooltip open */}
              {imageComponent}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="right" sideOffset={5}>
                {/* text shown in tooltip */}
                <Box
                  className="p-2 rounded "
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
        imageComponent
      )}
    </Flex>
  );
};

export default SidebarIcon;
