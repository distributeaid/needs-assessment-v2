// File: src/app/api/site-survey/initialize.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function initializeSiteSurvey(email: string) {
  // Fetch the user and related site data
  const user = await prisma.user.findUnique({
    where: { email: email },
    include: {
      site: {
        include: {
          siteSurveys: {
            include: {
              survey: {
                include: {
                  pages: {
                    include: {
                      questions: true,
                    },
                  },
                },
              },
              sitePages: {
                include: {
                  responses: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.site) {
    return NextResponse.json(
      { error: "Site not found for user" },
      { status: 404 },
    );
  }

  let siteSurvey = user.site.siteSurveys[0];

  // If no SiteSurvey exists, initialize it
  if (!siteSurvey) {
    const latestSurvey = await prisma.survey.findFirst({
      orderBy: [{ year: "desc" }, { season: "desc" }],
      include: { pages: { include: { questions: true } } },
    });

    if (!latestSurvey) {
      return NextResponse.json(
        { error: "No surveys found to initialize" },
        { status: 404 },
      );
    }

    siteSurvey = await prisma.siteSurvey.create({
      data: {
        siteId: user.site.id,
        surveyId: latestSurvey.id,
        sitePages: {
          create: latestSurvey.pages.map((page) => ({
            pageId: page.id,
            responses: {
              create: page.questions.map((question) => ({
                questionId: question.id,
                value: question.defaultValue || "",
              })),
            },
          })),
        },
      },
      include: {
        survey: { include: { pages: { include: { questions: true } } } },
        sitePages: { include: { responses: true } },
      },
    });
  }
  // Initialize and add a new sitePage for every page in the survey
  // with default responses for each question
  // if no siteSurvey exists
  for (const page of siteSurvey.survey.pages) {
    const existingSitePage = siteSurvey.sitePages.find(
      (sitePage) => sitePage.pageId === page.id,
    );

    if (!existingSitePage) {
      await prisma.sitePage.create({
        data: {
          siteSurveyId: siteSurvey.id,
          pageId: page.id,
          progress:
            page.title === "Basic Info" ? "UNSTARTEDREQUIRED" : "LOCKED",
          responses: {
            create: page.questions.map((question) => ({
              questionId: question.id,
              value: question.defaultValue || "",
            })),
          },
        },
        include: { responses: true },
      });
    }
  }

  // Return the site, siteSurvey, and all related data
  return {
    siteId: user.site.id,
    site: user.site,
    siteSurvey: siteSurvey,
  };
}
