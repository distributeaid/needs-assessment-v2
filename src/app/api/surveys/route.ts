import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to determine the most recent survey
function getMostRecentSurvey(surveys: { year: number; season: string }[]) {
  const seasonOrder = ["Winter", "Spring", "Summer", "Fall"];

  return surveys.reduce((latest, current) => {
    if (
      current.year > latest.year ||
      (current.year === latest.year &&
        seasonOrder.indexOf(current.season) >
          seasonOrder.indexOf(latest.season))
    ) {
      return current;
    }
    return latest;
  }, surveys[0]);
}

// API Route
export async function GET() {
  try {
    // Fetch all surveys from the database
    const surveys = await prisma.survey.findMany({
      include: {
        pages: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!surveys || surveys.length === 0) {
      return NextResponse.json({ error: "No surveys found" }, { status: 404 });
    }

    // Get the most recent survey
    const latestSurvey = getMostRecentSurvey(surveys);

    return NextResponse.json([latestSurvey]); // Return as an array for consistency
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
