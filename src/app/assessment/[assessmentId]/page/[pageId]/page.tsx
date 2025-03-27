"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AssessmentForm from "@/components/AssessmentForm";
import { Question, SidebarProps, ProgressStatus } from "@/types/models";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AssessmentPage() {
  const params = useParams();
  const assessmentId = useMemo(() => {
    if (!params.assessmentId) return "";
    return Array.isArray(params.assessmentId) ? params.assessmentId[0] : params.assessmentId;
  }, [params.assessmentId]);
  const pageId = useMemo(() => {
    if (!params.pageId) return "";
    return Array.isArray(params.pageId) ? params.pageId[0] : params.pageId;
  }, [params.pageId]);
  const router = useRouter();

  const [page, setPage] = useState<{ title: string; questions: Question[] } | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [assessmentPages, setAssessmentPages] = useState<SidebarProps["sitePages"]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId || !pageId) return;
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/assessment/${assessmentId}/page/${pageId}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setPage(data);
        const initialResponses = data.questions.reduce(
          (acc: { [key: number]: string }, question: Question) => {
            const existing = data.responses?.find(
              (resp: { questionId: number; value: string }) =>
                resp.questionId === question.id
            );
            acc[question.id] =
              existing && existing.value !== ""
                ? existing.value
                : question.defaultValue || "";
            return acc;
          },
          {}
        );
        setResponses(initialResponses);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } else {
          setError("An unknown error occurred.");
        }
      }
    };
    fetchPage();
  }, [assessmentId, pageId]);


  useEffect(() => {
    if (!assessmentId) return;
    fetch(`/api/Assessment/${assessmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const pagesWithProgress = data.pages.map((page: { id: number; title: string; progress: ProgressStatus }) => ({
          id: page.id,
          title: page.title,
          progress: page.progress,
        }));
        setAssessmentPages(pagesWithProgress);
      })
      .catch((err) => console.error("Assessment fetch error:", err));
  }, [assessmentId]);

  const handleInputChange = useCallback(
    (questionId: number, value: string) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const handleSubmit = async (confirm = false) => {
    const payload = {
      assessmentId,
      pageId,
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      })),
      confirmed: confirm,
    };

    const res = await fetch(`/api/assessment/${assessmentId}/page/${pageId}/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error Response:", errorData);
      setError(errorData.error || "Failed to save responses.");
    } else {
      const currentIndex = assessmentPages.findIndex(page => page.id === Number(pageId));
      if (currentIndex !== -1 && currentIndex < assessmentPages.length - 1) {
        const nextPageId = assessmentPages[currentIndex + 1].id;
        router.push(`/assessment/${assessmentId}/page/${nextPageId}`);
      } else {
        router.push("/dashboard");
      }
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!page) return <LoadingSpinner />;

  return (
    <div className="flex">
      {assessmentId && pageId && (
        <Sidebar assessmentId={assessmentId as string} sitePages={assessmentPages} currentPageId={pageId as string} />
      )}
      <AssessmentForm
        title={page.title}
        questions={page.questions}
        responses={responses}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
