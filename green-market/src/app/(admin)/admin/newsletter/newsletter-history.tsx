"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

type Newsletter = {
  id: string;
  subject: string;
  body_html: string | null;
  sent_at: string | null;
  recipient_count: number;
};

function NewsletterRow({ nl, i }: { nl: Newsletter; i: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={i % 2 === 1 ? "bg-surface-container/30" : ""}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-surface-container/50 transition-colors"
      >
        <div>
          <p className="text-sm font-bold text-tertiary">{nl.subject}</p>
          <p className="text-xs text-on-surface-variant">
            {nl.sent_at
              ? new Date(nl.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Draft"}{" "}
            &middot; {nl.recipient_count} recipients
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${nl.sent_at ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-on-surface-variant"}`}>
            {nl.sent_at ? "Sent" : "Draft"}
          </span>
          <Icon name={expanded ? "expand_less" : "expand_more"} size="sm" className="text-on-surface-variant" />
        </div>
      </button>

      {expanded && nl.body_html && (
        <div className="px-6 pb-6">
          <div className="bg-surface-container rounded-xl p-5 text-sm font-body text-on-surface whitespace-pre-wrap leading-relaxed border-l-2 border-primary/20">
            {nl.body_html}
          </div>
        </div>
      )}
    </div>
  );
}

export function NewsletterHistory({ newsletters }: { newsletters: Newsletter[] }) {
  if (newsletters.length === 0) {
    return (
      <div className="py-12 text-center text-on-surface-variant">
        <Icon name="mail" className="text-4xl mb-3" />
        <p className="font-headline italic text-xl text-tertiary mb-1">No newsletters sent yet</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      {newsletters.map((nl, i) => (
        <NewsletterRow key={nl.id} nl={nl} i={i} />
      ))}
    </div>
  );
}
