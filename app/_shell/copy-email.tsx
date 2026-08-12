import { EMAIL } from "@/app/_content/profile";
import { dictionaries } from "@/app/_locale/dictionaries";
import type { Locale } from "@/app/_locale/routes";

/**
 * Copies the email address to the clipboard in one action.
 *
 * Writing to the clipboard has no declarative form — there is no markup that
 * does it — and the alternative is a Reader hand-selecting an address, which is
 * exactly where a character gets dropped and a reply never arrives. So this is
 * the one behaviour on the site that needs a script.
 *
 * It is deliberately **not** a React client component. Next.js hydrates the
 * whole page as soon as one exists, and measuring it showed the cost: ~574 KB
 * of framework runtime, for a button that writes 21 characters to the
 * clipboard. That moved the Czech home page's Lighthouse performance score onto
 * the 95 threshold the suite enforces, on a site whose entire premise is that it
 * ships no JavaScript. The trade is not close.
 *
 * What ships instead is the handler below: a few hundred bytes of inline
 * script, no runtime, no hydration. It is server-rendered markup plus one
 * listener, which is the same shape as the rest of the site.
 *
 * It stays an enhancement, never the route itself. The address is rendered as
 * visible text beside this button and is also a `mailto:` link, both
 * server-rendered, so a Reader whose script never runs still sees the address
 * and can still act on it. This failing takes nothing with it.
 *
 * Three things it gets right for a Reader who is not looking at it:
 *
 * - It is a real `button`, so it is reachable by tab and fires on Enter and
 *   Space with no key handling of its own.
 * - The outcome goes to a live region that is always present in the DOM, rather
 *   than to the button's own label. A region added at the moment it has
 *   something to say is frequently missed by screen readers, and a button that
 *   renames itself to "Copied" leaves a Reader who tabs back to it later reading
 *   a stale claim.
 * - A refused clipboard — an insecure origin, or a browser withholding
 *   permission — says so rather than silently doing nothing, so a Reader knows
 *   to select the address instead.
 */

/** How long the confirmation stays up before the control returns to rest. */
const CONFIRMATION_MS = 2400;

/**
 * The handler, as source. It is inlined into the page rather than imported so
 * it costs one script tag and no request, and it reads its strings from `data-`
 * attributes so the Czech page announces Czech without a second copy of this
 * function existing.
 *
 * Written as a string because it must not be compiled into the React bundle —
 * that is the whole point of the component. It is an IIFE bound to one button
 * by id, and the ids are fixed, so the page may carry exactly one of these:
 * a second would emit duplicate ids, `validate:markup` would fail the build,
 * and the second button would be inert. Contact is the only place the address
 * is offered, so that is a constraint rather than a limitation — but it is the
 * reason to reach for `useId` here rather than another literal, if that changes.
 */
function handlerScript(buttonId: string, statusId: string): string {
  return `(function(){
var b=document.getElementById(${JSON.stringify(buttonId)});
var s=document.getElementById(${JSON.stringify(statusId)});
if(!b||!s)return;
var t;
b.addEventListener("click",function(){
var done=function(m){s.textContent=m;clearTimeout(t);t=setTimeout(function(){s.textContent="";},${CONFIRMATION_MS});};
var ok=b.getAttribute("data-copied"),bad=b.getAttribute("data-failed"),v=b.getAttribute("data-email");
try{navigator.clipboard.writeText(v).then(function(){done(ok);},function(){done(bad);});}catch(e){done(bad);}
});
})();`;
}

export function CopyEmail({ locale }: { locale: Locale }) {
  const strings = dictionaries[locale].contact;
  const buttonId = "copy-email";
  const statusId = "copy-email-status";

  return (
    <>
      <button
        type="button"
        id={buttonId}
        data-email={EMAIL}
        data-copied={strings.copied}
        data-failed={strings.copyFailed}
        // Named for the object rather than the gesture, so it still makes sense
        // read out of context in a list of the page's controls.
        aria-label={strings.copyEmail}
        className="link font-mono text-meta uppercase"
      >
        {strings.copyEmail}
      </button>

      {/* Always in the DOM and empty at rest, so a screen reader is already
          watching it when it has something to announce. `polite` waits for a
          gap rather than cutting across what is being read. */}
      <span
        id={statusId}
        role="status"
        aria-live="polite"
        className="text-small text-muted"
      />

      {/* The injected source is a constant built from two literal ids, so
          nothing from content or from a dictionary is interpolated into it.
          The address and the announcements travel as `data-` attributes
          instead, where React escapes them as ordinary JSX attribute values —
          that escaping is what actually contains them, and it is the reason
          they must not be moved into the template above. */}
      <script dangerouslySetInnerHTML={{ __html: handlerScript(buttonId, statusId) }} />
    </>
  );
}
