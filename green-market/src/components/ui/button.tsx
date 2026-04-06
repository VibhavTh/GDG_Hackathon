import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "solid" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Gradient — reserve for the single hero CTA per page
  primary:
    "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-ambient hover:opacity-90",
  // Solid — for important but secondary actions
  solid:
    "bg-primary text-on-primary hover:bg-primary-container transition-colors",
  secondary:
    "bg-surface-container-highest text-primary hover:bg-surface-variant",
  ghost: "text-secondary hover:text-primary bg-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        font-label font-bold rounded-md
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
