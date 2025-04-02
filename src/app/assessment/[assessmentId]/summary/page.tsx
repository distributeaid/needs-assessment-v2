"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import { SidebarProps } from "@/types/models";
import { useSession } from "next-auth/react";

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
  const [sidebarPages, setSidebarPages] = useState<SidebarProps["sitePages"]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.accessToken) return;
      const [summaryRes, pagesRes] = await Promise.all([
        fetch(`/flask-api/api/site-assessment/${assessmentId}/summary`,
          {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          }
        ),
        fetch(`/flask-api/api/site-assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          }
        ),
      ]);

      const summaryData = await summaryRes.json();
      const siteAssessment = await pagesRes.json();

      setData(summaryData);
      setSidebarPages(
        siteAssessment.sitePages.map((p: { id: number; page: { title: string; order: number }; progress: number }) => ({
          id: p.id,
          title: p.page.title,
          progress: p.progress,
          order: p.page.order,
        }))
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
        currentPageId: "", // none selected
        confirmed: true,
      }}
    >
      <div className="space-y-8">
        {data.map((page) => (
          <div key={page.sitePageId} className="space-y-2">
            <h2 className="text-xl font-semibold text-blue-700">
              <a
                href={`/assessment/${assessmentId}/page/${page.sitePageId}`}
                className="hover:underline"
              >
                {page.sitePageTitle}
              </a>
            </h2>
            <ul className="pl-4 list-disc text-gray-800">
              {page.responses.map((resp) => (
                <li key={resp.questionId}>
                  <strong>{resp.questionText}:</strong> {resp.responseValue}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
