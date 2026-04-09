import { createServiceClient } from "@/lib/supabase/server";
import { approveVendor, rejectVendor } from "./actions";
import { Icon } from "@/components/ui/icon";

interface Props {
  searchParams: Promise<{ highlight?: string }>;
}

export default async function AdminVendorsPage({ searchParams }: Props) {
  const { highlight } = await searchParams;
  const service = createServiceClient();

  const { data: pendingFarms } = await service
    .from("farms")
    .select("id, name, location, description, categories, created_at, owner_id")
    .eq("is_approved", false)
    .order("created_at", { ascending: true });

  const { data: approvedFarms } = await service
    .from("farms")
    .select("id, name, location, created_at, owner_id")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get emails for owners
  const ownerIds = [
    ...(pendingFarms ?? []).map((f) => f.owner_id),
    ...(approvedFarms ?? []).map((f) => f.owner_id),
  ];
  const { data: owners } = ownerIds.length > 0
    ? await service.from("users").select("id, email").in("id", ownerIds)
    : { data: [] };

  const ownerMap = new Map((owners ?? []).map((u) => [u.id, u.email]));

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <header className="mb-10">
        <h1 className="font-headline italic text-4xl text-tertiary mb-2">Vendor Applications</h1>
        <p className="text-on-surface-variant text-sm">
          {(pendingFarms ?? []).length} pending &middot; {(approvedFarms ?? []).length} approved (recent 20)
        </p>
      </header>

      {/* Pending */}
      <section className="mb-12">
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Pending Approval
        </h2>
        {(pendingFarms ?? []).length === 0 ? (
          <div className="py-12 text-center bg-surface-container-low rounded-xl">
            <Icon name="check_circle" className="text-4xl text-primary mb-3" />
            <p className="font-headline italic text-xl text-tertiary">All caught up!</p>
            <p className="text-sm text-on-surface-variant mt-1">No pending vendor applications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(pendingFarms ?? []).map((farm) => (
              <div
                key={farm.id}
                id={farm.id}
                className={`bg-surface-container-low rounded-xl p-6 transition-all ${
                  highlight === farm.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-headline text-xl text-tertiary font-bold">{farm.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {ownerMap.get(farm.owner_id) ?? "Unknown"} &middot;{" "}
                      {farm.location ?? "No location"} &middot;{" "}
                      Applied {new Date(farm.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-full shrink-0">
                    Pending
                  </span>
                </div>

                {farm.description && (
                  <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">{farm.description}</p>
                )}

                {farm.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {farm.categories.map((cat: string) => (
                      <span key={cat} className="px-2 py-1 bg-surface-container text-xs text-on-surface-variant rounded-md">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <form action={approveVendor.bind(null, farm.id, ownerMap.get(farm.owner_id) ?? "", farm.name)}>
                    <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary/90 active:scale-[0.97] transition-all">
                      Approve
                    </button>
                  </form>
                  <form action={rejectVendor.bind(null, farm.id, ownerMap.get(farm.owner_id) ?? "", farm.name)}>
                    <button type="submit" className="px-6 py-2.5 bg-surface-container text-error rounded-lg text-sm font-bold hover:bg-error/10 active:scale-[0.97] transition-all">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section>
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-bold mb-4">
          Approved Vendors
        </h2>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          {(approvedFarms ?? []).length === 0 ? (
            <p className="p-8 text-center text-sm text-on-surface-variant italic">No approved vendors yet.</p>
          ) : (
            <div>
              {(approvedFarms ?? []).map((farm, i) => (
                <div
                  key={farm.id}
                  className={`px-6 py-4 flex items-center justify-between ${
                    i % 2 === 1 ? "bg-surface-container/30" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-tertiary">{farm.name}</p>
                    <p className="text-xs text-on-surface-variant">{ownerMap.get(farm.owner_id)}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant/60">
                    {farm.location ?? "No location"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
