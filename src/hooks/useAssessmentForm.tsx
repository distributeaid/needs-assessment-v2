"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { Question, QuestionResponse } from "@/types/models";

export function useAssessmentForm(config: {
  questionEndpoint: string;
  responseEndpoint: string;
  saveEndpoint: string;
  onSuccessRedirect: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<number, string | string[]>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user.accessToken) return;

    const token = session.user.accessToken;
    async function load() {
      try {
        const [qRes, rRes] = await Promise.all([
          fetch(config.questionEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(config.responseEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (qRes.status === 401 || rRes.status === 401) {
          signOut();
          router.push("/login");
          return;
        }
        if (!qRes.ok || !rRes.ok) {
          throw new Error("Failed to load survey");
        }

        const qJson: Question[] = await qRes.json();
        const rJson: QuestionResponse[] = await rRes.json();

        const initial: Record<number, string | string[]> = {};
        qJson.forEach((q) => {
          const existing = rJson.find((r) => r.questionId === q.id);
          initial[q.id] = existing?.value ?? "";
        });

        setQuestions(qJson);
        setResponses(initial);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    load();
  }, [
    status,
    session,
    router,
    config.questionEndpoint,
    config.responseEndpoint,
  ]);

  const handleInputChange = useCallback(
    (questionId: number, value: string | string[]) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    },
    [],
  );

  const handleSubmit = async () => {
    const token = session?.user.accessToken;
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = {
        responses: Object.entries(responses).map(([qid, val]) => ({
          questionId: Number(qid),
          value: val,
        })),
      };

      const res = await fetch(config.saveEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        signOut();
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save survey data");
      }

      router.push(config.onSuccessRedirect);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return {
    status,
    questions,
    responses,
    error,
    handleInputChange,
    handleSubmit,
  };
}
