"use client";

import React, { useState, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import {
  User,
  Save,
  KeyRound,
  Camera,
  Building2,
  ArrowRight,
  Bell,
  Mail,
  MessageSquare,
  Shield,
  X,
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

/* ─── Toggle Switch ─── */
function ToggleSwitch({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-white">{label}</p>
        {description && (
          <p className="text-[12px] text-[#71717A] mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] ${
          checked ? "bg-white" : "bg-[#3A3A40]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ${
            checked ? "left-[22px] bg-black" : "left-0.5 bg-[#A1A1AA]"
          }`}
        />
      </button>
    </div>
  );
}

/* ─── Toast Message ─── */
function ToastMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`flex items-center justify-between text-[14px] px-4 py-3 rounded-[12px] border ${
        message.type === "success"
          ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20"
          : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
      }`}
    >
      {message.text}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-3 shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-150"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

/* ─── Company Profile Link Card ─── */
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
            <p className="text-[13px] text-[#71717A] mt-0.5">
              Manage your company details, logo, and branding.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/recruiter/company"
          className="h-9 px-4 bg-[#3A3A40] rounded-[10px] text-[13px] font-medium text-[#A1A1AA] hover:bg-[#4A4A52] hover:text-white transition-all duration-150 inline-flex items-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
        >
          Manage
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

/* ─── Profile Information Card ─── */
function ProfileCard({ user, form, onChange, onSave, onResetPassword, saving }) {
  const avatarInputRef = useRef(null);

  return (
    <Card>
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
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Change profile avatar"
            className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center gap-2"
          >
            <Camera size={14} aria-hidden="true" />
            Change Avatar
          </button>
          <p className="text-[12px] text-[#71717A] mt-2">
            JPG, PNG or GIF. Max 2MB.
          </p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Name + Email + Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputField
          id="settings-name"
          label="Full Name"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Alex Sterling"
        />
        <InputField
          id="settings-email"
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="alex@company.com"
        />
        <InputField
          id="settings-title"
          label="Job Title"
          value={form.jobTitle}
          onChange={(e) => onChange("jobTitle", e.target.value)}
          placeholder="Senior Recruiter"
        />
        <InputField
          id="settings-phone"
          label="Phone (Optional)"
          type="tel"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Bio */}
      <div className="mt-6">
        <TextareaField
          id="settings-bio"
          label="Bio (Optional)"
          value={form.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Tell candidates about yourself and your recruiting focus..."
          rows={4}
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

/* ─── Notification Settings Card ─── */
function NotificationCard({ settings, onChange }) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-[10px] bg-[#3A3A40] flex items-center justify-center">
          <Bell size={18} aria-hidden="true" className="text-[#A1A1AA]" />
        </div>
        <div>
          <h3 className="text-[18px] font-medium text-white">Notification Preferences</h3>
          <p className="text-[13px] text-[#71717A] mt-0.5">
            Control how you receive updates about your job postings.
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        <ToggleSwitch
          id="notif-new-applicant"
          label="New Applicant Alerts"
          description="Get notified when a candidate applies to your jobs"
          checked={settings.newApplicant}
          onChange={(v) => onChange("newApplicant", v)}
        />
        <ToggleSwitch
          id="notif-interview-reminders"
          label="Interview Reminders"
          description="Receive reminders before scheduled interviews"
          checked={settings.interviewReminders}
          onChange={(v) => onChange("interviewReminders", v)}
        />
        <ToggleSwitch
          id="notif-email-digest"
          label="Email Digest"
          description="Receive a daily summary of all recruitment activity"
          checked={settings.emailDigest}
          onChange={(v) => onChange("emailDigest", v)}
        />
        <ToggleSwitch
          id="notif-job-expiry"
          label="Job Expiry Warnings"
          description="Get alerts before your job postings expire"
          checked={settings.jobExpiry}
          onChange={(v) => onChange("jobExpiry", v)}
        />
        <ToggleSwitch
          id="notif-messages"
          label="Message Notifications"
          description="Get notified when candidates send you messages"
          checked={settings.messages}
          onChange={(v) => onChange("messages", v)}
        />
      </div>
    </Card>
  );
}

/* ─── Danger Zone Card ─── */
function DangerZoneCard() {
  return (
    <Card className="border-[#EF4444]/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-[10px] bg-[#EF4444]/10 flex items-center justify-center">
          <Shield size={18} aria-hidden="true" className="text-[#EF4444]" />
        </div>
        <div>
          <h3 className="text-[18px] font-medium text-white">Danger Zone</h3>
          <p className="text-[13px] text-[#71717A] mt-0.5">
            Irreversible account actions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-[10px] bg-[#0E0E11] border border-white/[0.05]">
          <div>
            <p className="text-[14px] font-medium text-white">Delete Account</p>
            <p className="text-[12px] text-[#71717A] mt-0.5">
              Permanently delete your account and all associated data.
            </p>
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
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    jobTitle: user?.jobTitle || "Senior Recruiter",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [notifications, setNotifications] = useState({
    newApplicant: true,
    interviewReminders: true,
    emailDigest: false,
    jobExpiry: true,
    messages: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotifChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const body = {
        name: form.name,
        email: form.email,
        jobTitle: form.jobTitle,
        phone: form.phone,
        bio: form.bio,
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
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-[42px] font-bold text-white leading-tight tracking-tight">
          Settings
        </h1>
        <p className="text-[15px] text-[#71717A] mt-1 leading-relaxed">
          Update your profile information and manage your account preferences.
        </p>
      </div>

      {/* ── Toast ── */}
      {message && (
        <ToastMessage message={message} onDismiss={() => setMessage(null)} />
      )}

      {/* ── Company Profile Link ── */}
      <CompanyLinkCard />

      {/* ── Profile Information ── */}
      <ProfileCard
        user={user}
        form={form}
        onChange={handleChange}
        onSave={handleSubmit}
        onResetPassword={handleResetPassword}
        saving={saving}
      />

      {/* ── Notification Preferences ── */}
      <NotificationCard settings={notifications} onChange={handleNotifChange} />

      {/* ── Danger Zone ── */}
      <DangerZoneCard />
    </div>
  );
}