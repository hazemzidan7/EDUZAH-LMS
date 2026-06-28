"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, BookOpen, User, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import type { UserRole } from "@/lib/types";

interface ResultItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: "course" | "user";
}

export function GlobalSearch({ role }: { role: UserRole }) {
  const router = useRouter();
  const { language } = useLanguage();
  const tr = translations[language];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const timeout = setTimeout(async () => {
      const items: ResultItem[] = [];

      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, category")
        .ilike("title", `%${query}%`)
        .limit(5);

      (courses ?? []).forEach((c) =>
        items.push({
          id: c.id,
          label: c.title,
          sublabel: c.category,
          href: `/courses/${c.id}`,
          icon: "course",
        })
      );

      if (role === "admin") {
        const { data: people } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .ilike("name", `%${query}%`)
          .limit(5);

        (people ?? []).forEach((p) =>
          items.push({
            id: p.id,
            label: p.name,
            sublabel: p.email,
            href:
              p.role === "instructor"
                ? "/admin/instructors"
                : p.role === "student"
                  ? "/admin/students"
                  : "/dashboard",
            icon: "user",
          })
        );
      }

      setResults(items);
      setLoading(false);
      setOpen(true);
    }, 280);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, role]);

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none"
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={tr.search.placeholder}
        className="h-9 w-full rounded-xl border border-border bg-surface-muted/60 py-2 pl-8 pr-8 text-sm text-foreground outline-none ring-primary/20 transition placeholder:text-foreground/35 focus:bg-surface focus:ring-2"
      />
      {query && (
        <button
          onClick={clear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-foreground/35 transition hover:bg-surface-muted hover:text-foreground"
        >
          <X size={12} />
        </button>
      )}

      {/* Results dropdown */}
      {open && (
        <div className="animate-scale-in absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-xl">
          {loading ? (
            <div className="space-y-1 p-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2">
                  <div className="h-8 w-8 animate-skeleton rounded-lg bg-surface-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 animate-skeleton rounded bg-surface-muted" />
                    <div className="h-2.5 w-1/2 animate-skeleton rounded bg-surface-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-foreground/40">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {results.some((r) => r.icon === "course") && (
                <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/30">
                  Courses
                </p>
              )}
              {results
                .filter((r) => r.icon === "course")
                .map((r) => (
                  <ResultRow key={`course-${r.id}`} item={r} onSelect={() => { router.push(r.href); setOpen(false); setQuery(""); }} />
                ))}

              {results.some((r) => r.icon === "user") && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/30">
                  People
                </p>
              )}
              {results
                .filter((r) => r.icon === "user")
                .map((r) => (
                  <ResultRow key={`user-${r.id}`} item={r} onSelect={() => { router.push(r.href); setOpen(false); setQuery(""); }} />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({ item, onSelect }: { item: { label: string; sublabel: string; icon: "course" | "user" }; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface-muted"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {item.icon === "course" ? <BookOpen size={14} /> : <User size={14} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
        <p className="truncate text-xs text-foreground/45">{item.sublabel}</p>
      </div>
    </button>
  );
}
