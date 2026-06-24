"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";
import {
  User, FileText, Upload, X, Save, Camera, MapPin, Globe, Phone, Briefcase,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { LogoGithub, LogoLinkedin } from "@gravity-ui/icons";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

/** Build the default empty form state */
const emptyForm = {
  name: "", email: "", phone: "", location: "", website: "",
  headline: "", bio: "", experienceLevel: "", jobType: "",
  linkedin: "", github: "", skills: "",
};

/** Extract user-safe fields from a user object (session or API) */
const pickFormFields = (u) => ({
  name: u?.name || "",
  email: u?.email || "",
  phone: u?.phone || "",
  location: u?.location || "",
  website: u?.website || "",
  headline: u?.headline || "",
  bio: u?.bio || "",
  experienceLevel: u?.experienceLevel || "",
  jobType: u?.preferredJobType || "",
  linkedin: u?.linkedin || "",
  github: u?.github || "",
  skills: Array.isArray(u?.skills) ? u.skills.join(", ") : u?.skills || "",
});

/** Check if a value is a plain object (not array, not null) */
const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

/**
 * Robust fetch wrapper for settings page.
 * Returns { ok: true, data } or { ok: false, status, body }.
 * Never throws — all errors are caught and returned.
 */
const settingsFetch = async (apiPath, options = {}) => {
  try {
    const res = await fetch(`/api/backend/${apiPath.replace(/^\/api\//, "")}`, {
      credentials: "include",
      ...options,
    });

    // Read body once
    let body;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    if (!res.ok) {
      return { ok: false, status: res.status, body };
    }
    return { ok: true, data: body };
  } catch (err) {
    return { ok: false, status: 0, body: { error: err.message } };
  }
};

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.18)] hover:border-white/[0.08] transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

function InputField({ id, label, type = "text", value, onChange, placeholder = "", icon: Icon }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] text-[#71717A] mb-2 font-medium">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={16} width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" aria-hidden="true" />
        )}
        <input
          id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} aria-label={label}
          className={`w-full h-10 bg-[#0E0E11] border border-white/[0.08] rounded-[10px] text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)] ${Icon ? "pl-10 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function TextareaField({ id, label, value, onChange, placeholder = "", rows = 5 }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] text-[#71717A] mb-2 font-medium">{label}</label>
      <textarea
        id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows} aria-label={label}
        className="w-full min-h-[120px] bg-[#0E0E11] border border-white/[0.08] rounded-[10px] p-3 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 resize-y font-[family-name:var(--font-inter)] leading-relaxed"
      />
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] text-[#71717A] mb-2 font-medium">{label}</label>
      <select
        id={id} value={value} onChange={onChange} aria-label={label}
        className="w-full h-10 bg-[#0E0E11] border border-white/[0.08] rounded-[10px] px-3 text-[14px] text-white outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)] appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0E0E11]">{opt.label}</option>
        ))}
      </select>
    </div>
  );
}





function PrimaryButton({ children, onClick, type = "button", disabled = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={typeof children === "string" ? children : undefined}
      className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center justify-center gap-2">
      {children}
    </button>
  );
}

function ToastMessage({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className={`text-[14px] px-4 py-3 rounded-[12px] border ${message.type === "success" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"}`}>
      {message.text}
    </div>
  );
}

/* ─── File Upload Card ─── */
function FileUploadCard({ resumeName, resumeUrl, onUpload, onRemove }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        await onUpload(dataUrl, file.name);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-[18px] font-medium text-white">Resume</h3>
      <p className="text-[13px] text-[#71717A] mt-1 mb-4">Upload your resume to enhance your profile visibility.</p>
      <div className="border border-dashed border-white/[0.1] rounded-[12px] p-6 bg-[#0E0E11] text-center">
        {resumeUrl ? (
          <>
            <FileText size={32} aria-hidden="true" className="text-[#22C55E] mx-auto mb-3" />
            <p className="text-[14px] text-white font-medium">{resumeName || "resume.pdf"}</p>
            <p className="text-[12px] text-[#71717A] mt-1">Uploaded</p>
          </>
        ) : (
          <>
            <Upload size={32} aria-hidden="true" className="text-[#71717A] mx-auto mb-3" />
            <p className="text-[14px] text-[#A1A1AA] font-medium">No resume uploaded</p>
            <p className="text-[12px] text-[#71717A] mt-1">PDF, DOC, or DOCX</p>
          </>
        )}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Upload resume"
            className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {uploading ? "Uploading..." : resumeUrl ? "Replace" : "Upload"}
          </button>
          {resumeUrl && (
            <button onClick={onRemove} aria-label="Remove resume" className="h-8 px-3 border border-[#EF4444]/40 text-[#EF4444] rounded-md text-[13px] font-medium hover:bg-[#EF4444]/10 transition-all duration-150 cursor-pointer">
              Remove
            </button>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" aria-hidden="true" tabIndex={-1} onChange={handleFileChange} />
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   SETTINGS PAGE
   ═══════════════════════════════════════════════════ */
export default function SeekerSettingsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const sessionUser = session?.user;

  // ── Form state ──
  const [form, setForm] = useState(emptyForm);
  const [avatarUrl, setAvatarUrl] = useState(sessionUser?.image || "");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ═══════════════════════════════════════════════════
  // AVATAR UPLOAD
  // ═══════════════════════════════════════════════════
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 2MB." });
      return;
    }
    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const res = await settingsFetch("/users/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        if (res.ok && isPlainObject(res.data) && !res.data.error) {
          setAvatarUrl(dataUrl);
          setMessage({ type: "success", text: "Avatar updated!" });
        } else {
          setMessage({ type: "error", text: "Failed to upload avatar." });
        }
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage({ type: "error", text: "Failed to read image file." });
      setAvatarUploading(false);
    }
    // Reset file input so same file can be re-selected
    e.target.value = "";
  };

  // ═══════════════════════════════════════════════════
  // LOAD — fetch full user profile from backend API.
  // This is the ONLY source of truth for form fields.
  // Session data is used only for avatar display.
  // ═══════════════════════════════════════════════════
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await settingsFetch("/users/me");
      if (res.ok && isPlainObject(res.data) && isPlainObject(res.data.user)) {
        const u = res.data.user;
        setForm(pickFormFields(u));
        setAvatarUrl(u.image || sessionUser?.image || "");
        setResumeUrl(u.resumeUrl || "");
        setResumeName(u.resumeName || "");
      } else {
        const errMsg = res.body?.error || res.body?.message || `Server returned ${res.status}`;
        setLoadError(`Failed to load profile: ${errMsg}`);
      }
    } catch (err) {
      setLoadError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ═══════════════════════════════════════════════════
  // SAVE — sends ALL fields to backend, then updates local state
  // ═══════════════════════════════════════════════════
  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        website: form.website,
        headline: form.headline,
        bio: form.bio,
        experienceLevel: form.experienceLevel,
        preferredJobType: form.jobType,
        linkedin: form.linkedin,
        github: form.github,
        skills: form.skills,
      };

      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        const updatedUser = res.data.user;
        if (isPlainObject(updatedUser)) {
          setForm(pickFormFields(updatedUser));
          setAvatarUrl(updatedUser.image || "");
          setResumeUrl(updatedUser.resumeUrl || "");
          setResumeName(updatedUser.resumeName || "");
        }
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const errMsg = res.body?.error || res.body?.message || `Server error (${res.status})`;
        setMessage({ type: "error", text: `Failed to update: ${errMsg}` });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (dataUrl, fileName) => {
    setSaving(true);
    try {
      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: dataUrl, resumeName: fileName }),
      });
      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        setResumeUrl(dataUrl);
        setResumeName(fileName);
        setMessage({ type: "success", text: "Resume uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to upload resume." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload resume." });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeRemove = async () => {
    setSaving(true);
    try {
      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: "", resumeName: "" }),
      });
      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        setResumeUrl("");
        setResumeName("");
        setMessage({ type: "success", text: "Resume removed." });
      } else {
        setMessage({ type: "error", text: "Failed to remove resume." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove resume." });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──
  if (loading || sessionPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading settings">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // ── Error state (data failed to load) ──
  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Settings</h1>
        </div>
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[14px] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] text-[#EF4444] font-medium">Could not load your profile data</p>
              <p className="text-[13px] text-[#A1A1AA] mt-1">{loadError}</p>
              <button
                onClick={loadProfile}
                className="mt-3 h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Settings</h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">Update your profile information and preferences.</p>
      </div>

      {message && <ToastMessage message={message} />}

      {/* ── Profile Card + Resume ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-[18px] font-medium text-white mb-6">Profile Information</h3>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#3A3A40] border border-white/[0.08] flex items-center justify-center text-white text-lg font-semibold shrink-0 overflow-hidden" role="img" aria-label="Avatar">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : getInitials(sessionUser?.name)}
            </div>
            <div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                aria-label="Change avatar"
                className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Camera size={14} aria-hidden="true" /> {avatarUploading ? "Uploading..." : "Change Avatar"}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/gif" className="hidden" aria-hidden="true" tabIndex={-1} onChange={handleAvatarChange} />
              <p className="text-[12px] text-[#71717A] mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InputField id="s-name" label="Full Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your full name" />
            <InputField id="s-email" label="Email Address" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="your@email.com" icon={Globe} />
            <InputField id="s-phone" label="Phone Number" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" icon={Phone} />
            <InputField id="s-location" label="Location" value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="City, Country" icon={MapPin} />
          </div>

          <div className="border-t border-white/[0.05] my-6" />

          <div className="flex gap-4">
            <PrimaryButton onClick={handleSubmit} disabled={saving}>
              <Save size={15} aria-hidden="true" /> {saving ? "Saving..." : "Update Profile"}
            </PrimaryButton>
          </div>
        </Card>

        <FileUploadCard
          resumeName={resumeName}
          resumeUrl={resumeUrl}
          onUpload={handleResumeUpload}
          onRemove={handleResumeRemove}
        />
      </div>

      {/* ── Professional Details ── */}
      <Card>
        <h3 className="text-[18px] font-medium text-white mb-6">Professional Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField id="s-headline" label="Headline" value={form.headline} onChange={(e) => handleChange("headline", e.target.value)} placeholder="Full Stack Developer | React & Node.js" icon={Briefcase} />
          <SelectField id="s-experience" label="Experience Level" value={form.experienceLevel} onChange={(e) => handleChange("experienceLevel", e.target.value)} options={[
            { value: "", label: "Select experience level" },
            { value: "entry-level", label: "Entry Level" },
            { value: "mid-level", label: "Mid Level" },
            { value: "senior", label: "Senior" },
            { value: "lead", label: "Lead / Principal" },
            { value: "manager", label: "Manager" },
            { value: "executive", label: "Executive" },
          ]} />
          <SelectField id="s-jobtype" label="Preferred Job Type" value={form.jobType} onChange={(e) => handleChange("jobType", e.target.value)} options={[
            { value: "", label: "Select job type" },
            { value: "full-time", label: "Full-time" },
            { value: "part-time", label: "Part-time" },
            { value: "contract", label: "Contract" },
            { value: "freelance", label: "Freelance" },
            { value: "internship", label: "Internship" },
          ]} />
          <InputField id="s-website" label="Portfolio / Website" value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://yoursite.com" icon={Globe} />
        </div>

        <div className="mt-6">
          <TextareaField id="s-bio" label="Bio" value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} placeholder="Tell us about yourself, your experience, and what you're looking for..." rows={5} />
        </div>

        <div className="mt-6">
          <InputField id="s-skills" label="Skills" value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} placeholder="e.g. React, Node.js, Python" />
        </div>

        <div className="border-t border-white/[0.05] my-6" />

        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          <Save size={15} aria-hidden="true" /> {saving ? "Saving..." : "Save Details"}
        </PrimaryButton>
      </Card>

      {/* ── Social Links ── */}
      <Card>
        <h3 className="text-[18px] font-medium text-white mb-6">Social Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField id="s-linkedin" label="LinkedIn" value={form.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} placeholder="https://linkedin.com/in/yourname" icon={LogoLinkedin} />
          <InputField id="s-github" label="GitHub" value={form.github} onChange={(e) => handleChange("github", e.target.value)} placeholder="https://github.com/yourname" icon={LogoGithub} />
        </div>
        <div className="mt-6">
          <PrimaryButton onClick={handleSubmit} disabled={saving}>
            <Save size={15} aria-hidden="true" /> {saving ? "Saving..." : "Save Social Links"}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}