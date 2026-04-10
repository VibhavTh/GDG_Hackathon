"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendNewsletterEmail } from "@/lib/email";

async function requireFarmOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServiceClient();
  const { data: profile } = await service.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "farmer" && profile?.role !== "admin") return null;
  return { user, service };
}

export async function sendNewsletter(formData: FormData) {
  const auth = await requireFarmOwner();
  if (!auth) return;
  const { user, service } = auth;

  const subject = (formData.get("subject") as string).trim();
  const body = (formData.get("body") as string).trim();
  if (!subject || !body) return;

  // Fetch active subscribers
  const { data: subscribers } = await service
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null);

  const emails = (subscribers ?? []).map((s) => s.email);

  // Save the newsletter record first
  const { data: record } = await service
    .from("newsletters")
    .insert({
      subject,
      body_html: body,
      created_by: user.id,
      recipient_count: emails.length,
    })
    .select("id")
    .single();

  if (emails.length > 0) {
    await sendNewsletterEmail({ to: emails, subject, bodyHtml: body });
  }

  if (record) {
    await service
      .from("newsletters")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", record.id);
  }

  revalidatePath("/admin/newsletter");
}
