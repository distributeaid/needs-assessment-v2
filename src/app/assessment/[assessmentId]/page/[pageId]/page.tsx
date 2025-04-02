"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import PageLayout from "@/components/PageLayout";
import AssessmentForm from "@/components/AssessmentForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Question, SidebarProps, SitePage, QuestionResponse } from "@/types/models";

const getIdParam = (param: string | string[] | undefined): string =>
  Array.isArray(param) ? param[0] : param || "";

const mapPages = (sitePages: SitePage[]): SidebarProps["sitePages"] =>
  sitePages.map((p) => ({
    id: p.id,
    title: p.page.title,
    progress: p.progress,
    order: p.page.order,
  }));

const buildInitialResponses = (questions: Question[], responses: QuestionResponse[]) =>
  questions.reduce((acc, q) => {
    const existing = responses?.find((r) => r.questionId === q.id);
    acc[q.id] = existing?.value || q.defaultValue || "";
    return acc;
  }, {} as Record<number, string>);

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pageId = getIdParam(params.pageId);

  const [siteAssessment, setSiteAssessment] = useState<{ id: number } | null>(null);
  const [assessmentPages, setAssessmentPages] = useState<SidebarProps["sitePages"]>([]);
  const [page, setPage] = useState<{ title: string; questions: Question[] } | null>(null);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "loading" && !session?.user?.accessToken) {
      router.push("/about");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchAssessmentAndPages = async () => {
      try {
        const res = await fetch(`/flask-api/api/site-assessment`, {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        });
        if (res.status === 401) {
          signOut();
          router.push("/login");
          throw new Error("Token has expired");
        }
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setSiteAssessment({ id: data.id });
        setAssessmentPages(mapPages(data.sitePages));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchAssessmentAndPages();
  }, [session, status, router]);


  useEffect(() => {
    if (!session?.user?.accessToken || !siteAssessment || !pageId) return;

    const fetchPageQuestions = async () => {
      try {
        const res = await fetch(
          `/flask-api/api/site-assessment/${siteAssessment.id}/site-page/${pageId}`,
          {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          }
        );
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setPage(data);
        setResponses(buildInitialResponses(data.questions, data.responses));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchPageQuestions();
  }, [siteAssessment, pageId, session]);

  const handleInputChange = useCallback((questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = async (confirmed = false) => {
    if (!session || !siteAssessment) {
      router.push("/about");
      return;
    }

    const payload = {
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      })),
      confirmed,
    };

    const res = await fetch(
      `/flask-api/api/site-assessment/${siteAssessment.id}/site-page/${pageId}/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "Failed to save responses.");
    } else {
      const currentIndex = assessmentPages.findIndex((p) => p.id === Number(pageId));
      const nextPage = assessmentPages[currentIndex + 1];
      router.push(
        nextPage
          ? `/assessment/${siteAssessment.id}/page/${nextPage.id}`
          : "/dashboard"
      );
    }
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!page || !siteAssessment) return <LoadingSpinner />;

  return (
    <PageLayout
      title={page.title}
      withSidebar
      sidebarProps={{
        siteAssessmentId: siteAssessment.id.toString(),
        sitePages: assessmentPages,
        currentPageId: pageId,
      }}
    >
      <AssessmentForm
        questions={page.questions}
        responses={responses}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </PageLayout>
  );
}
