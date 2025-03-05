import { GET } from "@/app/api/site-survey/route";
import { getServerSession } from "next-auth/next";
import { initializeSiteSurvey } from "@/app/api/site-survey/initialize";

jest.mock("next-auth", () => ({
  default: jest.fn(),
  NextAuth: jest.fn(),
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

jest.mock("@/app/api/site-survey/initialize", () => ({
  initializeSiteSurvey: jest.fn(),
}));

describe("GET /api/site-survey", () => {
  it("should return 401 Unauthorized if there is no session", async () => {
    const response = await GET();
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("should return site survey data for authenticated users", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });

    (initializeSiteSurvey as jest.Mock).mockResolvedValue({
      surveyId: 1,
      siteId: 10,
      status: "initialized",
    });

    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toEqual({
      surveyId: 1,
      siteId: 10,
      status: "initialized",
    });
  });

  it("should return 500 if an error occurs", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });

    (initializeSiteSurvey as jest.Mock).mockRejectedValue(
      new Error("DB Error"),
    );

    const response = await GET();
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json).toEqual({ error: "Failed to retrieve site survey." });
  });
});
