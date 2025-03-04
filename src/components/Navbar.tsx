"use client";
import LogoMark from "../../public/LogoMark";
import { Flex, Text, Button } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { useSession, signIn, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <Flex
      className="bg-[#082B76]"
      width="100%"
      p="9"
      align="center"
      justify="between"
    >
      <Flex
        className="tracking-[0.5em] space-x-5"
        direction="row"
        mx="auto"
        align="center"
      >
        <LogoMark width="50" height="65"></LogoMark>
        <Text className="text-white">NEEDS ASSESSMENT</Text>
      </Flex>

      <Flex className="bg-white text-black px-4 py-2 rounded translate-x-[-1rem]">
        {session ? (
          <Button onClick={() => signOut({ callbackUrl: "/about" })}>
            LOG OUT
          </Button>
        ) : (
          <Button onClick={() => signIn()}>LOG IN</Button>
        )}
      </Flex>
    </Flex>
  );
};

export default Navbar;
