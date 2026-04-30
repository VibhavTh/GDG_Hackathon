"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { updateLocationStatus } from "./location-statuses-actions";
import {
  STATUS_OPTIONS,
  type StatusMap,
  type StatusValue,
} from "@/lib/queries/location-statuses-shared";

interface Definition {
  slug: string;
  name: string;
  image: string;
}

interface Props {
  definitions: readonly Definition[];
  statuses: StatusMap;
}

export function LocationStatusList({ definitions, statuses }: Props) {
  return (
    <ul className="space-y-2">
      {definitions.map((def) => (
        <li key={def.slug}>
          <LocationStatusRow definition={def} initial={statuses[def.slug]} />
        </li>
      ))}
    </ul>
  );
}

interface RowProps {
  definition: Definition;
  initial?: { status: StatusValue; note: string | null };
}

function LocationStatusRow({ definition, initial }: RowProps) {
  const [status, setStatus] = useState<StatusValue>(initial?.status ?? "open");
  const [note, setNote] = useState<string>(initial?.note ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(nextStatus: StatusValue, nextNote: string) {
    setError(null);
    const fd = new FormData();
    fd.set("slug", definition.slug);
    fd.set("status", nextStatus);
    fd.set("note", nextNote);

    startTransition(async () => {
      const result = await updateLocationStatus(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
    });
  }

  function handleStatusChange(value: StatusValue) {
    setStatus(value);
    save(value, note);
  }

  function handleNoteBlur() {
    if ((initial?.note ?? "") === note) return;
    save(status, note);
  }

  const tone =
    STATUS_OPTIONS.find((o) => o.value === status)?.tone ?? "closed";
  const justSaved = savedAt && Date.now() - savedAt < 2000;

  return (
    <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-4">
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-container-highest">
        <Image
          src={definition.image}
          alt={definition.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-bold text-tertiary">{definition.name}</p>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-label font-bold uppercase tracking-wider ${
              tone === "open"
                ? "bg-primary text-on-primary"
                : "bg-on-surface/85 text-surface"
            }`}
          >
            <span
              className={`w-1 h-1 rounded-full ${tone === "open" ? "bg-on-primary" : "bg-surface"}`}
            />
            {STATUS_OPTIONS.find((o) => o.value === status)?.label}
          </span>
          {pending && (
            <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/60 inline-flex items-center gap-1">
              <Icon name="progress_activity" size="sm" className="animate-spin" />
              Saving
            </span>
          )}
          {!pending && justSaved && (
            <span className="text-[10px] font-label uppercase tracking-wider text-primary inline-flex items-center gap-1">
              <Icon name="check_circle" size="sm" />
              Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusChange(opt.value)}
                disabled={pending}
                className={`px-3 py-2 rounded-lg text-xs font-label font-bold uppercase tracking-wider transition-colors text-left ${
                  active
                    ? opt.tone === "open"
                      ? "bg-primary text-on-primary"
                      : "bg-on-surface/85 text-surface"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div>
          <label
            htmlFor={`note-${definition.slug}`}
            className="block text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1.5"
          >
            Note <span className="text-on-surface-variant/50 font-normal normal-case">(optional, shown under the card)</span>
          </label>
          <input
            id={`note-${definition.slug}`}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="e.g. Tentatively opening for the season in April."
            className="w-full bg-surface px-3 py-2 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-xs text-error font-body">{error}</p>
        )}
      </div>
    </div>
  );
}
