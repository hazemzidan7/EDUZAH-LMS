"use client";

import { useState } from "react";
import { Dialog, Input, Select, Button } from "@/components/ui";
import { addMaterial, uploadMaterialFile } from "@/lib/actions/sessions";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { Loader2 } from "lucide-react";
import type { MaterialType } from "@/lib/types";

const TYPE_OPTIONS: { value: MaterialType; label: string; labelAr: string }[] = [
  { value: "pdf",   label: "PDF",            labelAr: "PDF" },
  { value: "ppt",   label: "Presentation",   labelAr: "عرض تقديمي" },
  { value: "doc",   label: "Document",       labelAr: "مستند" },
  { value: "zip",   label: "ZIP Archive",    labelAr: "ملف ZIP" },
  { value: "video", label: "Video",          labelAr: "فيديو" },
  { value: "link",  label: "External Link",  labelAr: "رابط خارجي" },
];

export function AddMaterialDialog({
  open,
  onOpenChange,
  courseId,
  sessionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  sessionId: string;
}) {
  const [type, setType] = useState<MaterialType>("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const tr = translations[language].materials;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const title = formData.get("title") as string;

    try {
      if (type === "link") {
        const url = formData.get("url") as string;
        await addMaterial(courseId, sessionId, { title, type, url });
      } else {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) {
          setError(tr.chooseFile);
          setLoading(false);
          return;
        }

        const uploadData = new FormData();
        uploadData.set("file", file);
        const result = await uploadMaterialFile(uploadData);

        if ("error" in result) {
          setError(`${tr.uploadFailed}: ${result.error}`);
          setLoading(false);
          return;
        }

        await addMaterial(courseId, sessionId, { title, type, url: result.url, size_bytes: file.size });
      }

      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={tr.addTitle} description={tr.addDesc}>
      <form action={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{tr.fieldTitle}</label>
          <Input name="title" required placeholder={tr.titlePlaceholder} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{tr.fieldType}</label>
          <Select value={type} onChange={(e) => setType(e.target.value as MaterialType)}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {language === "ar" ? o.labelAr : o.label}
              </option>
            ))}
          </Select>
        </div>
        {type === "link" ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tr.fieldUrl}</label>
            <Input name="url" required placeholder="https://..." />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tr.fieldFile}</label>
            <input
              name="file"
              type="file"
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground"
            />
          </div>
        )}
        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {tr.add}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
