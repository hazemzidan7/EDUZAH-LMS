import type { LucideIcon } from "lucide-react";

export function HeroBanner({
  title,
  subtitle,
  icon: Icon,
  badge,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
}) {
  return (
    <div className="brand-gradient animate-fade-in-up relative overflow-hidden rounded-2xl p-6 text-white shadow-lg shadow-accent/15 sm:p-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-72 -translate-x-1/2 rounded-full bg-black/10 blur-2xl" />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur-sm">
            <Icon size={22} />
          </div>
          <div>
            {badge && (
              <div className="mb-1 inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {badge}
              </div>
            )}
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            <p className="mt-0.5 text-sm text-white/70">{subtitle}</p>
          </div>
        </div>
        {/* Right decoration */}
        <div className="hidden sm:flex items-center gap-2 opacity-40">
          <div className="h-8 w-8 rounded-full bg-white/30" />
          <div className="h-5 w-5 rounded-full bg-white/20" />
          <div className="h-3 w-3 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  );
}
