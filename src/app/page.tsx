"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1. Wait for NextAuth to finish loading
    if (status === "loading") return;

    // 2. If not signed in, go to login
    if (!session) {
      router.push("/login");
      return;
    }

    // 3. Otherwise, fetch /flask-api/me with your JWT
    const checkProfile = async () => {
      const res = await fetch("/flask-api/me", {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // 3a. Unauthorized → back to login
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const profile = await res.json();
      // 4. No site yet → initialize organization
      if (!profile.site_id) {
        router.push("/initialize-org");
      } else {
        // 5. Has site → go to dashboard
        router.push("/dashboard");
      }
    };

    checkProfile();
  }, [status, session, router]);

  return <LoadingSpinner />;
}
