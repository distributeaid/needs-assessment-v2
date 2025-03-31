import "./globals.css";
import { Yantramanav } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import "@radix-ui/themes/styles.css";

const yantramanav = Yantramanav({ weight: ["400", "700"] });

export const metadata = {
  title: "Needs Assessment",
  description: "A tool for assessing humanitarian needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={yantramanav.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>{" "}
        {/* Wrap children with Providers */}
      </body>
    </html>
  );
}
