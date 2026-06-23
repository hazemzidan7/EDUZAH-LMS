"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { uploadCv, submitApplication } from "@/lib/actions/applications";
import type { ApplicationData } from "@/lib/actions/applications";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 9;
const STORAGE_KEY = "eduzah-application-draft-v2";

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira",
  "Faiyum", "Gharbia", "Ismailia", "Menofia", "Minya", "Qalyubia",
  "New Valley", "North Sinai", "Port Said", "Sharqia", "South Sinai",
  "Suez", "Luxor", "Aswan", "Asyut", "Beni Suef", "Matruh", "Qena",
  "Kafr El Sheikh", "Damietta", "Sohag",
];

const STEP_NAMES = [
  "Personal Info",
  "Education",
  "Position",
  "Skills",
  "Experience",
  "Portfolio & CV",
  "Availability",
  "Questions",
  "Agreement",
];

type PositionType = "technical_internship" | "non_technical_internship" | "paid";

interface PositionDef {
  name: string;
  type: PositionType;
  icon: string;
}

const POSITIONS: PositionDef[] = [
  // Technical Internships
  { name: "AI Internship", type: "technical_internship", icon: "🤖" },
  { name: "Data Analysis Internship", type: "technical_internship", icon: "📊" },
  { name: "Front-End Development Internship", type: "technical_internship", icon: "💻" },
  { name: "Flutter Development Internship", type: "technical_internship", icon: "📱" },
  { name: "UI/UX Design Internship", type: "technical_internship", icon: "🎨" },
  // Non-Technical Internships
  { name: "Project Management Internship", type: "non_technical_internship", icon: "📋" },
  { name: "Graphic Design Internship", type: "non_technical_internship", icon: "🖌️" },
  { name: "Photography Internship", type: "non_technical_internship", icon: "📸" },
  { name: "HR Internship", type: "non_technical_internship", icon: "🤝" },
  // Paid
  { name: "Marketing Specialist", type: "paid", icon: "📣" },
  { name: "Reels Maker", type: "paid", icon: "🎬" },
  { name: "Sales Specialist", type: "paid", icon: "💰" },
];

type SkillFieldType = "rating" | "text" | "url" | "textarea";

interface SkillField {
  key: string;
  label: string;
  type: SkillFieldType;
}

const SKILLS_CONFIG: Record<string, SkillField[]> = {
  "AI Internship": [
    { key: "ai_tools", label: "AI Tools Experience", type: "rating" },
    { key: "chatgpt", label: "ChatGPT Experience", type: "rating" },
    { key: "prompt_eng", label: "Prompt Engineering", type: "rating" },
    { key: "machine_learning", label: "Machine Learning", type: "rating" },
    { key: "python", label: "Python", type: "rating" },
    { key: "ai_projects", label: "AI Projects (describe briefly)", type: "textarea" },
    { key: "github", label: "GitHub Profile Link", type: "url" },
  ],
  "Data Analysis Internship": [
    { key: "excel", label: "Excel", type: "rating" },
    { key: "power_bi", label: "Power BI", type: "rating" },
    { key: "sql", label: "SQL", type: "rating" },
    { key: "python", label: "Python", type: "rating" },
    { key: "dashboards", label: "Dashboard Projects (describe briefly)", type: "textarea" },
    { key: "github", label: "GitHub Profile Link", type: "url" },
  ],
  "Front-End Development Internship": [
    { key: "html", label: "HTML", type: "rating" },
    { key: "css", label: "CSS", type: "rating" },
    { key: "javascript", label: "JavaScript", type: "rating" },
    { key: "bootstrap", label: "Bootstrap", type: "rating" },
    { key: "react", label: "React", type: "rating" },
    { key: "angular", label: "Angular", type: "rating" },
    { key: "portfolio", label: "Portfolio Link", type: "url" },
    { key: "github", label: "GitHub Profile Link", type: "url" },
  ],
  "Flutter Development Internship": [
    { key: "dart", label: "Dart", type: "rating" },
    { key: "flutter", label: "Flutter", type: "rating" },
    { key: "firebase", label: "Firebase", type: "rating" },
    { key: "published_apps", label: "Published Applications (App Store / Play Store links)", type: "textarea" },
    { key: "github", label: "GitHub Profile Link", type: "url" },
  ],
  "UI/UX Design Internship": [
    { key: "figma", label: "Figma", type: "rating" },
    { key: "adobe_xd", label: "Adobe XD", type: "rating" },
    { key: "user_research", label: "User Research", type: "rating" },
    { key: "wireframing", label: "Wireframing", type: "rating" },
    { key: "portfolio", label: "Portfolio Link", type: "url" },
  ],
  "Project Management Internship": [
    { key: "pm_experience", label: "Project Management Experience", type: "rating" },
    { key: "leadership", label: "Leadership Experience", type: "rating" },
    { key: "agile", label: "Agile Knowledge", type: "rating" },
    { key: "scrum", label: "Scrum Knowledge", type: "rating" },
    { key: "team_coordination", label: "Team Coordination Experience", type: "rating" },
  ],
  "Graphic Design Internship": [
    { key: "photoshop", label: "Photoshop", type: "rating" },
    { key: "illustrator", label: "Illustrator", type: "rating" },
    { key: "canva", label: "Canva", type: "rating" },
    { key: "behance", label: "Behance Profile Link", type: "url" },
    { key: "portfolio", label: "Portfolio Link", type: "url" },
  ],
  "Photography Internship": [
    { key: "photography_exp", label: "Photography Experience", type: "rating" },
    { key: "camera_type", label: "Camera / Equipment Used", type: "text" },
    { key: "editing_software", label: "Editing Software", type: "text" },
    { key: "portfolio", label: "Portfolio / Instagram Link", type: "url" },
  ],
  "HR Internship": [
    { key: "recruitment", label: "Recruitment Experience", type: "rating" },
    { key: "communication", label: "Communication Skills", type: "rating" },
    { key: "hr_knowledge", label: "HR Knowledge", type: "rating" },
    { key: "interview_exp", label: "Interview Experience", type: "rating" },
  ],
  "Marketing Specialist": [
    { key: "social_media", label: "Social Media Marketing", type: "rating" },
    { key: "content_creation", label: "Content Creation", type: "rating" },
    { key: "paid_ads", label: "Paid Ads Experience", type: "rating" },
    { key: "marketing_campaigns", label: "Marketing Campaigns (describe briefly)", type: "textarea" },
    { key: "portfolio", label: "Portfolio / Work Samples Link", type: "url" },
  ],
  "Reels Maker": [
    { key: "video_exp", label: "Short-Form Video Experience", type: "rating" },
    { key: "camera_equipment", label: "Camera / Equipment Used", type: "text" },
    { key: "editing_tools", label: "Editing Tools (CapCut, Premiere, etc.)", type: "text" },
    { key: "platforms", label: "Platforms (Instagram, TikTok, etc.)", type: "text" },
    { key: "portfolio", label: "Portfolio / Reel Link", type: "url" },
  ],
  "Sales Specialist": [
    { key: "sales_exp", label: "Sales Experience", type: "rating" },
    { key: "communication", label: "Communication Skills", type: "rating" },
    { key: "negotiation", label: "Negotiation Skills", type: "rating" },
    { key: "crm", label: "CRM Experience", type: "rating" },
  ],
};

const RATING_OPTIONS = ["None", "Beginner", "Intermediate", "Advanced"];

// ─── Form State ───────────────────────────────────────────────────────────────

interface Experience {
  id: string;
  organizationName: string;
  position: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface FormState {
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  governorate: string;
  city: string;
  currentAddress: string;
  facebookLink: string;
  linkedinLink: string;
  university: string;
  faculty: string;
  department: string;
  academicStatus: string;
  graduationYear: string;
  gpa: string;
  academicAchievements: string;
  position: string;
  positionType: string;
  skills: Record<string, string>;
  hasExperience: string;
  experiences: Experience[];
  cvUrl: string;
  cvFilename: string;
  portfolioLink: string;
  githubLink: string;
  behanceLink: string;
  personalWebsite: string;
  hoursPerWeek: string;
  preferredDays: string[];
  canAttendOffline: string;
  canAttendOnline: string;
  whyJoin: string;
  skillsToGain: string;
  valueAdded: string;
  oneYearVision: string;
  confirmAccurate: boolean;
  confirmUnpaid: boolean;
  agreePolicy: boolean;
  agreeContact: boolean;
}

const INITIAL: FormState = {
  fullName: "", mobile: "", whatsapp: "", email: "", dateOfBirth: "", gender: "",
  governorate: "", city: "", currentAddress: "", facebookLink: "", linkedinLink: "",
  university: "", faculty: "", department: "", academicStatus: "", graduationYear: "", gpa: "", academicAchievements: "",
  position: "", positionType: "",
  skills: {},
  hasExperience: "", experiences: [],
  cvUrl: "", cvFilename: "", portfolioLink: "", githubLink: "", behanceLink: "", personalWebsite: "",
  hoursPerWeek: "", preferredDays: [], canAttendOffline: "", canAttendOnline: "",
  whyJoin: "", skillsToGain: "", valueAdded: "", oneYearVision: "",
  confirmAccurate: false, confirmUnpaid: false, agreePolicy: false, agreeContact: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = "text", className = "",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/40 focus:border-[#6C3BFF] transition text-sm ${className}`}
    />
  );
}

function Select({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/40 focus:border-[#6C3BFF] transition text-sm"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Textarea({
  value, onChange, placeholder, rows = 4,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C3BFF]/40 focus:border-[#6C3BFF] transition text-sm resize-none"
    />
  );
}

function RatingSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {RATING_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            value === opt
              ? "text-white border-transparent"
              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#6C3BFF]/40"
          }`}
          style={value === opt ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)", borderColor: "transparent" } : {}}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ApplyForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
        setHasDraft(true);
      }
    } catch {}
  }, []);

  // Auto-save draft (omit File object)
  useEffect(() => {
    try {
      const { confirmAccurate, confirmUnpaid, agreePolicy, agreeContact, ...saveData } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch {}
  }, [data]);

  const update = useCallback((field: keyof FormState, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── Validation ────────────────────────────────────────────────────────────

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};

    if (s === 1) {
      if (!data.fullName.trim()) e.fullName = "Full name is required";
      if (!data.mobile.trim()) e.mobile = "Mobile number is required";
      if (!data.whatsapp.trim()) e.whatsapp = "WhatsApp number is required";
      if (!data.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = "Invalid email address";
      if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required";
      if (!data.governorate) e.governorate = "Governorate is required";
      if (!data.city.trim()) e.city = "City is required";
    }
    if (s === 2) {
      if (!data.university.trim()) e.university = "University / Institute is required";
      if (!data.faculty.trim()) e.faculty = "Faculty is required";
      if (!data.department.trim()) e.department = "Department / Major is required";
      if (!data.academicStatus) e.academicStatus = "Academic status is required";
      if (!data.graduationYear) e.graduationYear = "Expected graduation year is required";
    }
    if (s === 3) {
      if (!data.position) e.position = "Please select a position";
    }
    if (s === 5) {
      if (!data.hasExperience) e.hasExperience = "Please answer this question";
    }
    if (s === 6) {
      if (!data.cvUrl) e.cvUrl = "CV upload is required";
    }
    if (s === 7) {
      if (!data.hoursPerWeek) e.hoursPerWeek = "Please select available hours";
      if (data.preferredDays.length === 0) e.preferredDays = "Select at least one preferred day";
    }
    if (s === 8) {
      if (!data.whyJoin.trim()) e.whyJoin = "This field is required";
      if (!data.skillsToGain.trim()) e.skillsToGain = "This field is required";
      if (!data.valueAdded.trim()) e.valueAdded = "This field is required";
      if (!data.oneYearVision.trim()) e.oneYearVision = "This field is required";
    }
    if (s === 9) {
      if (!data.confirmAccurate) e.confirmAccurate = "Required";
      if (!data.confirmUnpaid) e.confirmUnpaid = "Required";
      if (!data.agreePolicy) e.agreePolicy = "Required";
      if (!data.agreeContact) e.agreeContact = "Required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    scrollTop();
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 1));
    scrollTop();
  };

  // ─── CV Upload ──────────────────────────────────────────────────────────────

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, cvUrl: "Only PDF files allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cvUrl: "File must be under 5 MB" }));
      return;
    }
    setCvFile(file);
    setCvUploading(true);
    setErrors((prev) => ({ ...prev, cvUrl: "" }));

    const fd = new FormData();
    fd.append("cv", file);
    const result = await uploadCv(fd);
    setCvUploading(false);

    if ("error" in result) {
      setErrors((prev) => ({ ...prev, cvUrl: result.error }));
    } else {
      update("cvUrl", result.url);
      update("cvFilename", result.filename);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const submit = async () => {
    if (!validate(TOTAL_STEPS)) return;
    setIsSubmitting(true);
    setSubmitError("");

    const payload: ApplicationData = {
      fullName: data.fullName,
      mobile: data.mobile,
      whatsapp: data.whatsapp,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      governorate: data.governorate,
      city: data.city,
      currentAddress: data.currentAddress,
      facebookLink: data.facebookLink,
      linkedinLink: data.linkedinLink,
      university: data.university,
      faculty: data.faculty,
      department: data.department,
      academicStatus: data.academicStatus,
      graduationYear: data.graduationYear,
      gpa: data.gpa,
      academicAchievements: data.academicAchievements,
      position: data.position,
      positionType: data.positionType,
      skills: data.skills,
      hasExperience: data.hasExperience === "yes",
      experiences: data.experiences,
      cvUrl: data.cvUrl,
      cvFilename: data.cvFilename,
      portfolioLink: data.portfolioLink,
      githubLink: data.githubLink,
      behanceLink: data.behanceLink,
      personalWebsite: data.personalWebsite,
      hoursPerWeek: data.hoursPerWeek,
      preferredDays: data.preferredDays,
      canAttendOffline: data.canAttendOffline === "yes" ? true : data.canAttendOffline === "no" ? false : null,
      canAttendOnline: data.canAttendOnline === "yes" ? true : data.canAttendOnline === "no" ? false : null,
      whyJoin: data.whyJoin,
      skillsToGain: data.skillsToGain,
      valueAdded: data.valueAdded,
      oneYearVision: data.oneYearVision,
    };

    const result = await submitApplication(payload);
    setIsSubmitting(false);

    if ("error" in result) {
      setSubmitError(result.error);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      router.push("/apply/success");
    }
  };

  // ─── Experience helpers ───────────────────────────────────────────────────────

  const addExperience = () => {
    update("experiences", [
      ...data.experiences,
      { id: crypto.randomUUID(), organizationName: "", position: "", startDate: "", endDate: "", responsibilities: "" },
    ]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    update("experiences", data.experiences.map((exp) => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    update("experiences", data.experiences.filter((exp) => exp.id !== id));
  };

  // ─── Rendering ────────────────────────────────────────────────────────────────

  const positionDef = POSITIONS.find((p) => p.name === data.position);
  const skillsForPosition = data.position ? (SKILLS_CONFIG[data.position] ?? []) : [];

  return (
    <div className="min-h-screen" style={{ background: "#F8F7FF" }} ref={topRef}>
      {/* ── Header ── */}
      <header
        className="text-white py-8 px-4"
        style={{ background: "linear-gradient(135deg, #6C3BFF 0%, #A855F7 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">E</div>
            <span className="font-bold text-xl tracking-tight">EDUZAH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Internship & Team Application</h1>
          <p className="text-white/80 text-sm max-w-xl">
            Thank you for your interest in joining EDUZAH. Please complete all required information accurately.
          </p>
        </div>
      </header>

      {/* ── Draft Banner ── */}
      {hasDraft && step === 1 && (
        <div className="bg-[#6C3BFF]/10 border-b border-[#6C3BFF]/20">
          <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-[#6C3BFF]">
            <span>💾</span>
            <span>Draft restored — your previous progress has been loaded.</span>
            <button
              onClick={() => { setData(INITIAL); localStorage.removeItem(STORAGE_KEY); setHasDraft(false); }}
              className="ml-auto text-xs underline opacity-70 hover:opacity-100"
            >
              Clear draft
            </button>
          </div>
        </div>
      )}

      {/* ── Progress ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Mobile */}
          <div className="sm:hidden space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="font-medium text-[#6C3BFF]">Step {step} of {TOTAL_STEPS}</span>
              <span>{STEP_NAMES[step - 1]}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: "linear-gradient(90deg,#6C3BFF,#A855F7)" }}
              />
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto pb-1">
            {STEP_NAMES.map((name, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <div key={n} className="flex items-center gap-1 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? "text-white" : active ? "text-white ring-2 ring-[#6C3BFF]/30" : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                      }`}
                      style={done || active ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)" } : {}}
                    >
                      {done ? "✓" : n}
                    </div>
                    <span className={`text-[10px] mt-0.5 font-medium ${active ? "text-[#6C3BFF]" : "text-gray-400"}`}>{name}</span>
                  </div>
                  {n < TOTAL_STEPS && (
                    <div className={`w-6 h-0.5 mb-3 rounded-full flex-shrink-0 ${done ? "bg-[#6C3BFF]" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Form Content ── */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 space-y-6">
              {/* Step heading */}
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6C3BFF] mb-1">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{STEP_NAMES[step - 1]}</h2>
              </div>

              {/* ── Step 1: Personal Info ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required error={errors.fullName}>
                      <Input value={data.fullName} onChange={(v) => update("fullName", v)} placeholder="Your full name" />
                    </Field>
                    <Field label="Mobile Number" required error={errors.mobile}>
                      <Input value={data.mobile} onChange={(v) => update("mobile", v)} placeholder="01XXXXXXXXX" type="tel" />
                    </Field>
                    <Field label="WhatsApp Number" required error={errors.whatsapp}>
                      <Input value={data.whatsapp} onChange={(v) => update("whatsapp", v)} placeholder="01XXXXXXXXX" type="tel" />
                    </Field>
                    <Field label="Email Address" required error={errors.email}>
                      <Input value={data.email} onChange={(v) => update("email", v)} placeholder="you@example.com" type="email" />
                    </Field>
                    <Field label="Date of Birth" required error={errors.dateOfBirth}>
                      <Input value={data.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} type="date" />
                    </Field>
                    <Field label="Gender" error={errors.gender}>
                      <Select
                        value={data.gender}
                        onChange={(v) => update("gender", v)}
                        placeholder="Select gender"
                        options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                      />
                    </Field>
                    <Field label="Governorate" required error={errors.governorate}>
                      <Select
                        value={data.governorate}
                        onChange={(v) => update("governorate", v)}
                        placeholder="Select governorate"
                        options={EGYPT_GOVERNORATES.map((g) => ({ value: g, label: g }))}
                      />
                    </Field>
                    <Field label="City" required error={errors.city}>
                      <Input value={data.city} onChange={(v) => update("city", v)} placeholder="Your city" />
                    </Field>
                  </div>
                  <Field label="Current Address" error={errors.currentAddress}>
                    <Input value={data.currentAddress} onChange={(v) => update("currentAddress", v)} placeholder="Street, area..." />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Facebook Profile Link" error={errors.facebookLink}>
                      <Input value={data.facebookLink} onChange={(v) => update("facebookLink", v)} placeholder="https://facebook.com/..." type="url" />
                    </Field>
                    <Field label="LinkedIn Profile Link" error={errors.linkedinLink}>
                      <Input value={data.linkedinLink} onChange={(v) => update("linkedinLink", v)} placeholder="https://linkedin.com/in/..." type="url" />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Step 2: Education ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="University / Institute" required error={errors.university}>
                      <Input value={data.university} onChange={(v) => update("university", v)} placeholder="e.g. Sohag University" />
                    </Field>
                    <Field label="Faculty" required error={errors.faculty}>
                      <Input value={data.faculty} onChange={(v) => update("faculty", v)} placeholder="e.g. Faculty of Computers" />
                    </Field>
                    <Field label="Department / Major" required error={errors.department}>
                      <Input value={data.department} onChange={(v) => update("department", v)} placeholder="e.g. Computer Science" />
                    </Field>
                    <Field label="Current Academic Status" required error={errors.academicStatus}>
                      <Select
                        value={data.academicStatus}
                        onChange={(v) => update("academicStatus", v)}
                        placeholder="Select status"
                        options={[
                          { value: "Student", label: "Student" },
                          { value: "Fresh Graduate", label: "Fresh Graduate" },
                          { value: "Working & Studying", label: "Working & Studying" },
                        ]}
                      />
                    </Field>
                    <Field label="Expected Graduation Year" required error={errors.graduationYear}>
                      <Select
                        value={data.graduationYear}
                        onChange={(v) => update("graduationYear", v)}
                        placeholder="Select year"
                        options={["2023","2024","2025","2026","2027"].map((y) => ({ value: y, label: y }))}
                      />
                    </Field>
                    <Field label="GPA (Optional)" error={errors.gpa}>
                      <Input value={data.gpa} onChange={(v) => update("gpa", v)} placeholder="e.g. 3.5 / 4.0" />
                    </Field>
                  </div>
                  <Field label="Academic Achievements (Optional)" error={errors.academicAchievements}>
                    <Textarea value={data.academicAchievements} onChange={(v) => update("academicAchievements", v)} placeholder="Awards, honour lists, competitions..." rows={3} />
                  </Field>
                </div>
              )}

              {/* ── Step 3: Position ── */}
              {step === 3 && (
                <div className="space-y-6">
                  {errors.position && <p className="text-sm text-red-500">⚠ {errors.position}</p>}

                  {/* Technical Internships */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🎓</span>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Technical Internships</h3>
                      <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700">Unpaid</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {POSITIONS.filter((p) => p.type === "technical_internship").map((pos) => (
                        <PositionCard key={pos.name} pos={pos} selected={data.position === pos.name}
                          onClick={() => { update("position", pos.name); update("positionType", pos.type); update("skills", {}); }} />
                      ))}
                    </div>
                  </div>

                  {/* Non-Technical Internships */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">🎓</span>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Non-Technical Internships</h3>
                      <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700">Unpaid</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {POSITIONS.filter((p) => p.type === "non_technical_internship").map((pos) => (
                        <PositionCard key={pos.name} pos={pos} selected={data.position === pos.name}
                          onClick={() => { update("position", pos.name); update("positionType", pos.type); update("skills", {}); }} />
                      ))}
                    </div>
                  </div>

                  {/* Paid Positions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">💰</span>
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">Paid Positions</h3>
                      <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700">Paid</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {POSITIONS.filter((p) => p.type === "paid").map((pos) => (
                        <PositionCard key={pos.name} pos={pos} selected={data.position === pos.name}
                          onClick={() => { update("position", pos.name); update("positionType", pos.type); update("skills", {}); }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: Skills ── */}
              {step === 4 && (
                <div className="space-y-5">
                  {data.position && positionDef && (
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F8F7FF" }}>
                      <span className="text-2xl">{positionDef.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{data.position}</p>
                        <p className="text-xs text-gray-500">Fill in your skills and experience level for this position</p>
                      </div>
                    </div>
                  )}
                  {skillsForPosition.length === 0 && (
                    <p className="text-gray-400 text-sm">No specific skill fields for this position. Continue to the next step.</p>
                  )}
                  {skillsForPosition.map((field) => (
                    <Field key={field.key} label={field.label}>
                      {field.type === "rating" && (
                        <RatingSelector value={data.skills[field.key] ?? ""} onChange={(v) => update("skills", { ...data.skills, [field.key]: v })} />
                      )}
                      {field.type === "text" && (
                        <Input value={data.skills[field.key] ?? ""} onChange={(v) => update("skills", { ...data.skills, [field.key]: v })} />
                      )}
                      {field.type === "url" && (
                        <Input value={data.skills[field.key] ?? ""} onChange={(v) => update("skills", { ...data.skills, [field.key]: v })} type="url" placeholder="https://..." />
                      )}
                      {field.type === "textarea" && (
                        <Textarea value={data.skills[field.key] ?? ""} onChange={(v) => update("skills", { ...data.skills, [field.key]: v })} rows={3} />
                      )}
                    </Field>
                  ))}
                </div>
              )}

              {/* ── Step 5: Experience ── */}
              {step === 5 && (
                <div className="space-y-6">
                  <Field label="Do you have previous work experience?" required error={errors.hasExperience}>
                    <div className="flex gap-3 mt-1">
                      {["yes", "no"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update("hasExperience", opt)}
                          className={`px-6 py-2.5 rounded-xl border font-medium text-sm transition capitalize ${
                            data.hasExperience === opt
                              ? "text-white border-transparent"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                          style={data.hasExperience === opt ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)" } : {}}
                        >
                          {opt === "yes" ? "Yes" : "No"}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {data.hasExperience === "yes" && (
                    <div className="space-y-4">
                      {data.experiences.map((exp, idx) => (
                        <div key={exp.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Experience #{idx + 1}</p>
                            <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Organization Name">
                              <Input value={exp.organizationName} onChange={(v) => updateExperience(exp.id, "organizationName", v)} placeholder="Company / Organization" />
                            </Field>
                            <Field label="Position">
                              <Input value={exp.position} onChange={(v) => updateExperience(exp.id, "position", v)} placeholder="Your role" />
                            </Field>
                            <Field label="Start Date">
                              <Input value={exp.startDate} onChange={(v) => updateExperience(exp.id, "startDate", v)} type="month" />
                            </Field>
                            <Field label="End Date">
                              <Input value={exp.endDate} onChange={(v) => updateExperience(exp.id, "endDate", v)} type="month" placeholder="or leave blank if current" />
                            </Field>
                          </div>
                          <Field label="Responsibilities">
                            <Textarea value={exp.responsibilities} onChange={(v) => updateExperience(exp.id, "responsibilities", v)} placeholder="Describe your key responsibilities..." rows={3} />
                          </Field>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addExperience}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#6C3BFF]/30 text-[#6C3BFF] text-sm font-medium hover:border-[#6C3BFF]/60 transition"
                      >
                        + Add Experience
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 6: Portfolio & CV ── */}
              {step === 6 && (
                <div className="space-y-5">
                  {/* CV Upload */}
                  <Field label="Upload Your CV" required error={errors.cvUrl}>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                        data.cvUrl ? "border-[#6C3BFF]/40 bg-[#6C3BFF]/5" : "border-gray-200 dark:border-gray-700 hover:border-[#6C3BFF]/40"
                      }`}
                    >
                      <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleCvChange} />
                      {cvUploading ? (
                        <div className="space-y-2">
                          <div className="w-8 h-8 border-2 border-[#6C3BFF] border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : data.cvUrl ? (
                        <div className="space-y-1">
                          <p className="text-2xl">📄</p>
                          <p className="font-medium text-[#6C3BFF] text-sm">{data.cvFilename || "CV uploaded"}</p>
                          <p className="text-xs text-gray-400">Click to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-3xl">📁</p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload your CV</p>
                          <p className="text-xs text-gray-400">PDF only · Max 5 MB</p>
                        </div>
                      )}
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Portfolio Link" error={errors.portfolioLink}>
                      <Input value={data.portfolioLink} onChange={(v) => update("portfolioLink", v)} type="url" placeholder="https://..." />
                    </Field>
                    <Field label="GitHub Link" error={errors.githubLink}>
                      <Input value={data.githubLink} onChange={(v) => update("githubLink", v)} type="url" placeholder="https://github.com/..." />
                    </Field>
                    <Field label="Behance Link" error={errors.behanceLink}>
                      <Input value={data.behanceLink} onChange={(v) => update("behanceLink", v)} type="url" placeholder="https://behance.net/..." />
                    </Field>
                    <Field label="Personal Website" error={errors.personalWebsite}>
                      <Input value={data.personalWebsite} onChange={(v) => update("personalWebsite", v)} type="url" placeholder="https://yoursite.com" />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Step 7: Availability ── */}
              {step === 7 && (
                <div className="space-y-6">
                  <Field label="Available Hours Per Week" required error={errors.hoursPerWeek}>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["Less than 5 Hours","5–10 Hours","10–15 Hours","15–20 Hours","More than 20 Hours"].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => update("hoursPerWeek", h)}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                            data.hoursPerWeek === h
                              ? "text-white border-transparent"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                          style={data.hoursPerWeek === h ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)" } : {}}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Preferred Working Days" required error={errors.preferredDays}>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = data.preferredDays.includes(day)
                              ? data.preferredDays.filter((d) => d !== day)
                              : [...data.preferredDays, day];
                            update("preferredDays", days);
                          }}
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                            data.preferredDays.includes(day)
                              ? "text-white border-transparent"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                          style={data.preferredDays.includes(day) ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)" } : {}}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Can you attend offline activities?">
                      <div className="flex gap-2 mt-1">
                        {["yes","no"].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => update("canAttendOffline", opt)}
                            className={`px-5 py-2 rounded-xl border text-sm font-medium transition capitalize ${
                              data.canAttendOffline === opt ? "text-white border-transparent" : "border-gray-200 dark:border-gray-700 text-gray-600"
                            }`}
                            style={data.canAttendOffline === opt ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)" } : {}}
                          >
                            {opt === "yes" ? "Yes" : "No"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Can you attend online meetings?">
                      <div className="flex gap-2 mt-1">
                        {["yes","no"].map((opt) => (
                          <button key={opt} type="button"
                            onClick={() => update("canAttendOnline", opt)}
                            className={`px-5 py-2 rounded-xl border text-sm font-medium transition capitalize ${
                              data.canAttendOnline === opt ? "text-white border-transparent" : "border-gray-200 dark:border-gray-700 text-gray-600"
                            }`}
                            style={data.canAttendOnline === opt ? { background: "linear-gradient(135deg,#6C3BFF,#A855F7)" } : {}}
                          >
                            {opt === "yes" ? "Yes" : "No"}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Step 8: Personal Questions ── */}
              {step === 8 && (
                <div className="space-y-5">
                  {[
                    { key: "whyJoin", label: "Why do you want to join EDUZAH?", placeholder: "Share your motivation and what draws you to EDUZAH..." },
                    { key: "skillsToGain", label: "What skills do you hope to gain from this opportunity?", placeholder: "Describe the skills and knowledge you aim to develop..." },
                    { key: "valueAdded", label: "How can you add value to EDUZAH?", placeholder: "Explain what unique contribution you can make to the team..." },
                    { key: "oneYearVision", label: "Where do you see yourself after one year?", placeholder: "Describe your professional goals and vision..." },
                  ].map(({ key, label, placeholder }) => (
                    <Field key={key} label={label} required error={errors[key]}>
                      <Textarea
                        value={(data as unknown as Record<string, string>)[key]}
                        onChange={(v) => update(key as keyof FormState, v)}
                        placeholder={placeholder}
                        rows={4}
                      />
                    </Field>
                  ))}
                </div>
              )}

              {/* ── Step 9: Agreement ── */}
              {step === 9 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please review and accept all the following terms before submitting your application.
                  </p>
                  {[
                    { key: "confirmAccurate", label: "I confirm that all information provided is accurate and complete." },
                    { key: "confirmUnpaid", label: "I understand that Internship positions are unpaid training opportunities." },
                    { key: "agreePolicy", label: "I agree to comply with EDUZAH's policies and instructions throughout the program." },
                    { key: "agreeContact", label: "I agree that EDUZAH may contact me via phone, WhatsApp, or email regarding this application." },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        (data as unknown as Record<string, boolean>)[key]
                          ? "border-[#6C3BFF]/40 bg-[#6C3BFF]/5"
                          : "border-gray-200 dark:border-gray-700"
                      } ${errors[key] ? "border-red-300 bg-red-50/50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={(data as unknown as Record<string, boolean>)[key]}
                        onChange={(e) => update(key as keyof FormState, e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#6C3BFF] flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                  {Object.entries(errors).some(([k]) => ["confirmAccurate","confirmUnpaid","agreePolicy","agreeContact"].includes(k)) && (
                    <p className="text-xs text-red-500">⚠ Please accept all required terms before submitting.</p>
                  )}
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                      ⚠ {submitError}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mt-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2" style={{ background: "#F8F7FF" }}>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Application Summary</p>
                    <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">Name:</span> {data.fullName || "—"}</p>
                      <p><span className="font-medium">Position:</span> {data.position || "—"}</p>
                      <p><span className="font-medium">University:</span> {data.university || "—"}</p>
                      <p><span className="font-medium">Governorate:</span> {data.governorate || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium text-sm disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Previous
          </button>

          <span className="text-xs text-gray-400 hidden sm:block">
            {step} / {TOTAL_STEPS}
          </span>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="px-8 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#6C3BFF,#A855F7)" }}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#6C3BFF,#A855F7)" }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : "Submit Application 🚀"}
            </button>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-gray-400 space-y-1">
        <p>© {new Date().getFullYear()} EDUZAH — All rights reserved</p>
        <p>
          Questions?{" "}
          <a href="tel:01044222881" className="text-[#6C3BFF]">01044222881</a>
          {" "}/{" "}
          <a href="tel:01146966811" className="text-[#6C3BFF]">01146966811</a>
        </p>
      </footer>
    </div>
  );
}

// ─── Position Card ────────────────────────────────────────────────────────────

function PositionCard({ pos, selected, onClick }: { pos: PositionDef; selected: boolean; onClick: () => void }) {
  const isPaid = pos.type === "paid";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition flex items-start gap-3 ${
        selected
          ? "border-[#6C3BFF] bg-[#6C3BFF]/5 dark:bg-[#6C3BFF]/10"
          : "border-gray-200 dark:border-gray-700 hover:border-[#6C3BFF]/40 bg-white dark:bg-gray-900"
      }`}
    >
      <span className="text-2xl flex-shrink-0 mt-0.5">{pos.icon}</span>
      <div className="min-w-0">
        <p className={`font-semibold text-sm ${selected ? "text-[#6C3BFF]" : "text-gray-900 dark:text-gray-100"}`}>
          {pos.name}
        </p>
        <span className={`text-xs font-medium mt-0.5 inline-block ${
          isPaid ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400"
        }`}>
          {isPaid ? "💰 Paid Position" : "🎓 Internship (Unpaid)"}
        </span>
      </div>
      {selected && (
        <span className="ml-auto flex-shrink-0 text-[#6C3BFF] font-bold text-lg">✓</span>
      )}
    </button>
  );
}
