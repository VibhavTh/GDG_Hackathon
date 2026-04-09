"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { sendVendorApprovalEmail } from "@/lib/email";

export async function approveVendor(farmId: string, vendorEmail: string, shopName: string, _formData?: FormData) {
  const service = createServiceClient();

  await service.from("farms").update({ is_approved: true }).eq("id", farmId);

  // Archive the inbox request
  await service
    .from("admin_messages")
    .update({ archived_at: new Date().toISOString(), is_read: true })
    .eq("type", "vendor_request")
    .contains("metadata", { farm_id: farmId });

  if (vendorEmail) {
    await sendVendorApprovalEmail({ vendorEmail, shopName, approved: true }).catch(console.error);
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
}

export async function rejectVendor(
  farmId: string,
  vendorEmail: string,
  shopName: string,
  _formData?: FormData
) {
  const reason = undefined;
  const service = createServiceClient();

  // Delete the farm row so they could re-apply
  await service.from("farms").delete().eq("id", farmId);

  // Archive inbox request
  await service
    .from("admin_messages")
    .update({ archived_at: new Date().toISOString(), is_read: true })
    .eq("type", "vendor_request")
    .contains("metadata", { farm_id: farmId });

  if (vendorEmail) {
    await sendVendorApprovalEmail({ vendorEmail, shopName, approved: false, reason }).catch(
      console.error
    );
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin");
}
