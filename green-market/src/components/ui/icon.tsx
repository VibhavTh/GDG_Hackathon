interface IconProps {
  name: string;
  fill?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-4xl",
};

export function Icon({
  name,
  fill = false,
  className = "",
  size = "md",
}: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${sizeMap[size]} ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
