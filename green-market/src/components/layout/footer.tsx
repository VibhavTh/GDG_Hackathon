import Link from "next/link";

interface FooterProps {
  variant?: "storefront" | "admin";
}

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Shipping Info", href: "#" },
  { label: "Contact Us", href: "#" },
];

export function Footer({ variant = "storefront" }: FooterProps) {
  if (variant === "admin") {
    return (
      <footer className="w-full py-12 px-8 mt-20 bg-surface-container text-center flex flex-col items-center justify-center space-y-6">
        <p className="text-md font-headline text-tertiary italic">
          The Green Market Farm
        </p>
        <div className="flex flex-wrap justify-center gap-8">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-xs uppercase tracking-widest text-on-surface-variant/50 hover:text-primary underline-offset-4 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-[10px] font-body uppercase tracking-widest text-on-surface-variant/40">
          &copy; 2024 The Green Market Farm. Cultivated with care.
        </p>
      </footer>
    );
  }

  return (
    <footer className="w-full py-12 px-8 mt-20 bg-surface-container">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <div className="font-headline text-xl font-bold text-tertiary mb-2">
            The Green Market Farm
          </div>
          <p className="font-body text-xs uppercase tracking-widest text-tertiary/50">
            &copy; 2024 The Green Market Farm. Grown with soul.
          </p>
        </div>

        <div className="flex gap-8 font-body text-xs uppercase tracking-widest">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-tertiary/50 hover:text-primary-container underline decoration-secondary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-tertiary hover:bg-secondary-fixed transition-colors"
            aria-label="Social link"
          >
            <span className="material-symbols-outlined text-lg">
              psychiatry
            </span>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-tertiary hover:bg-secondary-fixed transition-colors"
            aria-label="Social link"
          >
            <span className="material-symbols-outlined text-lg">
              local_florist
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
