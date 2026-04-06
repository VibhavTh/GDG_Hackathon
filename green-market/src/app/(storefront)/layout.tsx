import { StorefrontNav } from "@/components/layout/storefront-nav";
import { Footer } from "@/components/layout/footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StorefrontNav />
      <main className="pt-20 flex-1">{children}</main>
      <Footer variant="storefront" />
    </>
  );
}
