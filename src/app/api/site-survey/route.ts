import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { initializeSiteSurvey } from "./initialize"; // Import the initialization function

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Initialize or fetch the existing SiteSurvey
    const siteSurveyData = await initializeSiteSurvey(session.user.email);
    // log the site survey data
    return NextResponse.json(siteSurveyData);
  } catch (error) {
    console.error("Error in Site Survey API:", error);
    return NextResponse.json(
      { error: "Failed to retrieve site survey." },
      { status: 500 },
    );
  }
}
