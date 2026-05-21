import { frontendStatusConfig } from "@/lib/frontend-dtos";

export function StatusBadge({ status }: { status: string }) {
  const config = frontendStatusConfig.find((item) => item.status === status);
  return (
    <span className={`badge badge-${status.toLowerCase()}`} style={config ? { color: config.color, background: `${config.color}1A` } : undefined}>
      {config?.label ?? status}
    </span>
  );
}
