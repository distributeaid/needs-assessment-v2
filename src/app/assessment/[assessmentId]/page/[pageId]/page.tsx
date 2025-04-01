"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import AssessmentForm from "@/components/AssessmentForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Question, SidebarProps, ProgressStatus } from "@/types/models";

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  // We only need the pageId from the URL now.
  const pageId = useMemo(() => {
    if (!params.pageId) return "";
    return Array.isArray(params.pageId) ? params.pageId[0] : params.pageId;
  }, [params.pageId]);

  // State to hold the siteAssessment instance returned from the backend.
  const [siteAssessment, setSiteAssessment] = useState<{ id: number } | null>(
    null,
  );
  const [page, setPage] = useState<{
    title: string;
    questions: Question[];
  } | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [assessmentPages, setAssessmentPages] = useState<
    SidebarProps["sitePages"]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect if there's no valid session.
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.accessToken) {
      router.push("/about");
    }
  }, [session, status, router]);

  // Fetch overall site assessment data (includes siteAssessmentId and sitePages).
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/about");
      return;
    }
    fetch(`/flask-api/api/site-assessment`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
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
        // Save the siteAssessment instance.
        setSiteAssessment({ id: data.siteAssessmentId });
        // Map sitePages to our UI format.
        const pagesWithProgress = data.sitePages.map(
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
        setAssessmentPages(pagesWithProgress);
      })
      .catch((err) => console.error("Assessment fetch error:", err));
  }, [session, status, router]);

  // Fetch details for the specific page (its questions and any existing responses)
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.accessToken) return;
    if (!siteAssessment || !pageId) return;

    const fetchPage = async () => {
      try {
        const res = await fetch(
          `/flask-api/api/site-assessment/${siteAssessment.id}/site-page/${pageId}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          },
        );
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
  }, [siteAssessment, pageId, session, status, router]);

  const handleInputChange = useCallback((questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = async (confirm = false) => {
    const payload = {
      responses: Object.entries(responses).map(([questionId, value]) => ({
        questionId: parseInt(questionId),
        value,
      })),
      confirmed: confirm,
    };
    if (!session || !siteAssessment) {
      router.push("/about");
      return;
    }
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
      console.error("Error Response:", errorData);
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

  if (error) return <div>Error: {error}</div>;
  if (!page || !siteAssessment) return <LoadingSpinner />;

  return (
    <div className="flex">
      <Sidebar
        siteAssessmentId={siteAssessment.id.toString()}
        sitePages={assessmentPages}
        currentPageId={pageId}
      />
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
