"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";

export function Logo({ className, height = 32 }: { className?: string; height?: number }) {
  const { language } = useLanguage();
  const [arImgError, setArImgError] = useState(false);

  // logo_AR.PNG is portrait (782×1074). Width-constrain it so both EN+AR lines are readable.
  const arW = Math.round(height * 2.2);
  const arH = Math.round(arW / 0.728);

  return (
    <div
      className={cn("inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 shadow-sm", className)}
    >
      {language === "ar" && !arImgError ? (
        <Image
          src="/logo_AR.PNG"
          alt="إيدوزا"
          width={arW}
          height={arH}
          priority
          className="object-contain"
          style={{ width: arW, height: arH }}
          onError={() => setArImgError(true)}
        />
      ) : language === "ar" ? (
        <span
          style={{ fontSize: height * 0.75, lineHeight: 1 }}
          className="font-bold tracking-tight text-[#2d1b4e]"
        >
          إيدوزا
        </span>
      ) : (
        <Image
          src="/logo.png"
          alt="EDUZAH"
          width={height * 3.4}
          height={height}
          priority
          style={{ height, width: "auto" }}
          className="object-contain"
        />
      )}
    </div>
  );
}
