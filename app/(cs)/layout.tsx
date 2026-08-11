import { SiteDocument } from "@/app/_shell/document";

/**
 * The Czech tree. The group wraps `cs/`, so every Czech route is prefixed and
 * every one of them gets `<html lang="cs">` without asking for it.
 */
export default function CzechLayout({ children }: LayoutProps<"/">) {
  return <SiteDocument locale="cs">{children}</SiteDocument>;
}
