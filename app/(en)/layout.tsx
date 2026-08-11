import { SiteDocument } from "@/app/_shell/document";

/**
 * The English tree, which serves from the root itself (ADR 0003) — the group
 * contributes no path segment, so `app/(en)/page.tsx` is `/`.
 *
 * Its only job is to declare the document's language. Everything else it shares
 * with the Czech tree through `SiteDocument`.
 */
export default function EnglishLayout({ children }: LayoutProps<"/">) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
