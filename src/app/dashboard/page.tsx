// app/dashboard/page.tsx or wherever your Dashboard is
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import SitePageCard from "@/components/SitePageCard";
import { SiteAssessment } from "@/types/models";

import { Text, Container, Separator, Flex, Box } from "@radix-ui/themes";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [siteAssessment, setSiteAssessment] = useState<SiteAssessment | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user.accessToken) {
      router.push("/about");
      return;
    }

    fetch(`/flask-api/api/site-assessment`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Full API response:", data);
        setSiteAssessment(data);
      })
      .catch((err) => setError(err.message));
  }, [session, status, router]);

  if (status === "loading" || !siteAssessment) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  const unlockedPages = siteAssessment.sitePages.filter(
    (page) => page.progress !== "LOCKED",
  );
  const lockedPages = siteAssessment.sitePages.filter(
    (page) => page.progress === "LOCKED",
  );

  return (
    <Container className="w-full h-screen bg-gray-100 p-8">
      <Text as="p" className="text-xl font-bold text-blue-900 mt-20">
        Select a category to begin your assessment.
      </Text>

      {/* Unlocked Cards */}
      <Flex
        direction={{ initial: "column", md: "row" }}
        className="gap-6 mt-6 flex justify-center items-center"
        justify="center"
        wrap="wrap"
      >
        {unlockedPages.map((page) => (
          <SitePageCard
            key={page.id}
            pageId={page.id}
            siteAssessmentId={page.siteAssessmentId}
            title={page.page.title}
            progress={page.progress}
          />
        ))}
      </Flex>

      <Box className="flex justify-center w-full my-10">
        <Separator className="border-t-2 border-gray-500 w-full max-w-3xl" />
      </Box>
      {/* Locked Cards */}
      <Text
        as="p"
        className="text-lg font-semibold text-gray-600 text-center mb-4"
      >
        Locked categories (complete required sections to unlock)
      </Text>
      <Flex
        direction={{ initial: "column", md: "row" }}
        className="gap-6 mt-2 flex justify-center items-center"
        justify="center"
        wrap="wrap"
      >
        {lockedPages.map((page) => (
          <SitePageCard
            key={page.id}
            pageId={page.id}
            siteAssessmentId={page.siteAssessmentId}
            title={page.page.title}
            progress={page.progress}
          />
        ))}
      </Flex>
    </Container>
  );
}
