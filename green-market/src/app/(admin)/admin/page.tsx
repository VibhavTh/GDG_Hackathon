import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { InboxClient } from "./inbox-client";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { data: messages } = await service
    .from("admin_messages")
    .select("*")
    .is("archived_at", null)
    .eq("type", "contact")
    .order("created_at", { ascending: false });

  return <InboxClient messages={messages ?? []} />;
}
