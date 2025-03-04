import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  context: { params: { surveyId: string } },
) {
  try {
    const params = await context.params;
    const surveyId = parseInt(params.surveyId, 10);
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the user's site ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { siteId: true },
    });

    if (!user || !user.siteId) {
      return NextResponse.json(
        { message: "User site not found" },
        { status: 404 },
      );
    }

    // Fetch the siteSurvey for the user's site and the requested survey
    const siteSurvey = await prisma.siteSurvey.findFirst({
      where: {
        siteId: user.siteId,
        surveyId: surveyId,
      },
      include: {
        sitePages: {
          select: {
            id: true,
            pageId: true,
            progress: true,
          },
        },
      },
    });

    if (!siteSurvey) {
      return NextResponse.json(
        { message: "SiteSurvey not found" },
        { status: 404 },
      );
    }

    // Fetch the survey with pages
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        pages: {
          include: { questions: true },
        },
      },
    });

    if (!survey) {
      return NextResponse.json(
        { message: "Survey not found" },
        { status: 404 },
      );
    }

    // Map sitePages progress to survey pages
    const pagesWithProgress = survey.pages.map((page) => {
      const sitePage = siteSurvey.sitePages.find((sp) => sp.pageId === page.id);
      return {
        id: page.id,
        title: page.title,
        progress: sitePage ? sitePage.progress : "UNSTARTEDREQUIRED", // Default if no progress found
      };
    });

    return NextResponse.json({ ...survey, pages: pagesWithProgress });
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
