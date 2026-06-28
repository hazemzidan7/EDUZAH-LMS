"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { GlobalSearch } from "@/components/global-search";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { useDashboard } from "@/lib/dashboard-context";
import { useLanguage } from "@/lib/language-context";

interface TopbarProps {
  title: string;
  subtitle?: string;
  titleAr?: string;
  subtitleAr?: string;
  action?: React.ReactNode;
}

export function Topbar({ title, subtitle, titleAr, subtitleAr, action }: TopbarProps) {
  const { profile, notifications } = useDashboard();
  const { language } = useLanguage();

  const displayTitle = language === "ar" && titleAr ? titleAr : title;
  const displaySubtitle = language === "ar" && subtitleAr ? subtitleAr : subtitle;

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3.5 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{displayTitle}</h1>
          </div>
          {displaySubtitle && (
            <p className="mt-0.5 truncate text-xs text-foreground/45">{displaySubtitle}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <GlobalSearch role={profile.role} />
          </div>
          <LanguageToggle />
          <ThemeToggle />
          <NotificationBell notifications={notifications} />
          <UserMenu profile={profile} />
          {action}
        </div>
      </div>

      {/* Mobile search */}
      <div className="mt-3 sm:hidden">
        <GlobalSearch role={profile.role} />
      </div>
    </div>
  );
}
