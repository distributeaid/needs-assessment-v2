"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SiteAssessment } from "@/types/models";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [siteAssessment, setSiteAssessment] = useState<SiteAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded

    if (!session) {
      router.push("/about");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    // Call the Flask API directly
    fetch(`${API_URL}/api/site-assessment?email=${session.user.email}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Full API response:", data);
        setSiteAssessment(data);
      })
      .catch((err) => setError(err.message));

  }, [session, status, router]);

  if (status === "loading" || !siteAssessment) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Assessment Dashboard
      </h1>
      <ul className="space-y-4">
        {siteAssessment.sitePages.map((page) => (
          <li
            key={page.id}
            className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
          >
            <span className="text-lg font-medium">{page.page.title}</span>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() =>
                router.push(`/assessment/${siteAssessment.assessment.id}/page/${page.id}`)
              }
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
