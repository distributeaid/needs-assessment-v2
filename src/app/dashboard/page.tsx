"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SiteAssessment } from "@/types/models";
import {
  Text,
  Box,
  Container,
  Separator,
  Flex,
} from "@radix-ui/themes";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [siteAssessment, setSiteAssessment] = useState<SiteAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "", []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user.accessToken) {
      router.push("/about");
      return;
    }

    fetch(`${API_URL}/api/site-assessment`, {
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Full API response:", data);
        setSiteAssessment(data);
      })
      .catch((err) => setError(err.message));
  }, [session, status, router, API_URL]);

  if (status === "loading" || !siteAssessment) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container className="w-full h-screen bg-gray-100 p-8">
      <Flex direction="column" align="center" justify="center" gap="4">
        <Box className="w-full flex justify-center items-center">
          <h1 className="text-4xl text-[var(--primary)] ">DASHBOARD</h1>
          <Separator className="border-t-2 border-black m-10" />
          <Text as="p" className="text-xl font-bold text-blue-900 mt-20">
            Select a category to begin your assessment.
          </Text>
          <Flex
            direction={{ initial: "column", md: "row" }}
            className="gap-6 mt-6 flex justify-center items-center"
            justify="center"
          >
            {siteAssessment.sitePages.map((page) => (
              <Box
                key={page.id}
                className="flex justify-center items-center bg-[var(--secondary)] border rounded-lg shadow-sm justify-centertext-center"
                width="350px"
                height="200px"
              >
                <h1 className="text-4xl font-bold text-blue-900 p-6">
                  {page.page.title}
                </h1>

                <button
                  className="text-white text-lg bg-[var(--primary)] rounded-md hover:bg-green-300 px-5 py-4 my-4"
                  onClick={() =>
                    router.push(
                      `/assessment/${page.siteAssessmentId}/page/${page.id}`
                    )
                  }
                >
                  View
                </button>
              </Box>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}
