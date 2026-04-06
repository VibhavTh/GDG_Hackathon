import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full bg-surface-container-highest
          border-0 border-b-2 border-outline-variant
          focus:border-primary focus:ring-0
          transition-colors duration-300
          py-3 px-0
          font-body text-on-surface
          placeholder:text-outline
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
