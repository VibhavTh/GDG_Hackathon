"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { markMessageRead, archiveMessage, replyToMessage } from "./actions";

type Message = {
  id: string;
  subject: string;
  from_name: string | null;
  from_email: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MessageCard({ msg }: { msg: Message }) {
  const [replying, setReplying] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const fd = new FormData();
    fd.set("messageId", msg.id);
    fd.set("replyBody", body);
    await replyToMessage(fd);
    setSent(true);
    setSending(false);
    setReplying(false);
  }

  return (
    <div className={`bg-surface-container-low rounded-xl p-6 ${!msg.is_read ? "ring-2 ring-primary/20" : ""}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
            <h3 className="font-bold text-tertiary">{msg.subject}</h3>
          </div>
          <p className="text-xs text-on-surface-variant">
            {msg.from_name ? `${msg.from_name} (${msg.from_email})` : msg.from_email}
            {" · "}
            {relativeTime(msg.created_at)}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {sent ? (
            <span className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg">Replied</span>
          ) : (
            <button
              onClick={() => setReplying((r) => !r)}
              className="px-4 py-2 bg-surface-container text-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-surface-container-highest transition-colors"
            >
              {replying ? "Cancel" : "Reply"}
            </button>
          )}
          <form action={markMessageRead.bind(null, msg.id)}>
            <button type="submit" className="p-2 text-on-surface-variant hover:text-tertiary transition-colors" title="Mark read">
              <Icon name="done" size="sm" />
            </button>
          </form>
          <form action={archiveMessage.bind(null, msg.id)}>
            <button type="submit" className="p-2 text-on-surface-variant hover:text-error transition-colors" title="Archive">
              <Icon name="archive" size="sm" />
            </button>
          </form>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant whitespace-pre-wrap mb-4">{msg.body}</p>

      {replying && (
        <form onSubmit={handleReply} className="mt-2 space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={`Reply to ${msg.from_name ?? msg.from_email}...`}
            className="w-full bg-surface-container px-4 py-3 rounded-lg text-sm font-body text-on-surface border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all resize-none"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-2"
            >
              {sending && <Icon name="progress_activity" size="sm" className="animate-spin" />}
              {sending ? "Sending..." : "Send Reply"}
            </button>
            <p className="text-xs text-on-surface-variant">Sends to {msg.from_email}</p>
          </div>
        </form>
      )}
    </div>
  );
}

export function InboxClient({ messages }: { messages: Message[] }) {
  const contactMessages = messages.filter((m) => m.type === undefined || true); // all passed messages
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <header className="mb-10">
        <h1 className="font-headline italic text-4xl text-tertiary mb-2">Inbox</h1>
        <p className="text-on-surface-variant text-sm">
          {unread > 0 ? `${unread} unread message${unread !== 1 ? "s" : ""}` : "All caught up."}
        </p>
      </header>

      <section>
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Customer Messages
        </h2>
        {contactMessages.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <Icon name="inbox" className="text-4xl mb-3" />
            <p className="font-headline italic text-xl text-tertiary mb-1">No messages yet</p>
            <p className="text-sm">Customer contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contactMessages.map((msg) => (
              <MessageCard key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
