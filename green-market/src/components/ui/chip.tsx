interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2 rounded-full text-sm font-medium transition-colors
        ${
          active
            ? "bg-primary text-on-primary"
            : "bg-surface-container-highest text-primary hover:bg-surface-container-high"
        }
      `}
    >
      {label}
    </button>
  );
}
