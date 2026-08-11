import type { Metadata } from "next";
import { pageMetadata } from "@/app/_locale/metadata";
import { HomeView } from "@/app/_views/home";

export const metadata: Metadata = pageMetadata("cs", "home");

export default function Page() {
  return <HomeView locale="cs" />;
}
