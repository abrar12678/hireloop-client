"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  HelpCircle,
  Headphones,
  X,
  Upload,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Clock,
  ArrowRight,
  ExternalLink,
  Edit,
  MessageSquare,
  ImageIcon,
  Eye,
} from "lucide-react";
import { createCompany, updateCompany } from "@/lib/action/companies";
import { getLoggedInRecruiterCompany } from "@/lib/api-client/companies";

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

function FormField({ id, label, value, onChange, placeholder = "", type = "text", error, defaultValue = "" }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] text-[#71717A] mb-2 font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={!!error}
        className={`w-full h-10 bg-[#0E0E11] border rounded-[10px] px-3 text-[14px] text-white placeholder:text-[#71717A] outline-none transition-all duration-150 font-[family-name:var(--font-inter)] ${
          error
            ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
            : "border-white/[0.08] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        }`}
      />
      {error && <p className="text-[12px] text-[#EF4444] mt-1">{error}</p>}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
      Verified
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   1. EMPTY STATE
   ═══════════════════════════════════════════════════ */
function EmptyState({ onRegister }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center max-w-[520px]">
        <div className="flex justify-center mb-8">
          <div className="relative w-44 h-44">
            <div className="absolute inset-0 bg-white/[0.03] rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative w-36 h-36 mx-auto bg-[#1B1B1F] border border-white/[0.05] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center justify-center -rotate-3">
              <Building2 size={48} aria-hidden="true" className="text-[#3A3A40]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg" aria-hidden="true">
              <Plus size={22} className="text-black" />
            </div>
          </div>
        </div>

        <h2 className="text-[24px] font-semibold text-white tracking-tight mt-8">
          Company not registered yet
        </h2>

        <p className="text-[14px] text-[#71717A] mt-3 leading-relaxed max-w-[420px] mx-auto">
          Register your company to unlock powerful recruiting tools, post job listings, and build your employer brand on HireLoop.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={onRegister}
            aria-label="Register your company"
            className="w-full sm:w-auto h-10 px-6 bg-white text-black rounded-[10px] text-[14px] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.15)] hover:bg-zinc-200 hover:scale-[1.02] transition-all duration-150 ease-in-out cursor-pointer inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
          >
            Register your company
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <Link
            href="/dashboard/recruiter/billing"
            aria-label="View plans"
            className="w-full sm:w-auto h-10 px-6 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 ease-in-out inline-flex items-center justify-center gap-2"
          >
            <HelpCircle size={16} aria-hidden="true" />
            View Plans
          </Link>
        </div>

        <p className="text-[12px] text-[#71717A] mt-10 flex items-center justify-center gap-1.5">
          <Headphones size={14} aria-hidden="true" />
          Need specialized assistance?{" "}
          <button className="text-[#3B82F6] hover:underline cursor-pointer">Contact our enterprise support team</button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   2. REGISTER / EDIT COMPANY MODAL
   ═══════════════════════════════════════════════════ */
function CompanyModal({ showModal, setShowModal, onSubmit, company, logoUrl, isUploading, handleLogoUpload, errors }) {
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const isEdit = !!company?._id;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") setShowModal(false);
    },
    [setShowModal]
  );

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstInputRef.current?.focus(), 100);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal, handleKeyDown]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit company" : "Register your company"}
        className="w-full max-w-[640px] mx-4 bg-[#1B1B1F] border border-white/[0.05] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] p-6"
        style={{ animation: "slideUp 200ms ease-out" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[18px] font-semibold text-white">{isEdit ? "Edit Company" : "Register Company"}</h3>
            <p className="text-[14px] text-[#71717A] mt-1">{isEdit ? "Update your company profile details." : "Fill in the details to create your company profile."}</p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            aria-label="Close modal"
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#A1A1AA] hover:bg-[#222228] hover:text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField id="companyName" label="Company Name" placeholder="Acme Inc." error={errors.companyName} defaultValue={company?.name || ""} />
            <FormField id="websiteUrl" label="Website URL" type="url" placeholder="https://acme.com" error={errors.websiteUrl} defaultValue={company?.websiteUrl || ""} />
            <FormField id="industry" label="Industry" placeholder="Technology" error={errors.industry} defaultValue={company?.industry || ""} />
            <FormField id="location" label="Location" placeholder="San Francisco, CA" error={errors.location} defaultValue={company?.location || ""} />
            <FormField id="employeeCount" label="Company Size" placeholder="1-10 employees" error={errors.employeeCount} defaultValue={company?.employeeCount || ""} />
          </div>

          {/* Logo Upload */}
          <div className="mt-6">
            <label className="block text-[13px] text-[#71717A] mb-2 font-medium">Company Logo</label>
            <div className="border border-dashed border-white/[0.1] rounded-[12px] p-4 flex items-center gap-4 bg-[#0E0E11] hover:border-white/[0.15] transition-colors duration-150">
              <div className="w-10 h-10 rounded-[10px] bg-[#3A3A40] flex items-center justify-center shrink-0">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={18} aria-hidden="true" className="text-[#71717A]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#A1A1AA]">{logoUrl || company?.logo ? "Logo uploaded" : "Upload your company logo"}</p>
                <p className="text-[12px] text-[#71717A] mt-0.5">PNG, JPG up to 5MB</p>
              </div>
              <label className="h-8 px-3 bg-[#3A3A40] text-[#A1A1AA] rounded-md text-[13px] font-medium hover:bg-[#4A4A52] hover:text-white transition-all duration-150 cursor-pointer inline-flex items-center gap-2">
                <ImageIcon size={14} aria-hidden="true" />
                Browse
                <input
                  ref={firstInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleLogoUpload}
                  aria-label="Choose logo file"
                />
              </label>
            </div>
            {errors.logo && <p className="text-[12px] text-[#EF4444] mt-1">{errors.logo}</p>}
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-[13px] text-[#71717A] mb-2 font-medium">Brief Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell candidates what makes your company special..."
              rows={4}
              className="w-full min-h-[100px] bg-[#0E0E11] border border-white/[0.08] rounded-[10px] p-3 text-[14px] text-white placeholder:text-[#71717A] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all duration-150 resize-y font-[family-name:var(--font-inter)] leading-relaxed"
              defaultValue={company?.description || ""}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.05] mt-6 pt-4 flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Cancel"
              className="h-10 px-4 text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label={isEdit ? "Save changes" : "Submit company registration"}
              className="h-10 px-5 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11]"
            >
              {isEdit ? "Save Changes" : "Register Company"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   3. COMPANY PROFILE PAGE SECTIONS
   ═══════════════════════════════════════════════════ */

function CompanyHero({ company, onEdit }) {
  return (
    <div className="relative h-[220px] rounded-[14px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/20 via-[#8B5CF6]/10 to-transparent" />
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-5">
        {company.logo ? (
          <img
            src={company.logo}
            alt={`${company.name} logo`}
            className="w-20 h-20 rounded-[14px] object-cover border border-white/[0.1] shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-[14px] bg-[#3A3A40] flex items-center justify-center text-white font-bold text-2xl border border-white/[0.1] shadow-lg shrink-0" aria-hidden="true">
            {company.name?.[0] || "C"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-[24px] font-semibold text-white tracking-tight truncate">
              {company.name}
            </h1>
            {company.status === "Approved" && <VerifiedBadge />}
          </div>
          {company.tagline && (
            <p className="text-[14px] text-[#A1A1AA] mt-1">{company.tagline}</p>
          )}
        </div>

        <div className="flex gap-3 shrink-0">
          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${company.name} website`}
              className="h-10 px-4 bg-white text-black rounded-[10px] text-[14px] font-medium hover:bg-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 inline-flex items-center gap-2"
            >
              <Globe size={15} aria-hidden="true" />
              Visit Website
            </a>
          )}
          <button
            onClick={onEdit}
            aria-label="Edit company profile"
            className="h-10 px-4 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] rounded-[10px] text-[14px] font-medium hover:bg-[#222228] hover:text-white transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0E0E11] inline-flex items-center gap-2"
          >
            <Edit size={15} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyStatCard({ value, label }) {
  return (
    <div className="bg-[#0E0E11] border border-white/[0.05] rounded-[12px] p-4 hover:border-white/[0.08] transition-all duration-200">
      <p className="text-[20px] font-semibold text-white">{value}</p>
      <p className="text-[12px] text-[#71717A] mt-1">{label}</p>
    </div>
  );
}

function AboutSection({ company, activeRolesCount, totalApplicants }) {
  return (
    <Card className="lg:col-span-2">
      <h3 className="text-[18px] font-medium text-white mb-4">About</h3>
      <p className="text-[14px] text-[#A1A1AA] leading-relaxed">
        {company.description || `${company.name} is a leading company in the ${company.industry || "technology"} industry, based in ${company.location || "the United States"}. We are committed to building innovative products and fostering a collaborative work environment where talent thrives.`}
      </p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <CompanyStatCard value={activeRolesCount} label="Active Roles" />
        <CompanyStatCard value={totalApplicants} label="Total Applicants" />
        <CompanyStatCard value={company.employeeCount || "—"} label="Company Size" />
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        {company.industry && (
          <span className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[#3A3A40] text-[12px] text-[#A1A1AA]">
            <Briefcase size={12} aria-hidden="true" />
            {company.industry}
          </span>
        )}
        {company.location && (
          <span className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[#3A3A40] text-[12px] text-[#A1A1AA]">
            <MapPin size={12} aria-hidden="true" />
            {company.location}
          </span>
        )}
        {company.websiteUrl && (
          <span className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[#3A3A40] text-[12px] text-[#A1A1AA]">
            <Globe size={12} aria-hidden="true" />
            Website
          </span>
        )}
      </div>
    </Card>
  );
}

function LifeAtCompany({ images }) {
  if (!images || images.length === 0) return null;
  return (
    <Card className="lg:col-span-2 mt-6">
      <h3 className="text-[18px] font-medium text-white mb-4">Life at Company</h3>
      <div className="grid grid-cols-2 gap-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="h-36 rounded-[12px] bg-[#3A3A40] flex items-center justify-center overflow-hidden hover:scale-[1.02] transition-transform duration-200"
            >
            <img src={img} alt={`Company culture ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActiveRolesPanel({ roles }) {
  if (!roles || roles.length === 0) {
    return (
      <Card>
        <h3 className="text-[18px] font-medium text-white mb-4">Active Roles</h3>
        <div className="text-center py-8">
          <Briefcase size={28} className="text-[#3A3A40] mx-auto mb-2" aria-hidden="true" />
          <p className="text-[#71717A] text-[13px]">No active job postings yet.</p>
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="text-[#3B82F6] text-[12px] hover:underline mt-1 inline-block"
          >
            Post your first job
          </Link>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <h3 className="text-[18px] font-medium text-white mb-4">Active Roles</h3>
      <div>
        {roles.map((role, idx) => (
          <div
            key={role._id || idx}
            className={`flex justify-between items-start py-4 ${idx < roles.length - 1 ? "border-b border-white/[0.05]" : ""}`}
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-[14px] font-medium text-white truncate">{role.jobTitle}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[12px] text-[#71717A] inline-flex items-center gap-1">
                  <Briefcase size={11} aria-hidden="true" />
                  {role.jobType || "—"}
                </span>
                <span className="text-[12px] text-[#71717A] inline-flex items-center gap-1">
                  <MapPin size={11} aria-hidden="true" />
                  {role.location || "—"}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <Link
                href={`/dashboard/recruiter/applications?jobId=${role._id}`}
                className="h-8 px-3 bg-white text-black rounded-md text-[12px] font-medium hover:bg-zinc-200 transition-all duration-150 inline-flex items-center gap-1"
              >
                <Eye size={12} aria-hidden="true" />
                {role.applicantCount || 0}
              </Link>
              <p className="text-[10px] text-[#71717A] mt-1 uppercase tracking-wide">Applicants</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function CompanyProfile({ recruiter, recruiterCompany }) {
  const [company, setCompany] = useState(recruiterCompany);
  const [activeRoles, setActiveRoles] = useState([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoUrl, setLogoUrl] = useState(recruiterCompany?.logo || "");
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch real active jobs for this company (only own company's jobs)
  useEffect(() => {
    if (!company?._id) return;
    const fetchJobs = async () => {
      try {
        const { protectedClientFetch } = await import("@/lib/core/client");
        const data = await protectedClientFetch(`/api/jobs?all=true&companyId=${company._id}`);
        const jobs = Array.isArray(data?.jobs) ? data.jobs : Array.isArray(data) ? data : [];
        const active = jobs.filter((j) => j.status === "active");
        setActiveRoles(active);
        const total = active.reduce((sum, j) => sum + (j.applicantCount || 0), 0);
        setTotalApplicants(total);
      } catch (err) {
        console.error("Failed to fetch company jobs:", err);
      }
    };
    fetchJobs();
  }, [company?._id]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, logo: "File size exceeds 5MB limit" }));
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setLogoUrl(data.data.url);
        setErrors((p) => ({ ...p, logo: null }));
      } else {
        setErrors((p) => ({ ...p, logo: "Upload failed. Try again." }));
      }
    } catch {
      setErrors((p) => ({ ...p, logo: "Network error during logo upload" }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const companyName = fd.get("companyName");
    const websiteUrl = fd.get("websiteUrl");
    const location = fd.get("location");

    const newErrors = {};
    if (!companyName) newErrors.companyName = "Company name is required";
    if (!websiteUrl) newErrors.websiteUrl = "Website link is required";
    if (!location) newErrors.location = "Location is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const payload = {
      name: companyName,
      websiteUrl,
      industry: fd.get("industry") || company?.industry || "Technology",
      location,
      employeeCount: fd.get("employeeCount") || company?.employeeCount || "50-200",
      description: fd.get("description") || company?.description || "",
      tagline: fd.get("tagline") || company?.tagline || `Innovation at its best`,
      logo: logoUrl || company?.logo || "",
      status: company?.status || "Active",
      recruiterId: recruiter?.id,
    };

    try {
      if (company?._id) {
        // Update existing company
        const result = await updateCompany(company._id, payload);
        if (result && !result.error) {
          setCompany({ ...company, ...payload });
          setSuccessMsg("Company profile updated successfully!");
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          console.error("Update failed:", result);
        }
      } else {
        // Create new company
        const result = await createCompany(payload);
        if (result?.insertedId) {
          setCompany({ ...payload, _id: result.insertedId });
          setSuccessMsg("Company registered successfully!");
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to save company:", err);
    }
    setErrors({});
    setShowModal(false);
  };

  /* ═══ STATE 1: Empty (no company) ═══ */
  if (!company?._id && !showModal) {
    return (
      <>
        <EmptyState onRegister={() => setShowModal(true)} />
        <CompanyModal
          showModal={showModal}
          setShowModal={setShowModal}
          onSubmit={handleSubmit}
          company={company}
          logoUrl={logoUrl}
          isUploading={isUploading}
          handleLogoUpload={handleLogoUpload}
          errors={errors}
        />
      </>
    );
  }

  /* ═══ STATE 2: Company Profile ═══ */
  return (
    <>
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] text-[14px] font-medium px-5 py-3 rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          {successMsg}
        </div>
      )}
      <div className="space-y-6">
        <CompanyHero company={company} onEdit={() => setShowModal(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AboutSection
            company={company}
            activeRolesCount={activeRoles.length}
            totalApplicants={totalApplicants}
          />
          <LifeAtCompany images={company.images} />

          <div>
            <ActiveRolesPanel roles={activeRoles} />
          </div>
        </div>
      </div>

      <CompanyModal
        showModal={showModal}
        setShowModal={setShowModal}
        onSubmit={handleSubmit}
        company={company}
        logoUrl={logoUrl}
        isUploading={isUploading}
        handleLogoUpload={handleLogoUpload}
        errors={errors}
      />
    </>
  );
}
