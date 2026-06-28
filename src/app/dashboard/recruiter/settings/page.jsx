"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Save, Camera, Building2, ArrowRight, Bell, Shield, X,
  AlertCircle, RefreshCw, Briefcase, Phone, Globe, MapPin,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const pickFormFields = (u) => ({
  name: u?.name || "",
  email: u?.email || "",
  jobTitle: u?.jobTitle || "",
  phone: u?.phone || "",
  bio: u?.bio || "",
  company: u?.company || "",
  location: u?.location || "",
  website: u?.website || "",
  linkedin: u?.linkedin || "",
  industry: u?.industry || "",
});

const settingsFetch = async (apiPath, options = {}) => {
  try {
    const res = await fetch(`/api/backend/${apiPath.replace(/^\/api\//, "")}`, {
      credentials: "include",
      ...options,
    });
    let body;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    if (!res.ok) return { ok: false, status: res.status, body };
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

function TextareaField({ id, label, value, onChange, placeholder = "", rows = 4 }) {
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

function PrimaryButton({ children, onClick, type = "button", disabled = false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={typeof children === "string" ? children : undefined}
      className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center justify-center gap-2">
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, danger = false }) {
  return (
    <button type="button" onClick={onClick} aria-label={typeof children === "string" ? children : undefined}
      className={`h-10 px-4 rounded-[10px] text-[14px] font-medium transition-all duration-150 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center justify-center gap-2 ${
        danger ? "border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10"
               : "bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] hover:bg-[#222228] hover:text-white"
      }`}>
      {children}
    </button>
  );
}

function ToggleSwitch({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-white">{label}</p>
        {description && <p className="text-[12px] text-[#71717A] mt-0.5">{description}</p>}
      </div>
      <button
        id={id} role="switch" aria-checked={checked} aria-label={label} aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${checked ? "bg-white" : "bg-[#3A3A40]"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${checked ? "left-[22px] bg-black" : "left-0.5 bg-[#A1A1AA]"}`} />
      </button>
    </div>
  );
}

function ToastMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div role="alert" className={`flex items-center justify-between text-[14px] px-4 py-3 rounded-[12px] border ${
      message.type === "success" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
    }`}>
      {message.text}
      <button onClick={onDismiss} aria-label="Dismiss" className="ml-3 shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-150">
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function CompanyLinkCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#3A3A40] flex items-center justify-center shrink-0">
            <Building2 size={22} aria-hidden="true" className="text-[#A1A1AA]" />
          </div>
          <div>
            <h3 className="text-[16px] font-medium text-white">Company Profile</h3>
            <p className="text-[13px] text-[#71717A] mt-0.5">Manage your company details, logo, and branding.</p>
          </div>
        </div>
        <Link href="/dashboard/recruiter/company" className="h-9 px-4 bg-[#3A3A40] rounded-[10px] text-[13px] font-medium text-[#A1A1AA] hover:bg-[#4A4A52] hover:text-white transition-all duration-150 inline-flex items-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]">
          Manage <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

function DangerZoneCard() {
  return (
    <Card className="border-[#EF4444]/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-[10px] bg-[#EF4444]/10 flex items-center justify-center">
          <Shield size={18} aria-hidden="true" className="text-[#EF4444]" />
        </div>
        <div>
          <h3 className="text-[18px] font-medium text-white">Danger Zone</h3>
          <p className="text-[13px] text-[#71717A] mt-0.5">Irreversible account actions.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#0E0E11] border border-white/[0.05]">
          <div>
            <p className="text-[14px] font-medium text-white">Delete Account</p>
            <p className="text-[12px] text-[#71717A] mt-0.5">Permanently delete your account and all associated data.</p>
          </div>
          <SecondaryButton danger>Delete Account</SecondaryButton>
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   RECRUITER SETTINGS PAGE
   ═══════════════════════════════════════════════════ */
export default function RecruiterSettingsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const sessionUser = session?.user;

  const [form, setForm] = useState({
    name: "", email: "", jobTitle: "", phone: "", bio: "",
    company: "", location: "", website: "", linkedin: "", industry: "",
  });
  const [avatarUrl, setAvatarUrl] = useState(sessionUser?.image || "");
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [notifications, setNotifications] = useState({
    newApplicant: true, interviewReminders: true, emailDigest: false, jobExpiry: true, messages: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleNotifChange = (key, value) => setNotifications((prev) => ({ ...prev, [key]: value }));

  // ── Avatar Upload (ImgBB — direct from browser) ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 5MB." });
      return;
    }
    setAvatarUploading(true);
    try {
      // Step 1: Upload directly to ImgBB from browser
      const formData = new FormData();
      formData.append("image", file);
      const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
      const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success || !uploadData.data?.url) {
        setMessage({ type: "error", text: "Image upload failed. Try again." });
        setAvatarUploading(false);
        e.target.value = "";
        return;
      }

      // Step 2: Update user profile with ImgBB URL
      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadData.data.url }),
      });
      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        setAvatarUrl(uploadData.data.url);
        setMessage({ type: "success", text: "Avatar updated!" });
      } else {
        setMessage({ type: "error", text: "Failed to save avatar." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload image." });
    }
    setAvatarUploading(false);
    e.target.value = "";
  };

  // ── Load profile from DB ──
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await settingsFetch("/users/me");
      if (res.ok && isPlainObject(res.data) && isPlainObject(res.data.user)) {
        const u = res.data.user;
        setForm(pickFormFields(u));
        setAvatarUrl(u.image || sessionUser?.image || "");
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

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Save profile to DB ──
  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body = {
        name: form.name,
        email: form.email,
        jobTitle: form.jobTitle,
        phone: form.phone,
        bio: form.bio,
        company: form.company,
        location: form.location,
        website: form.website,
        linkedin: form.linkedin,
        industry: form.industry,
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

  if (loading || sessionPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading settings">
        <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Settings</h1></div>
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[14px] p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] text-[#EF4444] font-medium">Could not load your profile data</p>
              <p className="text-[13px] text-[#A1A1AA] mt-1">{loadError}</p>
              <button onClick={loadProfile} className="mt-3 h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5">
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">Settings</h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">Update your profile information and manage your account preferences.</p>
      </div>

      {message && <ToastMessage message={message} onDismiss={() => setMessage(null)} />}
      <CompanyLinkCard />

      {/* ── Profile Information ── */}
      <Card>
        <h3 className="text-[18px] font-medium text-white mb-6">Profile Information</h3>

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
            <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" aria-hidden="true" tabIndex={-1} onChange={handleAvatarChange} />
            <p className="text-[12px] text-[#71717A] mt-2">JPG, PNG, GIF or WebP. Max 5MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField id="r-name" label="Full Name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Alex Sterling" icon={User} />
          <InputField id="r-email" label="Email Address" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="alex@company.com" icon={Globe} />
          <InputField id="r-jobtitle" label="Job Title" value={form.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} placeholder="Senior Recruiter" icon={Briefcase} />
          <InputField id="r-phone" label="Phone (Optional)" type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1 (555) 123-4567" icon={Phone} />
          <InputField id="r-company" label="Company Name" value={form.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="Acme Corp" icon={Building2} />
          <InputField id="r-location" label="Location" value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="City, Country" icon={MapPin} />
        </div>

        <div className="border-t border-white/[0.05] my-6" />
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          <Save size={15} aria-hidden="true" /> {saving ? "Saving..." : "Update Profile"}
        </PrimaryButton>
      </Card>

      {/* ── Professional Details ── */}
      <Card>
        <h3 className="text-[18px] font-medium text-white mb-6">Professional Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField id="r-website" label="Website" value={form.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://company.com" icon={Globe} />
          <InputField id="r-linkedin" label="LinkedIn" value={form.linkedin} onChange={(e) => handleChange("linkedin", e.target.value)} placeholder="https://linkedin.com/company/..." icon={Globe} />
          <InputField id="r-industry" label="Industry" value={form.industry} onChange={(e) => handleChange("industry", e.target.value)} placeholder="Technology, Finance, Healthcare..." icon={Briefcase} />
        </div>
        <div className="mt-6">
          <TextareaField id="r-bio" label="Bio" value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} placeholder="Tell candidates about yourself and your recruiting focus..." rows={4} />
        </div>
        <div className="border-t border-white/[0.05] my-6" />
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          <Save size={15} aria-hidden="true" /> {saving ? "Saving..." : "Save Details"}
        </PrimaryButton>
      </Card>

      {/* ── Notification Preferences ── */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center">
            <Bell size={18} aria-hidden="true" className="text-[#A1A1AA]" />
          </div>
          <div>
            <h3 className="text-[18px] font-medium text-white">Notification Preferences</h3>
            <p className="text-[13px] text-[#71717A] mt-0.5">Control how you receive updates about your job postings.</p>
          </div>
        </div>
        <div className="divide-y divide-white/[0.05]">
          <ToggleSwitch id="notif-new-applicant" label="New Applicant Alerts" description="Get notified when a candidate applies to your jobs" checked={notifications.newApplicant} onChange={(v) => handleNotifChange("newApplicant", v)} />
          <ToggleSwitch id="notif-interview-reminders" label="Interview Reminders" description="Receive reminders before scheduled interviews" checked={notifications.interviewReminders} onChange={(v) => handleNotifChange("interviewReminders", v)} />
          <ToggleSwitch id="notif-email-digest" label="Email Digest" description="Receive a daily summary of all recruitment activity" checked={notifications.emailDigest} onChange={(v) => handleNotifChange("emailDigest", v)} />
          <ToggleSwitch id="notif-job-expiry" label="Job Expiry Warnings" description="Get alerts before your job postings expire" checked={notifications.jobExpiry} onChange={(v) => handleNotifChange("jobExpiry", v)} />
          <ToggleSwitch id="notif-messages" label="Message Notifications" description="Get notified when candidates send you messages" checked={notifications.messages} onChange={(v) => handleNotifChange("messages", v)} />
        </div>
      </Card>

      <DangerZoneCard />
    </div>
  );
}
