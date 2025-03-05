import Image from "next/image";
import { SidebarProps } from "@/types/models";
import { Flex, Box, Text } from "@radix-ui/themes";
import { Tooltip } from "radix-ui";
interface SidebarIconProps {
  progress: SidebarProps["sitePages"][0]["progress"];
  prevPage?: string;
  isLast?: boolean;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({
  progress,
  isLast = false,
  prevPage = "",
}) => {
  const isRequired =
    progress === "UNSTARTEDREQUIRED" || progress === "STARTEDREQUIRED";
  const isLocked = progress === "LOCKED";
  const getBackgroundColor = () => {
    switch (progress) {
      case "LOCKED":
        return "#A3A3A3"; //gray
      case "UNSTARTEDREQUIRED":
      case "STARTEDREQUIRED":
        return "#082B76"; //blue
      // return <Circle className="text-gray-400 mr-2" size={18} />;
      case "UNSTARTEDOPTIONAL":
      case "STARTEDOPTIONAL":
        return "#082B76"; //blue
      case "COMPLETE":
        return "#5AC597"; //green
      default:
        return "#A3A3A3"; //gray
    }
  };
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
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <Box className="relative">
        {isRequired && (
          <Box className="bg-red-600 absolute -top-1 -right-1 w-3 h-3 rounded-full"></Box>
        )}
      </Box>
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
                  style={{ backgroundColor: "black" }}
                >
                  <Text>
                    {isLast
                      ? "Please complete all required pages"
                      : `Please complete the ${prevPage} page`}
                  </Text>
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
