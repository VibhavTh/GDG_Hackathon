import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-4xl font-headline italic text-tertiary">
          Farm Settings
        </h1>
        <p className="text-on-surface-variant mt-2">
          Manage your farm profile and account preferences.
        </p>
      </header>

      <form className="space-y-10">
        {/* Farm Profile */}
        <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
          <h2 className="font-headline text-2xl text-tertiary mb-4">
            Farm Profile
          </h2>
          <Input label="Farm Name" placeholder="The Green Market Farm" />
          <Input label="Email" type="email" placeholder="farmer@greenmarket.farm" />
          <Input label="Phone" type="tel" placeholder="(555) 012-3456" />
          <div className="space-y-1.5">
            <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Farm Description
            </label>
            <textarea
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-colors py-3 text-on-surface resize-none"
              placeholder="Tell customers about your farm..."
              rows={4}
            />
          </div>
        </section>

        {/* Security */}
        <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
          <h2 className="font-headline text-2xl text-tertiary mb-4">
            Security
          </h2>
          <div className="flex items-start gap-4 bg-surface-container-highest p-4 rounded-lg">
            <Icon name="verified_user" className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Two-Factor Authentication</p>
              <p className="text-xs text-on-surface-variant mt-1">
                2FA is required for all farm owner accounts. Manage your
                authentication methods below.
              </p>
              <button className="mt-3 text-xs font-bold text-secondary hover:underline">
                Manage 2FA Settings
              </button>
            </div>
          </div>
          <Button variant="secondary" className="w-full">
            Sign Out Everywhere
          </Button>
        </section>

        <Button className="w-full py-4 rounded-xl text-sm">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
