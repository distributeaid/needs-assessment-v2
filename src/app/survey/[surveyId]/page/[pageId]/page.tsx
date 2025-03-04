"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SurveyForm from "@/components/SurveyForm";
import { Question, SidebarProps, ProgressStatus } from "@/types/models";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SurveyPage() {
  const params = useParams();
  const surveyId = useMemo(() => {
    if (!params.surveyId) return "";
    return Array.isArray(params.surveyId)
      ? params.surveyId[0]
      : params.surveyId;
  }, [params.surveyId]);
  const pageId = useMemo(() => {
    if (!params.pageId) return "";
    return Array.isArray(params.pageId) ? params.pageId[0] : params.pageId;
  }, [params.pageId]);
  const router = useRouter();

  const [page, setPage] = useState<{
    title: string;
    questions: Question[];
  } | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [surveyPages, setSurveyPages] = useState<SidebarProps["sitePages"]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!surveyId || !pageId) return;
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/survey/${surveyId}/page/${pageId}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setPage(data);
        const initialResponses = data.questions.reduce(
          (acc: { [key: number]: string }, question: Question) => {
            const existing = data.responses?.find(
              (resp: { questionId: number; value: string }) =>
                resp.questionId === question.id,
            );
            acc[question.id] =
              existing && existing.value !== ""
                ? existing.value
                : question.defaultValue || "";
            return acc;
          },
          {},
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
  }, [surveyId, pageId]);

  useEffect(() => {
    if (!surveyId) return;
    fetch(`/api/survey/${surveyId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const pagesWithProgress = data.pages.map(
          (page: { id: number; title: string; progress: ProgressStatus }) => ({
            id: page.id,
            title: page.title,
            progress: page.progress,
          }),
        );
        setSurveyPages(pagesWithProgress);
      })
      .catch((err) => console.error("Survey fetch error:", err));
  }, [surveyId]);

  const handleInputChange = useCallback((questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = async (confirm = false) => {
    const payload = {
      surveyId,
      pageId,
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      })),
      confirmed: confirm,
    };

    const res = await fetch(`/api/survey/${surveyId}/page/${pageId}/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error Response:", errorData);
      setError(errorData.error || "Failed to save responses.");
    } else {
      const currentIndex = surveyPages.findIndex(
        (page) => page.id === Number(pageId),
      );
      if (currentIndex !== -1 && currentIndex < surveyPages.length - 1) {
        const nextPageId = surveyPages[currentIndex + 1].id;
        router.push(`/survey/${surveyId}/page/${nextPageId}`);
      } else {
        router.push("/dashboard");
      }
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!page) return <LoadingSpinner />;

  return (
    <div className="flex">
      {surveyId && pageId && (
        <Sidebar
          surveyId={surveyId as string}
          sitePages={surveyPages}
          currentPageId={pageId as string}
        />
      )}
      <SurveyForm
        title={page.title}
        questions={page.questions}
        responses={responses}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
