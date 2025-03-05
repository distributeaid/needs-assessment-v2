"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/about");
    } else {
      router.push("/dashboard"); // Redirect to dashboard if logged in
    }
  }, [session, status, router]);

  return <LoadingSpinner />;
}
