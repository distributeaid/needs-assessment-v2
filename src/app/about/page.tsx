"use client";

import PageLayout from "@/components/PageLayout";
import { Box, Text } from "@radix-ui/themes";

export default function AboutPage() {
  return (
    <PageLayout title="About" withSidebar={false}>
      <Box className="max-w-3xl mx-auto text-center space-y-6 bg-white p-8 rounded-lg shadow">
        <Text className="text-lg leading-relaxed text-gray-700">
          The results from this survey will allow{" "}
          <b>
            <a
              href="https://distributeaid.org/"
              className="underline hover:text-blue-700"
            >
              Distribute Aid
            </a>
          </b>{" "}
          to understand your region’s and organisation’s needs over the next six
          months so we can advise collection groups on what to collect, figure
          out which targeted campaigns to run, and decide who to reach out to
          for in-kind donations.
        </Text>

        <Text className="text-lg leading-relaxed text-gray-700">
          If you would like an account, please contact us at{" "}
          <a
            href="mailto:hello@distributeaid.org"
            className="text-blue-500 font-medium hover:underline"
          >
            hello@distributeaid.org
          </a>
          .
        </Text>

        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-blue-600 text-white text-lg font-semibold px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </Box>
    </PageLayout>
  );
}
