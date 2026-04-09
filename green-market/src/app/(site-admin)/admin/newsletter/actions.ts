"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendNewsletterEmail } from "@/lib/email";

export async function sendNewsletter(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const subject = (formData.get("subject") as string).trim();
  const body = (formData.get("body") as string).trim();
  if (!subject || !body) return;

  const service = createServiceClient();

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
