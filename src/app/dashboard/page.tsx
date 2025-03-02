"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SiteSurvey, Survey } from "@/types/models";
import LoadingSpinner from "@/components/LoadingSpinner";
import { pages } from "next/dist/build/templates/app-page";
import {
  Text,
  Box,
  Container,
  Separator,
  Flex,
} from "@radix-ui/themes";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [siteSurvey, setSiteSurvey] = useState<SiteSurvey | null>(null);
  const [surveyDetails, setSurveyDetails] = useState<Survey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait until session is loaded

    if (!session) {
      router.push("/about");
      return;
    }

    fetch("/api/site-survey")
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Full API response:", data);
        const ss: SiteSurvey = data.siteSurvey;
        setSiteSurvey(ss);
        return fetch(`/api/survey/${ss.surveyId}`);
      })
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((survey: Survey) => setSurveyDetails(survey))
      .catch((err) => setError(err.message));
  }, [session, status, router]);

  if (status === "loading" || !siteSurvey || !surveyDetails)
    return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container className="w-full h-screen bg-gray-100 p-8">
      <Flex direction="column" align="center" justify="center" gap="4">
        <Box align="center" justify="center" className="w-full">
          <h1 className="text-4xl text-[var(--primary)] ">DASHBOARD</h1>
          <Separator className="border-t-2 border-black m-10" />
          <Text as="p" className="text-xl font-bold text-blue-900 mt-20">
            Choose a category to fill up.
          </Text>
          <Flex
            direction={{ initial: "column", md: "row" }}
            align="center"
            justify="center"
            className="gap-6 mt-6"
          >
            {siteSurvey.survey.pages.slice(0, 2).map((page) => (
              <Box
                key={page.id}
                align="center"
                width="350px"
                height="200px"
                className="bg-[var(--secondary)] border rounded-lg shadow-sm justify-center items-center text-center"
              >
                <h1 className="text-4xl font-bold text-blue-900 p-6">
                  {page.title}
                </h1>

                <button
                  className="text-white text-lg bg-[var(--primary)] rounded-md hover:bg-green-300 px-5 py-4 my-4"
                  onClick={() =>
                    router.push(
                      `/survey/${siteSurvey.survey.id}/page/${page.id}`,
                    )
                  }
                >
                  COMPLETE
                </button>
              </Box>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
}
