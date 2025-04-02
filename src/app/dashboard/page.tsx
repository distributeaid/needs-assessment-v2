"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import SitePageCard from "@/components/SitePageCard";
import PageLayout from "@/components/PageLayout";
import { SiteAssessment } from "@/types/models";
import { Text, Flex, Separator } from "@radix-ui/themes";

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
    <PageLayout
      title="Dashboard"
      withSidebar
      sidebarProps={{
        siteAssessmentId: siteAssessment.id.toString(),
        sitePages: siteAssessment.sitePages.map((page) => ({
          id: page.id,
          title: page.page.title,
          progress: page.progress,
          order: page.page.order,
        })),
      }}
    >
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

      <Separator size="4" className="w-3/4 mx-auto mt-2 mb-8" />

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
    </PageLayout>
  );
}
