import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Apply — EDUZAH Internship & Team",
  description:
    "Apply for an internship or team position at EDUZAH — Egypt's leading EdTech company in Sohag.",
};

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
