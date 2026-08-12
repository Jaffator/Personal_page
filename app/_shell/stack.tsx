import { stackGroups } from "@/app/_content/profile";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";
import { SectionHeading } from "./section-heading";

/**
 * What the author builds with, as an honest grouped list.
 *
 * There is no proficiency indicator here, and there is nowhere to put one: no
 * bar, no star rating, no percentage, no year count. A technical Reader treats
 * "React 85%" as a red flag because the claim cannot be true — 85% of what,
 * measured by whom — and the whole section is worth less than the one entry
 * that provokes the question. So the list says what he works with and lets the
 * Case Study speak to how well. `tests/home-sections.spec.ts` asserts the
 * absence three ways, because a rating can be drawn as text, as a widget or as
 * a bar.
 *
 * Grouped rather than flat, because a Reader matching against an open role
 * scans for a category before a name. Each group is its own list with its own
 * heading, so a screen-reader Reader is told how many entries are in each
 * before hearing them, rather than meeting one list of thirty.
 *
 * A labelled `section` is a landmark, so the Stack can be jumped to directly.
 */

const HEADING_ID = "stack";

export function Stack({ locale }: { locale: Locale }) {
  const strings = dictionaries[locale].stack;

  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeading id={HEADING_ID} index={strings.index}>
        {strings.heading}
      </SectionHeading>

      {/* Two columns from the small breakpoint up. The groups are short, and a
          single column leaves a Reader scrolling past whitespace to reach
          About. */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {stackGroups.map((group) => {
          const groupId = `stack-${group.key}`;

          return (
            <div key={group.key}>
              {/* The group's name in the monospace register the design system
                  reserves for metadata, and a real heading rather than a styled
                  paragraph — it is what makes the group navigable. */}
              <h3 id={groupId} className="font-mono text-meta text-muted uppercase">
                {group.name[locale]}
              </h3>

              <ul aria-labelledby={groupId} className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {group.items.map((item) => (
                  <li key={item} className="text-body text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
