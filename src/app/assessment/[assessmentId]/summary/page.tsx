"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { SidebarProps } from "@/types/models";
import { useSession } from "next-auth/react";
import ShareableCarousel from "@/components/ShareableCarousel";
import FormattedResponse from "@/components/FormattedResponse";

interface SummaryItem {
  sitePageId: number;
  sitePageTitle: string;
  responses: {
    questionId: number;
    questionText: string;
    responseValue: string;
  }[];
}

export default function SummaryPage() {
  const { assessmentId } = useParams();
  const [data, setData] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarPages, setSidebarPages] = useState<SidebarProps["sitePages"]>(
    [],
  );
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.accessToken) return;

      const [summaryRes, pagesRes] = await Promise.all([
        fetch(`/flask-api/api/site-assessment/${assessmentId}/summary`, {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        }),
        fetch(`/flask-api/api/site-assessment/${assessmentId}`, {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        }),
      ]);

      const summaryData = await summaryRes.json();
      const siteAssessment = await pagesRes.json();

      setData(summaryData);
      setSidebarPages(
        siteAssessment.sitePages.map(
          (p: {
            id: number;
            page: { title: string; order: number };
            progress: number;
          }) => ({
            id: p.id,
            title: p.page.title,
            progress: p.progress,
            order: p.page.order,
          }),
        ),
      );
      setLoading(false);
    };

    fetchData();
  }, [assessmentId, session, status]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <PageLayout
      title="Summary of Your Responses"
      withSidebar
      sidebarProps={{
        siteAssessmentId: String(assessmentId),
        sitePages: sidebarPages,
        currentPageId: "",
        confirmed: true,
      }}
    >
      <div className="space-y-8">
        {data.map((page) => (
          <div
            key={page.sitePageId}
            className="bg-white border border-blue-100 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-blue-800 mb-4">
              <a
                href={`/assessment/${assessmentId}/page/${page.sitePageId}`}
                className="hover:underline"
              >
                {page.sitePageTitle}
              </a>
            </h2>
            <div className="space-y-3">
              {page.responses.map((resp) => (
                <div
                  key={resp.questionId}
                  className="bg-blue-50 rounded-md p-3 border border-blue-100"
                >
                  <p className="text-sm font-semibold text-blue-900">
                    {resp.questionText}
                  </p>
                  <FormattedResponse value={resp.responseValue} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ShareableCarousel
        organizationName="Borderlands"
        peopleServed="1000"
        cards={[
          {
            title: "Top Need",
            highlight: "Tarpaulins",
            subtext: "Shelter materials are the highest priority.",
            backgroundColor: "#082B76",
          },
          {
            title: "Food Support",
            highlight: "Dried Lentils",
            subtext: "High demand for long-lasting food items.",
            backgroundColor: "#3759D9",
          },
          {
            title: "Demographics",
            highlight: "Formerly Incarcerated",
            subtext: "Vulnerable population supported.",
            backgroundColor: "#051E5E",
          },
          {
            title: "Help Needed",
            highlight: "Community Campaigns",
            subtext: "Borderlands is interested in local collections.",
            backgroundColor: "#3759D9",
          },
        ]}
      />
    </PageLayout>
  );
}
