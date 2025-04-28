"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import ActionButton from "@/components/ui/ActionButton";
import { colors } from "@/styles/colors";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav
      className="w-full p-4 flex items-center justify-between"
      style={{ backgroundColor: colors.primary.base }}
    >
      {/* Left: empty spacer to balance layout */}
      <div className="w-24" />

      {/* Center: logo + title */}
      <div className="flex items-center gap-2">
        <div className="relative w-[30px] h-[30px] sm:w-[24px] sm:h-[24px]">
          <Image
            src="/images/logo.png"
            alt="Logo"
            fill
            sizes="(max-width: 640px) 24px, 30px"
            className="object-contain"
            priority
          />
        </div>

        <Link href="/">
          <span className="text-white text-xl font-light">
            NEEDS ASSESSMENT
          </span>
        </Link>
      </div>
      {/* Right: login/logout buttons */}
      <div className="flex items-center gap-2">
        {session ? (
          <ActionButton
            variant="secondary"
            label="Logout"
            onClick={() => signOut({ callbackUrl: "/about" })}
          />
        ) : (
          <ActionButton
            variant="success"
            label="Login"
            onClick={() => signIn()}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
