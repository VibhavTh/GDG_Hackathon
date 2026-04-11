"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { sendReplyEmail } from "@/lib/email";

export async function markMessageRead(id: string) {
  const service = createServiceClient();
  await service
    .from("admin_messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function archiveMessage(id: string) {
  const service = createServiceClient();
  await service
    .from("admin_messages")
    .update({ archived_at: new Date().toISOString(), is_read: true })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function replyToMessage(formData: FormData) {
  const messageId = formData.get("messageId") as string;
  const replyBody = (formData.get("replyBody") as string).trim();
  if (!replyBody) return;

  const service = createServiceClient();
  const { data: msg } = await service
    .from("admin_messages")
    .select("from_email, from_name, subject")
    .eq("id", messageId)
    .single();

  if (!msg) return;

  const { data: site } = await service
    .from("site_settings")
    .select("name")
    .eq("id", 1)
    .single();

  try {
    await sendReplyEmail({
      toEmail: msg.from_email,
      toName: msg.from_name,
      originalSubject: msg.subject,
      replyBody,
      farmName: site?.name ?? "The Green Market Farm",
    });
  } catch (err) {
    console.error("[replyToMessage] email failed:", err);
    return;
  }

  // Mark as read after replying
  await service
    .from("admin_messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", messageId);

  revalidatePath("/dashboard/admin");
}
