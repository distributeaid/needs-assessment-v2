"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import PageLayout from "@/components/PageLayout";
import AssessmentForm from "@/components/AssessmentForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Question,
  SidebarProps,
  SitePage,
  QuestionResponse,
  Site,
} from "@/types/models";

const getIdParam = (param: string | string[] | undefined): string =>
  Array.isArray(param) ? param[0] : param || "";

const mapPages = (sitePages: SitePage[]): SidebarProps["sitePages"] =>
  sitePages.map((p) => ({
    id: p.id,
    title: p.page.title,
    progress: p.progress,
    order: p.page.order,
    isConfirmationPage: p.isConfirmationPage,
  }));

const buildInitialResponses = (
  questions: Question[],
  responses: QuestionResponse[],
) =>
  questions.reduce(
    (acc, q) => {
      const existing = responses?.find((r) => r.questionId === q.id);
      acc[q.id] = existing?.value || q.defaultValue || "";
      return acc;
    },
    {} as Record<number, string>,
  );

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const pageId = getIdParam(params.pageId);

  const [siteAssessment, setSiteAssessment] = useState<{
    id: number;
    confirmed: boolean;
  } | null>(null);
  const [assessmentPages, setAssessmentPages] = useState<
    SidebarProps["sitePages"]
  >([]);
  const [site, setSite] = useState< Site >();
  const [page, setPage] = useState<{
    title: string;
    questions: Question[];
    isConfirmationPage: boolean;
  } | null>(null);

  const [responses, setResponses] = useState<Record<number, string | string[]>>(
    {},
  );
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
        setSiteAssessment({ id: data.id, confirmed: data.confirmed });
        setAssessmentPages(mapPages(data.sitePages));
        setSite(data.site);

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
          },
        );
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setPage({
          title: data.title,
          questions: data.questions,
          isConfirmationPage: data.isConfirmationPage ?? false,
        });

        setResponses(buildInitialResponses(data.questions, data.responses));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchPageQuestions();
  }, [siteAssessment, pageId, session]);

  const handleInputChange = useCallback(
    (questionId: number, value: string | string[]) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    },
    [],
  );

  const handleSubmit = async (
    confirmed = false,
    isConfirmationPage = false,
  ) => {
    if (!session || !siteAssessment) {
      router.push("/about");
      return;
    }

    const payload = {
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value: Array.isArray(value) ? value : value.toString(),
      })),
      confirmed,
    };

    // First: Save responses
    const res = await fetch(
      `/flask-api/api/site-assessment/${siteAssessment.id}/site-page/${pageId}/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "Failed to save responses.");
      return;
    }

    // Then: Route based on context
    if (isConfirmationPage && confirmed) {
      router.push(`/assessment/${siteAssessment.id}/summary`);
    } else {
      const currentIndex = assessmentPages.findIndex(
        (p) => p.id === Number(pageId),
      );
      const nextPage = assessmentPages[currentIndex + 1];
      router.push(
        nextPage
          ? `/assessment/${siteAssessment.id}/page/${nextPage.id}`
          : "/dashboard",
      );
    }
  };

  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!site || !page || !siteAssessment) return <LoadingSpinner />;

  return (
    <PageLayout
      title={page.title}
      withSidebar
      sidebarProps={{
        siteAssessmentId: siteAssessment.id.toString(),
        sitePages: assessmentPages,
        currentPageId: pageId,
        confirmed: siteAssessment.confirmed,
      }}
    >
      <AssessmentForm
        isConfirmationPage={page.isConfirmationPage}
        questions={page.questions}
        responses={responses}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        site={site}
      />
    </PageLayout>
  );
}
