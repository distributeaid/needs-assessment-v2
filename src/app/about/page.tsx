"use client";

import PageLayout from "@/components/PageLayout";
import { Box, Text, Flex } from "@radix-ui/themes";
import Link from "next/link";
import ActionButton from "@/components/ui/ActionButton";

export default function AboutPage() {
  return (
    <PageLayout title="About" withSidebar={false}>
      <Box className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <Flex direction="column" gap="6" align="center" className="text-center">
          <Text className="text-lg leading-relaxed text-gray-700">
            The results from this survey will allow{" "}
            <b>
              <Link
                href="https://distributeaid.org/"
                className="underline hover:text-blue-700"
              >
                Distribute Aid
              </Link>
            </b>{" "}
            to understand your region’s and organisation’s needs over the next
            six months so we can advise collection groups on what to collect,
            figure out which targeted campaigns to run, and decide who to reach
            out to for in-kind donations.
          </Text>

          <Text className="text-lg leading-relaxed text-gray-700">
            Reach out with any questions to{" "}
            <Link
              href="mailto:hello@distributeaid.org"
              className="text-blue-500 font-medium hover:underline"
            >
              hello@distributeaid.org
            </Link>
            .
          </Text>

          <ActionButton
            label="Get Started"
            onClick={() => {
              window.location.href = "/login";
            }}
          />
        </Flex>
      </Box>
    </PageLayout>
  );
}
