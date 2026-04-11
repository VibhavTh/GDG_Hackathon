"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

interface Props {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}

export function PasswordInput({ id, name, placeholder, autoComplete, required, minLength, className }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`pr-11 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <Icon name={visible ? "visibility_off" : "visibility"} size="sm" />
      </button>
    </div>
  );
}
