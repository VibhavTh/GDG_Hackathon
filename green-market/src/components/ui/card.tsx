import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "white";
}

const variantStyles = {
  default: "bg-surface-container-low",
  elevated: "bg-surface-container-highest",
  white: "bg-surface-container-lowest",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-lg p-8 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
