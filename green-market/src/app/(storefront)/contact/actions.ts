"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export async function submitContact(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() || null;
  const email = (formData.get("email") as string).trim();
  const subject = (formData.get("subject") as string).trim();
  const message = (formData.get("message") as string).trim();

  if (!email || !subject || !message) {
    redirect("/contact?error=Please fill in all required fields.");
  }

  const service = createServiceClient();
  const { error } = await service.from("admin_messages").insert({
    type: "contact",
    from_name: name,
    from_email: email,
    subject,
    body: message,
  });

  if (error) {
    redirect("/contact?error=Something went wrong. Please try again.");
  }

  redirect("/contact?sent=1");
}
