"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface Props {
  id: string;
  variant?: "dark" | "light";
}

export function NewsletterForm({ id, variant = "light" }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // No backend yet -- store locally and show confirmation
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={`flex items-center gap-3 py-3 ${variant === "dark" ? "text-on-primary" : "text-primary"}`}>
        <Icon name="check_circle" size="sm" />
        <p className="text-sm font-label font-bold">
          You&rsquo;re on the list! We&rsquo;ll be in touch.
        </p>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label htmlFor={id} className="block text-[11px] font-label font-bold uppercase tracking-widest text-on-primary/60 mb-2">
          Your email
        </label>
        <input
          id={id}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-on-primary/10 border border-on-primary/20 text-on-primary placeholder:text-on-primary/40 px-5 py-3.5 rounded-xl font-body text-sm focus:outline-none focus:border-on-primary/50 focus:-translate-y-px transition-all duration-150"
        />
        <button
          type="submit"
          className="w-full bg-on-primary text-primary px-8 py-3.5 rounded-xl font-label font-bold text-sm uppercase tracking-widest hover:bg-on-primary/90 active:scale-[0.97] transition-all duration-150"
        >
          Subscribe to Field Notes
        </button>
      </form>
    );
  }

  return (
    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
      <label htmlFor={id} className="sr-only">Email address</label>
      <input
        id={id}
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your farm-friendly email"
        className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary focus:outline-none px-4 py-3 w-full sm:w-72 text-sm font-body transition-colors"
      />
      <button
        onClick={handleSubmit}
        type="button"
        className="bg-primary text-on-primary px-8 py-3 rounded-md font-medium text-sm transition-all active:scale-95 hover:bg-primary-container whitespace-nowrap"
      >
        Subscribe
      </button>
    </div>
  );
}
