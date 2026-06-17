"use client";

import React, { useState, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import {
  User,
  FileText,
  Upload,
  X,
  Save,
  KeyRound,
  Camera,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ─── Card ─── */
function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:border-white/[0.08] transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Input Field ─── */
function InputField({ id, label, type = "text", value, onChange, placeholder = "" }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] text-[#71717A] mb-2 font-medium"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
        className="w-full h-10 bg-[#0E0E11] border border-white/[0.08] rounded-[10px] px-3 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)]"
      />
    </div>
  );
}

/* ─── Textarea Field ─── */
function TextareaField({ id, label, value, onChange, placeholder = "", rows = 5 }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] text-[#71717A] mb-2 font-medium"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        aria-label={label}
        className="w-full min-h-[120px] bg-[#0E0E11] border border-white/[0.08] rounded-[10px] p-3 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 resize-y font-[family-name:var(--font-inter)] leading-relaxed"
      />
    </div>
  );
}

/* ─── Tag Input (Skills) ─── */
function TagInput({ id, label, tags, setTags, placeholder = "" }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const tag = inputValue.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
          setTags([...tags, tag]);
        }
        setInputValue("");
      }
      // Backspace removes last tag when input is empty
      if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        setTags(tags.slice(0, -1));
      }
    },
    [inputValue, tags, setTags]
  );

  const removeTag = useCallback(
    (tagToRemove) => {
      setTags(tags.filter((t) => t !== tagToRemove));
    },
    [tags, setTags]
  );

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] text-[#71717A] mb-2 font-medium"
      >
        {label}
      </label>
      <div
        className="flex flex-wrap items-center gap-2 min-h-[44px] bg-[#0E0E11] border border-white/[0.08] rounded-[10px] px-3 py-2 focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6] transition-all duration-150"
        role="group"
        aria-label="Skills tags"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#3A3A40] text-[#A1A1AA] text-[12px] px-2.5 py-1 rounded-md font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-[#71717A] hover:text-white transition-colors duration-150 cursor-pointer"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={addTag}
          placeholder={tags.length === 0 ? placeholder : ""}
          aria-label="Add a skill"
          className="flex-1 min-w-[120px] bg-transparent text-[14px] text-white placeholder:text-[#71717A] outline-none font-[family-name:var(--font-inter)]"
        />
      </div>
    </div>
  );
}

/* ─── Primary Button ─── */
function PrimaryButton({ children, onClick, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={typeof children === "string" ? children : undefined}
      className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}

/* ─── Secondary Button ─── */
function SecondaryButton({ children, onClick, type = "button", danger = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={typeof children === "string" ? children : undefined}
      className={`h-10 px-4 rounded-[10px] text-[14px] font-medium transition-all duration-150 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center justify-center gap-2 ${
        danger
          ? "border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10"
          : "bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] hover:bg-[#222228] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── File Upload Card ─── */
function FileUploadCard() {
  const [fileName, setFileName] = useState("resume_alex_rivera.pdf");
  const [fileSize, setFileSize] = useState("245 KB");
  const fileInputRef = useRef(null);

  return (
    <Card>
      {/* Header */}
      <h3 className="text-[18px] font-medium text-white">Resume</h3>
      <p className="text-[13px] text-[#71717A] mt-1 mb-4">
        Upload your resume to enhance your profile visibility.
      </p>

      {/* Upload Area */}
      <div className="border border-dashed border-white/[0.1] rounded-[12px] p-6 bg-[#0E0E11] text-center">
        <FileText
          size={32}
          aria-hidden="true"
          className="text-[#71717A] mx-auto mb-3"
        />
        <p className="text-[14px] text-[#A1A1AA] font-medium">{fileName}</p>
        <p className="text-[12px] text-[#71717A] mt-1">
          PDF &middot; {fileSize} &middot; Uploaded 3 days ago
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Replace resume file"
            className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          >
            Replace
          </button>
          <button
            aria-label="Remove resume file"
            className="h-8 px-3 border border-[#EF4444]/40 text-[#EF4444] rounded-md text-[13px] font-medium hover:bg-[#EF4444]/10 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          >
            Remove
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={() => {}}
        />
      </div>
    </Card>
  );
}

/* ─── Profile Information Card ─── */
function ProfileCard({ user, form, onChange, onSave, onResetPassword, saving }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <h3 className="text-[18px] font-medium text-white mb-6">Profile Information</h3>

      {/* Avatar + Change */}
      <div className="flex items-center gap-6 mb-6">
        <div
          className="w-16 h-16 rounded-full bg-[#3A3A40] border border-white/[0.08] flex items-center justify-center text-white text-lg font-semibold shrink-0 overflow-hidden"
          role="img"
          aria-label={`Profile avatar of ${user?.name || "User"}`}
        >
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>
        <div>
          <button
            aria-label="Change profile avatar"
            className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center gap-2"
          >
            <Camera size={14} aria-hidden="true" />
            Change Avatar
          </button>
          <p className="text-[12px] text-[#71717A] mt-2">
            JPG, PNG or GIF. Max 2MB.
          </p>
        </div>
      </div>

      {/* Name + Email Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <InputField
          id="settings-name"
          label="Full Name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Alex Rivera"
        />
        <InputField
          id="settings-email"
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="alex@example.com"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.05] my-6" />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <PrimaryButton onClick={onSave} disabled={saving}>
          <Save size={15} aria-hidden="true" />
          {saving ? "Saving..." : "Update Profile"}
        </PrimaryButton>
        <SecondaryButton onClick={onResetPassword}>
          <KeyRound size={15} aria-hidden="true" />
          Reset Password
        </SecondaryButton>
      </div>
    </Card>
  );
}

/* ─── Professional Details Card ─── */
function ProfessionalDetailsCard({ form, onChange, onSkillChange, skills, onSave, saving }) {
  return (
    <Card className="mt-6">
      <h3 className="text-[18px] font-medium text-white mb-6">Professional Details</h3>

      <InputField
        id="settings-headline"
        label="Headline"
        value={form.headline}
        onChange={(e) => onChange("headline", e.target.value)}
        placeholder="Full Stack Developer | React & Node.js"
      />

      <div className="mt-6">
        <TextareaField
          id="settings-bio"
          label="Bio"
          value={form.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Tell us about yourself, your experience, and what you're looking for..."
          rows={5}
        />
      </div>

      <div className="mt-6">
        <TagInput
          id="settings-skills"
          label="Skills"
          tags={skills}
          setTags={onSkillChange}
          placeholder="Type a skill and press Enter..."
        />
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <PrimaryButton onClick={onSave} disabled={saving}>
          <Save size={15} aria-hidden="true" />
          {saving ? "Saving..." : "Save Details"}
        </PrimaryButton>
      </div>
    </Card>
  );
}

/* ─── Toast Message ─── */
function ToastMessage({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`text-[14px] px-4 py-3 rounded-[12px] border ${
        message.type === "success"
          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
          : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
      }`}
    >
      {message.text}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════ */
export default function SeekerSettingsPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
  });

  const [skills, setSkills] = useState(
    user?.skills?.length ? user.skills : ["React", "TypeScript", "Node.js", "Next.js", "PostgreSQL"]
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const body = {
        name: form.name,
        email: form.email,
        headline: form.headline,
        bio: form.bio,
        skills,
      };
      const res = await fetch(`${baseUrl}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    setMessage({ type: "success", text: "Password reset email sent to your inbox." });
  };

  if (isPending) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        role="status"
        aria-label="Loading settings"
      >
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Settings
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Update your profile information and preferences.
        </p>
      </div>

      {/* ── Toast ── */}
      {message && (
        <ToastMessage message={message} />
      )}

      {/* ── Two-Column Top: Profile (2 col) + Resume (1 col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileCard
          user={user}
          form={form}
          onChange={handleChange}
          onSave={handleSubmit}
          onResetPassword={handleResetPassword}
          saving={saving}
        />
        <FileUploadCard />
      </div>

      {/* ── Professional Details (Full Width) ── */}
      <ProfessionalDetailsCard
        form={form}
        onChange={handleChange}
        onSkillChange={setSkills}
        skills={skills}
        onSave={handleSubmit}
        saving={saving}
      />
    </div>
  );
}