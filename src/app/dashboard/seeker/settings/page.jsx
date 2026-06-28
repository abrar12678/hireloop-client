"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { protectedClientFetch, clientMutation } from "@/lib/core/client";
import {
  User, FileText, Upload, X, Save, Camera, MapPin, Globe, Phone, Briefcase,
  AlertCircle, RefreshCw, Plus, Pencil, Trash2, GraduationCap, Award,
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
  experience: Array.isArray(u?.experience) ? u.experience : [],
  education: Array.isArray(u?.education) ? u.education.map(e => ({
    ...e,
    schoolType: e.collegeName ? "college" : e.universityName ? "university" : "",
    school: e.collegeName || e.universityName || e.school || "",
  })) : [],
  certificates: Array.isArray(u?.certificates) ? u.certificates : [],
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

/** Format a YYYY-MM date string to a readable format */
const formatDate = (val) => {
  if (!val) return "Present";
  const [year, month] = val.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
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
function FileUploadCard({ resumeName, resumeUrl, onUpload, onRemove, title = "Resume", description = "Upload your resume to enhance your profile visibility.", accept = ".pdf,.doc,.docx" }) {
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
      <h3 className="text-[18px] font-medium text-white">{title}</h3>
      <p className="text-[13px] text-[#71717A] mt-1 mb-4">{description}</p>
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
            <p className="text-[14px] text-[#A1A1AA] font-medium">No {title.toLowerCase()} uploaded</p>
            <p className="text-[12px] text-[#71717A] mt-1">PDF, DOC, DOCX, JPG, PNG</p>
          </>
        )}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label={`Upload ${title.toLowerCase()}`}
            className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {uploading ? "Uploading..." : resumeUrl ? "Replace" : "Upload"}
          </button>
          {resumeUrl && (
            <button onClick={onRemove} aria-label={`Remove ${title.toLowerCase()}`} className="h-8 px-3 border border-[#EF4444]/40 text-[#EF4444] rounded-md text-[13px] font-medium hover:bg-[#EF4444]/10 transition-all duration-150 cursor-pointer">
              Remove
            </button>
          )}
          <input ref={fileInputRef} type="file" accept={accept} className="hidden" aria-hidden="true" tabIndex={-1} onChange={handleFileChange} />
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION EDITOR — Reusable for Experience, Education
   ═══════════════════════════════════════════════════ */

/** Shared input styling for inline forms */
const formInputClass = "w-full h-9 bg-[#0E0E11] border border-white/[0.08] rounded-[8px] px-3 text-[13px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 font-[family-name:var(--font-inter)]";

function SectionEditor({
  title,
  icon: SectionIcon,
  entries,
  setEntries,
  onSave,
  fieldConfigs,
  emptyEntry,
  renderEntry,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...emptyEntry });

  const openAdd = () => {
    setFormData({ ...emptyEntry });
    setEditingIndex(null);
    setShowForm(true);
  };

  const openEdit = (index) => {
    setFormData({ ...entries[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormData({ ...emptyEntry });
  };

  const handleSave = async () => {
    let updated;
    if (editingIndex !== null) {
      updated = [...entries];
      updated[editingIndex] = { ...formData };
    } else {
      updated = [...entries, { ...formData }];
    }
    setEntries(updated);
    setShowForm(false);
    setEditingIndex(null);
    if (onSave) await onSave(updated);
  };

  const handleDelete = async (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    if (onSave) await onSave(updated);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        {SectionIcon && <SectionIcon size={20} className="text-[#3B82F6]" aria-hidden="true" />}
        <h3 className="text-[18px] font-medium text-white">{title}</h3>
      </div>

      {/* Entry List */}
      <div className="space-y-3 mb-4">
        {entries.length === 0 && !showForm && (
          <p className="text-[13px] text-[#71717A] text-center py-4">No entries yet. Click &quot;Add Entry&quot; to get started.</p>
        )}
        {entries.map((entry, index) =>
          editingIndex === index && showForm ? (
            /* ── Inline Edit Form ── */
            <div key={index} className="bg-[#0E0E11] border border-[#3B82F6]/30 rounded-[12px] p-4 space-y-3">
              {fieldConfigs.map((cfg) => {
                if (cfg.type === "textarea") {
                  return (
                    <div key={cfg.field}>
                      <label className="block text-[12px] text-[#71717A] mb-1 font-medium">{cfg.label}</label>
                      <textarea
                        value={formData[cfg.field] || ""}
                        onChange={(e) => updateField(cfg.field, e.target.value)}
                        placeholder={cfg.placeholder || ""}
                        rows={3}
                        className="w-full min-h-[60px] bg-[#0E0E11] border border-white/[0.08] rounded-[8px] p-2 text-[13px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 resize-y font-[family-name:var(--font-inter)] leading-relaxed"
                      />
                    </div>
                  );
                }
                if (cfg.type === "checkbox") {
                  return (
                    <label key={cfg.field} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[cfg.field] || false}
                        onChange={(e) => {
                          updateField(cfg.field, e.target.checked);
                          if (e.target.checked) updateField(cfg.endDate || "endDate", "");
                        }}
                        className="w-4 h-4 rounded border-white/[0.15] bg-[#0E0E11] text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-0 cursor-pointer accent-[#3B82F6]"
                      />
                      <span className="text-[13px] text-[#A1A1AA]">{cfg.label}</span>
                    </label>
                  );
                }
                if (cfg.type === "select") {
                  return (
                    <div key={cfg.field}>
                      <label className="block text-[12px] text-[#71717A] mb-1 font-medium">{cfg.label}</label>
                      <select
                        value={formData[cfg.field] || ""}
                        onChange={(e) => updateField(cfg.field, e.target.value)}
                        className={`${formInputClass} appearance-none cursor-pointer`}
                      >
                        {(cfg.options || []).map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#0E0E11]">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <div key={cfg.field}>
                    <label className="block text-[12px] text-[#71717A] mb-1 font-medium">{cfg.label}</label>
                    <input
                      type={cfg.type || "text"}
                      value={formData[cfg.field] || ""}
                      onChange={(e) => updateField(cfg.field, e.target.value)}
                      placeholder={cfg.placeholder || ""}
                      disabled={cfg.dependsOn && formData[cfg.dependsOn]}
                      className={`${formInputClass} ${cfg.dependsOn && formData[cfg.dependsOn] ? "opacity-40 cursor-not-allowed" : ""}`}
                    />
                  </div>
                );
              })}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="h-8 px-3 bg-white text-black rounded-[8px] text-[13px] font-medium hover:bg-zinc-200 transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save size={13} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-[8px] text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── Display Card ── */
            <div
              key={index}
              className="bg-[#0E0E11] border border-white/[0.05] rounded-[12px] p-4 flex items-start justify-between gap-4 group hover:border-white/[0.1] transition-all duration-150"
            >
              <div className="min-w-0 flex-1">
                {renderEntry(entry)}
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => openEdit(index)}
                  aria-label="Edit entry"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717A] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all duration-150 cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  aria-label="Delete entry"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-150 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add Form (when not editing) */}
      {showForm && editingIndex === null && (
        <div className="bg-[#0E0E11] border border-[#3B82F6]/30 rounded-[12px] p-4 mb-4 space-y-3">
          {fieldConfigs.map((cfg) => {
            if (cfg.type === "textarea") {
              return (
                <div key={cfg.field}>
                  <label className="block text-[12px] text-[#71717A] mb-1 font-medium">{cfg.label}</label>
                  <textarea
                    value={formData[cfg.field] || ""}
                    onChange={(e) => updateField(cfg.field, e.target.value)}
                    placeholder={cfg.placeholder || ""}
                    rows={3}
                    className="w-full min-h-[60px] bg-[#0E0E11] border border-white/[0.08] rounded-[8px] p-2 text-[13px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 resize-y font-[family-name:var(--font-inter)] leading-relaxed"
                  />
                </div>
              );
            }
            if (cfg.type === "checkbox") {
              return (
                <label key={cfg.field} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[cfg.field] || false}
                    onChange={(e) => {
                      updateField(cfg.field, e.target.checked);
                      if (e.target.checked) updateField(cfg.endDate || "endDate", "");
                    }}
                    className="w-4 h-4 rounded border-white/[0.15] bg-[#0E0E11] text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-0 cursor-pointer accent-[#3B82F6]"
                  />
                  <span className="text-[13px] text-[#A1A1AA]">{cfg.label}</span>
                </label>
              );
            }
            if (cfg.type === "select") {
              return (
                <div key={cfg.field}>
                  <label className="block text-[12px] text-[#71717A] mb-1 font-medium">{cfg.label}</label>
                  <select
                    value={formData[cfg.field] || ""}
                    onChange={(e) => updateField(cfg.field, e.target.value)}
                    className={`${formInputClass} appearance-none cursor-pointer`}
                  >
                    {(cfg.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0E0E11]">{opt.label}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return (
              <div key={cfg.field}>
                <label className="block text-[12px] text-[#71717A] mb-1 font-medium">{cfg.label}</label>
                <input
                  type={cfg.type || "text"}
                  value={formData[cfg.field] || ""}
                  onChange={(e) => updateField(cfg.field, e.target.value)}
                  placeholder={cfg.placeholder || ""}
                  disabled={cfg.dependsOn && formData[cfg.dependsOn]}
                  className={`${formInputClass} ${cfg.dependsOn && formData[cfg.dependsOn] ? "opacity-40 cursor-not-allowed" : ""}`}
                />
              </div>
            );
          })}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="h-8 px-3 bg-white text-black rounded-[8px] text-[13px] font-medium hover:bg-zinc-200 transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Save size={13} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-[8px] text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={openAdd}
          className="w-full h-10 border border-dashed border-white/[0.1] rounded-[10px] text-[13px] text-[#71717A] font-medium hover:text-[#3B82F6] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Plus size={15} /> Add Entry
        </button>
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   CERTIFICATE EDITOR — Custom editor with file upload
   ═══════════════════════════════════════════════════ */
function CertificateEditor({ entries, setEntries, onSave }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", achievingCause: "", description: "", fileUrl: "", fileName: "" });
  const [localFile, setLocalFile] = useState(null);
  const fileInputRef = useRef(null);

  const emptyEntry = { name: "", achievingCause: "", description: "", fileUrl: "", fileName: "" };

  const openAdd = () => {
    setFormData({ ...emptyEntry });
    setLocalFile(null);
    setEditingIndex(null);
    setShowForm(true);
  };

  const openEdit = (index) => {
    const entry = entries[index];
    setFormData({ name: entry.name || "", achievingCause: entry.achievingCause || "", description: entry.description || "", fileUrl: entry.fileUrl || "", fileName: entry.fileName || "" });
    setLocalFile(null);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormData({ ...emptyEntry });
    setLocalFile(null);
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    let fileUrl = formData.fileUrl;
    let fileName = formData.fileName;
    if (localFile) {
      fileUrl = await readFileAsDataUrl(localFile);
      fileName = localFile.name;
    }
    const entry = { name: formData.name, achievingCause: formData.achievingCause, description: formData.description, fileUrl, fileName };
    let updated;
    if (editingIndex !== null) {
      updated = [...entries];
      updated[editingIndex] = entry;
    } else {
      updated = [...entries, entry];
    }
    setEntries(updated);
    setShowForm(false);
    setEditingIndex(null);
    setLocalFile(null);
    setFormData({ ...emptyEntry });
    if (onSave) await onSave(updated);
  };

  const handleDelete = async (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    if (onSave) await onSave(updated);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFile(file);
    setFormData((prev) => ({ ...prev, fileName: file.name }));
  };

  const renderForm = () => (
    <div className="bg-[#0E0E11] border border-[#3B82F6]/30 rounded-[12px] p-4 mb-4 space-y-3">
      <div>
        <label className="block text-[12px] text-[#71717A] mb-1 font-medium">Certificate Name</label>
        <input
          type="text" value={formData.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="e.g. AWS Solutions Architect"
          className={formInputClass}
        />
      </div>
      <div>
        <label className="block text-[12px] text-[#71717A] mb-1 font-medium">Achieving Cause</label>
        <input
          type="text" value={formData.achievingCause || ""}
          onChange={(e) => updateField("achievingCause", e.target.value)}
          placeholder="e.g. Passed the certification exam"
          className={formInputClass}
        />
      </div>
      <div>
        <label className="block text-[12px] text-[#71717A] mb-1 font-medium">Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe the certificate and what you learned..."
          rows={3}
          className="w-full min-h-[60px] bg-[#0E0E11] border border-white/[0.08] rounded-[8px] p-2 text-[13px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 resize-y font-[family-name:var(--font-inter)] leading-relaxed"
        />
      </div>
      <div>
        <label className="block text-[12px] text-[#71717A] mb-1 font-medium">Certificate File</label>
        <div className="flex items-center gap-3">
          <button
            type="button" onClick={() => fileInputRef.current?.click()}
            className="h-9 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-[8px] text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Upload size={13} /> {formData.fileUrl || localFile ? "Replace File" : "Choose File"}
          </button>
          <span className="text-[12px] text-[#71717A] truncate max-w-[200px]">
            {localFile ? localFile.name : formData.fileName || "No file chosen"}
          </span>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" aria-hidden="true" tabIndex={-1} onChange={handleFileChange} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="h-8 px-3 bg-white text-black rounded-[8px] text-[13px] font-medium hover:bg-zinc-200 transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5">
          <Save size={13} /> Save
        </button>
        <button onClick={handleCancel} className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-[8px] text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-1.5">
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <Award size={20} className="text-[#3B82F6]" aria-hidden="true" />
        <h3 className="text-[18px] font-medium text-white">Certificates</h3>
      </div>

      <div className="space-y-3 mb-4">
        {entries.length === 0 && !showForm && (
          <p className="text-[13px] text-[#71717A] text-center py-4">No certificates yet. Click &quot;Add Certificate&quot; to get started.</p>
        )}
        {entries.map((entry, index) =>
          editingIndex === index && showForm ? (
            renderForm()
          ) : (
            <div
              key={index}
              className="bg-[#0E0E11] border border-white/[0.05] rounded-[12px] p-4 flex items-start justify-between gap-4 group hover:border-white/[0.1] transition-all duration-150"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-white font-medium">{entry.name}</p>
                {entry.achievingCause && (
                  <p className="text-[12px] text-[#3B82F6] mt-0.5">{entry.achievingCause}</p>
                )}
                {entry.description && (
                  <p className="text-[13px] text-[#A1A1AA] mt-1.5 line-clamp-2 leading-relaxed">{entry.description}</p>
                )}
                {entry.fileName && (
                  <p className="text-[12px] text-[#71717A] mt-1.5 inline-flex items-center gap-1">
                    <FileText size={11} /> {entry.fileName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => openEdit(index)}
                  aria-label="Edit certificate"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717A] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all duration-150 cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  aria-label="Delete certificate"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-150 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {showForm && editingIndex === null && renderForm()}

      {!showForm && (
        <button
          onClick={openAdd}
          className="w-full h-10 border border-dashed border-white/[0.1] rounded-[10px] text-[13px] text-[#71717A] font-medium hover:text-[#3B82F6] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all duration-150 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Plus size={15} /> Add Certificate
        </button>
      )}
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

  // ── Array section state ──
  const [experienceEntries, setExperienceEntries] = useState([]);
  const [educationEntries, setEducationEntries] = useState([]);
  const [certificatesEntries, setCertificatesEntries] = useState([]);
  const [cvUrl, setCvUrl] = useState("");
  const [cvName, setCvName] = useState("");

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // ═══════════════════════════════════════════════════
  // AVATAR UPLOAD — ImgBB (direct from browser)
  // ═══════════════════════════════════════════════════
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
        const picked = pickFormFields(u);
        setForm(picked);
        setExperienceEntries(picked.experience || []);
        setEducationEntries(picked.education || []);
        setCertificatesEntries(picked.certificates || []);
        setAvatarUrl(u.image || sessionUser?.image || "");
        setResumeUrl(u.resumeUrl || "");
        setResumeName(u.resumeName || "");
        setCvUrl(u.cvUrl || "");
        setCvName(u.cvName || "");
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
        experience: experienceEntries,
        education: educationEntries.map(e => {
          const { schoolType, school, ...rest } = e;
          if (schoolType === "college") return { ...rest, collegeName: school };
          if (schoolType === "university") return { ...rest, universityName: school };
          return { ...rest, school: school || "" };
        }),
        certificates: certificatesEntries,
        cvUrl,
        cvName,
      };

      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        const updatedUser = res.data.user;
        if (isPlainObject(updatedUser)) {
          const picked = pickFormFields(updatedUser);
          setForm(picked);
          setExperienceEntries(picked.experience || []);
          setEducationEntries(picked.education || []);
          setCertificatesEntries(picked.certificates || []);
          setAvatarUrl(updatedUser.image || "");
          setResumeUrl(updatedUser.resumeUrl || "");
          setResumeName(updatedUser.resumeName || "");
          setCvUrl(updatedUser.cvUrl || "");
          setCvName(updatedUser.cvName || "");
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

  /** Save just one array section to the backend */
  const saveSection = async (field, updated) => {
    setSaving(true);
    try {
      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: updated }),
      });
      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        setMessage({ type: "success", text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated!` });
      } else {
        setMessage({ type: "error", text: `Failed to update ${field}.` });
      }
    } catch {
      setMessage({ type: "error", text: `Network error saving ${field}.` });
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

  const handleCvUpload = async (dataUrl, fileName) => {
    setSaving(true);
    try {
      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUrl: dataUrl, cvName: fileName }),
      });
      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        setCvUrl(dataUrl);
        setCvName(fileName);
        setMessage({ type: "success", text: "CV uploaded successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to upload CV." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload CV." });
    } finally {
      setSaving(false);
    }
  };

  const handleCvRemove = async () => {
    setSaving(true);
    try {
      const res = await settingsFetch("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUrl: "", cvName: "" }),
      });
      if (res.ok && isPlainObject(res.data) && !res.data.error) {
        setCvUrl("");
        setCvName("");
        setMessage({ type: "success", text: "CV removed." });
      } else {
        setMessage({ type: "error", text: "Failed to remove CV." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove CV." });
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
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" aria-hidden="true" tabIndex={-1} onChange={handleAvatarChange} />
              <p className="text-[12px] text-[#71717A] mt-2">JPG, PNG, GIF or WebP. Max 5MB.</p>
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

        <div className="space-y-6">
          <FileUploadCard
            resumeName={resumeName}
            resumeUrl={resumeUrl}
            onUpload={handleResumeUpload}
            onRemove={handleResumeRemove}
            title="Resume"
            description="Upload your resume to enhance your profile visibility."
            accept=".pdf,.doc,.docx"
          />
          <FileUploadCard
            resumeName={cvName}
            resumeUrl={cvUrl}
            onUpload={handleCvUpload}
            onRemove={handleCvRemove}
            title="CV"
            description="Upload your CV for additional profile visibility."
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </div>
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

      {/* ═══════════════════════════════════════════════════
         EXPERIENCE SECTION
         ═══════════════════════════════════════════════════ */}
      <SectionEditor
        title="Experience"
        icon={Briefcase}
        entries={experienceEntries}
        setEntries={setExperienceEntries}
        onSave={(updated) => saveSection("experience", updated)}
        emptyEntry={{ company: "", title: "", startDate: "", endDate: "", current: false, description: "" }}
        fieldConfigs={[
          { field: "company", label: "Company Name", placeholder: "e.g. Google" },
          { field: "title", label: "Job Title", placeholder: "e.g. Senior Software Engineer" },
          { field: "startDate", label: "Start Date", type: "month", placeholder: "" },
          { field: "current", label: "Currently working here", type: "checkbox" },
          { field: "endDate", label: "End Date", type: "month", placeholder: "", dependsOn: "current" },
          { field: "description", label: "Description", type: "textarea", placeholder: "Describe your responsibilities and achievements..." },
        ]}
        renderEntry={(entry) => (
          <>
            <p className="text-[14px] text-white font-medium">{entry.title}{entry.company ? ` at ${entry.company}` : ""}</p>
            <p className="text-[12px] text-[#71717A] mt-0.5">
              {formatDate(entry.startDate)} — {entry.current ? "Present" : formatDate(entry.endDate)}
            </p>
            {entry.description && (
              <p className="text-[13px] text-[#A1A1AA] mt-1.5 line-clamp-2 leading-relaxed">{entry.description}</p>
            )}
          </>
        )}
      />

      {/* ═══════════════════════════════════════════════════
         EDUCATION SECTION
         ═══════════════════════════════════════════════════ */}
      <SectionEditor
        title="Education"
        icon={GraduationCap}
        entries={educationEntries}
        setEntries={setEducationEntries}
        onSave={(updated) => saveSection("education", updated.map(e => {
          const { schoolType, school, ...rest } = e;
          if (schoolType === "college") return { ...rest, collegeName: school };
          if (schoolType === "university") return { ...rest, universityName: school };
          return { ...rest, school: school || "" };
        }))}
        emptyEntry={{ schoolType: "", school: "", degree: "", field: "", startDate: "", endDate: "", description: "" }}
        fieldConfigs={[
          { field: "schoolType", label: "Institution Type", type: "select", options: [
            { value: "", label: "Select College or University" },
            { value: "college", label: "College" },
            { value: "university", label: "University" },
          ]},
          { field: "school", label: "College / University Name", placeholder: "e.g. MIT, Dhaka University" },
          { field: "degree", label: "Degree", placeholder: "e.g. Bachelor of Science" },
          { field: "field", label: "Field of Study", placeholder: "e.g. Computer Science" },
          { field: "startDate", label: "Start Date", type: "month", placeholder: "" },
          { field: "endDate", label: "End Date", type: "month", placeholder: "" },
          { field: "description", label: "Description", type: "textarea", placeholder: "Activities, achievements, coursework..." },
        ]}
        renderEntry={(entry) => (
          <>
            <p className="text-[14px] text-white font-medium">{entry.degree}{entry.field ? ` in ${entry.field}` : ""}</p>
            <p className="text-[12px] text-[#71717A] mt-0.5">
              {entry.schoolType === "college" ? "College" : entry.schoolType === "university" ? "University" : ""}{entry.school ? ` · ${entry.school}` : ""}{entry.startDate || entry.endDate ? ` · ${formatDate(entry.startDate)} — ${formatDate(entry.endDate)}` : ""}
            </p>
            {entry.description && (
              <p className="text-[13px] text-[#A1A1AA] mt-1.5 line-clamp-2 leading-relaxed">{entry.description}</p>
            )}
          </>
        )}
      />

      {/* ═══════════════════════════════════════════════════
         CERTIFICATES SECTION
         ═══════════════════════════════════════════════════ */}
      <CertificateEditor
        entries={certificatesEntries}
        setEntries={setCertificatesEntries}
        onSave={(updated) => saveSection("certificates", updated)}
      />
    </div>
  );
}