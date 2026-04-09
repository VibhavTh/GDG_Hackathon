"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "@/components/ui/icon";

interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
  className?: string;
}

export function SubmitButton({ label, loadingLabel = "Please wait...", className = "" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? (
        <>
          <Icon name="progress_activity" size="sm" className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
