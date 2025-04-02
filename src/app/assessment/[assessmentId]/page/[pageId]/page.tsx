"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import PageLayout from "@/components/PageLayout";
import AssessmentForm from "@/components/AssessmentForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Question, SidebarProps, ProgressStatus } from "@/types/models";

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const pageId = useMemo(() => {
    const id = params.pageId;
    return Array.isArray(id) ? id[0] : id || "";
  }, [params.pageId]);

  const [siteAssessment, setSiteAssessment] = useState<{ id: number } | null>(
    null,
  );
  const [assessmentPages, setAssessmentPages] = useState<
    SidebarProps["sitePages"]
  >([]);
  const [page, setPage] = useState<{
    title: string;
    questions: Question[];
  } | null>(null);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Redirect if no session
  useEffect(() => {
    if (status !== "loading" && !session?.user?.accessToken) {
      router.push("/about");
    }
  }, [session, status, router]);

  // Fetch siteAssessment and pages
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.accessToken) return;

    fetch(`/flask-api/api/site-assessment`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
    })
      .then((res) => {
        if (res.status === 401) {
          signOut();
          router.push("/login");
          throw new Error("Token has expired");
        }
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSiteAssessment({ id: data.id });
        const pages = data.sitePages.map(
          (page: {
            id: number;
            page: { title: string };
            progress: ProgressStatus;
          }) => ({
            id: page.id,
            title: page.page.title,
            progress: page.progress,
          }),
        );
        setAssessmentPages(pages);
      })
      .catch((err) => setError(err.message));
  }, [session, status, router]);

  // Fetch questions for current page
  useEffect(() => {
    if (!session?.user?.accessToken || !siteAssessment || !pageId) return;

    fetch(
      `/flask-api/api/site-assessment/${siteAssessment.id}/site-page/${pageId}`,
      {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPage(data);
        const initial = data.questions.reduce(
          (acc: Record<number, string>, q: Question) => {
            const existing = data.responses?.find(
              (r: { questionId: number; value: string }) =>
                r.questionId === q.id,
            );
            acc[q.id] = existing?.value || q.defaultValue || "";
            return acc;
          },
          {},
        );
        setResponses(initial);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      });
  }, [siteAssessment, pageId, session]);

  const handleInputChange = useCallback((questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = async (confirm = false) => {
    if (!session || !siteAssessment) {
      router.push("/about");
      return;
    }

    const payload = {
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      })),
      confirmed: confirm,
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
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.error || "Failed to save responses.");
    } else {
      const currentIndex = assessmentPages.findIndex(
        (p) => p.id === Number(pageId),
      );
      if (currentIndex !== -1 && currentIndex < assessmentPages.length - 1) {
        const nextPageId = assessmentPages[currentIndex + 1].id;
        router.push(`/assessment/${siteAssessment.id}/page/${nextPageId}`);
      } else {
        router.push("/dashboard");
      }
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
