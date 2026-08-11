import type { Metadata } from "next";
import { pageMetadata } from "@/app/_locale/metadata";
import { CaseStudyView } from "@/app/_views/case-study";

export const metadata: Metadata = pageMetadata("en", "caseStudy");

export default function Page() {
  return <CaseStudyView locale="en" />;
}
