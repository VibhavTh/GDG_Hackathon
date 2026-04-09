import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { markMessageRead, archiveMessage } from "./actions";
import { Icon } from "@/components/ui/icon";

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { data: messages } = await service
    .from("admin_messages")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  const unread = (messages ?? []).filter((m) => !m.is_read).length;
  const contactMessages = (messages ?? []).filter((m) => m.type === "contact");
  const vendorRequests = (messages ?? []).filter((m) => m.type === "vendor_request");

  function relativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <header className="mb-10">
        <h1 className="font-headline italic text-4xl text-tertiary mb-2">Inbox</h1>
        <p className="text-on-surface-variant text-sm">
          {unread > 0 ? `${unread} unread message${unread !== 1 ? "s" : ""}` : "All caught up."}
        </p>
      </header>

      {/* Vendor requests */}
      {vendorRequests.length > 0 && (
        <section className="mb-10">
          <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
            Vendor Applications
          </h2>
          <div className="space-y-3">
            {vendorRequests.map((msg) => (
              <div
                key={msg.id}
                className={`bg-surface-container-low rounded-xl p-6 ${!msg.is_read ? "ring-2 ring-primary/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                      <h3 className="font-bold text-tertiary">{msg.subject}</h3>
                    </div>
                    <p className="text-xs text-on-surface-variant">{msg.from_email} &middot; {relativeTime(msg.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/admin/vendors?highlight=${(msg.metadata as Record<string, string>).farm_id ?? ""}`}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                    >
                      Review
                    </a>
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
                <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{msg.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact messages */}
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
              <div
                key={msg.id}
                className={`bg-surface-container-low rounded-xl p-6 ${!msg.is_read ? "ring-2 ring-primary/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      <h3 className="font-bold text-tertiary">{msg.subject}</h3>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {msg.from_name ? `${msg.from_name} (${msg.from_email})` : msg.from_email} &middot; {relativeTime(msg.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`mailto:${msg.from_email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="px-4 py-2 bg-surface-container text-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-surface-container-highest transition-colors"
                    >
                      Reply
                    </a>
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
                <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{msg.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
