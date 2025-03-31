"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import AssessmentForm from "@/components/AssessmentForm";
import { Question, SidebarProps, ProgressStatus } from "@/types/models";
import LoadingSpinner from "@/components/LoadingSpinner";
import { signOut } from "next-auth/react";

export default function AssessmentPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const { data: session, status } = useSession();
  const params = useParams();
  const assessmentId = useMemo(() => {
    if (!params.assessmentId) return "";
    return Array.isArray(params.assessmentId)
      ? params.assessmentId[0]
      : params.assessmentId;
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

  // Fetch the specific page (with questions & responses)
  useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded

    if (!session) {
      router.push("/about");
      return;
    }

    if (!assessmentId || !pageId) return;

    const fetchPage = async () => {
      if (!session) {
        router.push("/about");
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/api/site-assessment/${assessmentId}/page/${pageId}`,
          {
            headers: {
              "Authorization": `Bearer ${session.user.accessToken}`,
            },
          }
        );
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
  }, [assessmentId, pageId, session, status, router, API_URL]);

  // Fetch overall site assessment and site pages using the JWT instead of email
  useEffect(() => {
    if (!assessmentId || status === "loading") return;
    if (!session) {router.push("/about"); return;}
    fetch(`${API_URL}/api/site-assessment`, {
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
            // Token has expired – sign out and redirect to login
            signOut();
            router.push("/login");
            throw new Error("Token has expired");
         }
          if (!res.ok) throw new Error(`API Error: ${res.status}`);
          return res.json();
      })
      .then((data) => {
        // Map sitePages from the response (adjust keys as needed)
        const pagesWithProgress = data.sitePages.map(
          (page: { id: number; page: { title: string }; progress: ProgressStatus }) => ({
            id: page.id,
            title: page.page.title,
            progress: page.progress,
          })
        );
        setAssessmentPages(pagesWithProgress);
      })
      .catch((err) => console.error("Assessment fetch error:", err));
  }, [assessmentId, session, status, API_URL, router]);

  const handleInputChange = useCallback(
    (questionId: number, value: string) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const handleSubmit = async (confirm = false) => {
    const payload = {
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      })),
      confirmed: confirm,
    };
    if (!session) {
      router.push("/about");
      return;
    }
    const res = await fetch(
      `${API_URL}/api/site-assessment/${assessmentId}/site-page/${pageId}/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error Response:", errorData);
      setError(errorData.error || "Failed to save responses.");
    } else {
      const currentIndex = assessmentPages.findIndex(
        (page) => page.id === Number(pageId)
      );
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
        <Sidebar
          assessmentId={assessmentId as string}
          sitePages={assessmentPages}
          currentPageId={pageId as string}
        />
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
