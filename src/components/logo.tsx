"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

export function Logo({ className, height = 32 }: { className?: string; height?: number }) {
  const { language } = useLanguage();

  return (
    <div
      className={cn("inline-flex items-center rounded-xl bg-white px-2 py-1 shadow-sm", className)}
      style={{ height: height + 8 }}
    >
      {language === "ar" ? (
        <Image
          src="/logo-ar.png"
          alt="إيدوزا"
          width={height * 3.4}
          height={height}
          priority
          className="h-full w-auto object-contain"
        />
      ) : (
        <Image
          src="/logo.png"
          alt="EDUZAH"
          width={height * 3.4}
          height={height}
          priority
          className="h-full w-auto object-contain"
        />
      )}
    </div>
  );
}
