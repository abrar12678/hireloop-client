"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Form,
  Fieldset,
  TextField,
  TextArea,
  Label,
  Input,
  FieldError,
  Select,
  ListBox,
  Button,
  toast,
} from "@heroui/react";
import {
  ArrowUpToLine,
  Globe,
  ChevronDown,
  Pencil,
  MapPin,
  Persons,
  Briefcase,
  Clock,
  ArrowRight,
  Xmark,
  CircleQuestion,
  Headphones,
} from "@gravity-ui/icons";
import { createCompany } from "@/lib/action/companies";
import Link from "next/link";

/* ─── shared form style constants ─── */
const textInputClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg px-3 py-2.5 outline-none placeholder:text-zinc-600 focus:border-zinc-700 transition";
const selectBoxClass = "w-full flex flex-col gap-1";
const triggerClasses =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg px-3 py-2.5 flex items-center justify-between outline-none data-[hover=true]:border-zinc-700";
const popoverClasses =
  "bg-zinc-950 border border-zinc-800 rounded-lg p-1 shadow-xl min-w-[200px]";
const listItemClasses =
  "text-zinc-300 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-900 hover:text-white outline-none data-[focused=true]:bg-zinc-900";
const textAreaClass =
  "w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-lg p-3 outline-none placeholder:text-zinc-600 focus:border-zinc-700 transition resize-none";

/* ─── mock data for the profile view ─── */
const mockJobs = [
  { title: "Senior Frontend Developer", type: "Full-time", location: "Remote", applicants: 42, posted: "2 days ago" },
  { title: "Product Designer", type: "Full-time", location: "San Francisco, CA", applicants: 28, posted: "5 days ago" },
  { title: "Backend Engineer", type: "Contract", location: "New York, NY", applicants: 35, posted: "1 week ago" },
];

const mockTeam = [
  { name: "David Kim", role: "Engineering Manager", initials: "DK" },
  { name: "Lisa Zhang", role: "HR Lead", initials: "LZ" },
  { name: "Ryan Foster", role: "Senior Recruiter", initials: "RF" },
  { name: "Maria Santos", role: "Design Lead", initials: "MS" },
];

/* ════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════ */

export default function CompanyProfile({ recruiter, recruiterCompany }) {
  const [company, setCompany] = useState(recruiterCompany);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  /* ── upload handler ── */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
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
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: "POST", body: formData }
      );
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

  /* ── submit handler ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const companyName = fd.get("companyName");
    const websiteUrl = fd.get("websiteUrl");
    const industry = fd.get("industry");
    const location = fd.get("location");
    const employeeCount = fd.get("employeeCount");
    const description = fd.get("description");

    const newErrors = {};
    if (!companyName) newErrors.companyName = "Company name is required";
    if (!websiteUrl) newErrors.websiteUrl = "Website link is required";
    if (!location) newErrors.location = "Location is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: companyName,
      websiteUrl,
      industry: industry || "Technology",
      location,
      employeeCount: employeeCount || "1-10 employees",
      description,
      logo: logoUrl || (company ? company.logo : ""),
      status: company?.status || "Pending",
      recruiterId: recruiter.id,
    };
    setCompany(payload);

    const result = await createCompany(payload);
    if (result.insertedId) {
      const saved = { ...payload, _id: result.insertedId };
      setCompany(saved);
      toast.success("Company profile created successfully!");
    }
    setErrors({});
    setIsEditing(false);
    setShowModal(false);
  };

  /* ═══════════════════════════════════════════════════════════════
     VIEW 1 — Empty State (no company registered)
     ═══════════════════════════════════════════════════════════════ */
  if (!company?._id && !isEditing && !showModal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md space-y-8"
        >
          {/* Illustration */}
          <div className="flex justify-center">
            <div className="relative w-24 h-28">
              <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="text-zinc-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#00D4AA] flex items-center justify-center shadow-lg shadow-[#00D4AA]/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              Company not registered yet
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Register your company to unlock powerful recruiting tools, post job
              listings, and build your employer brand on HireLoop.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              Register your company
              <ArrowRight className="size-4" />
            </button>
            <Link
              href="/plans"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
            >
              <CircleQuestion className="size-4" />
              View FAQ
            </Link>
          </div>

          {/* Support */}
          <p className="text-xs text-zinc-600 flex items-center justify-center gap-1.5">
            <Headphones className="size-3.5" />
            Need specialized assistance?{" "}
            <button className="text-[#00D4AA] hover:underline">
              Contact our enterprise support team
            </button>
          </p>
        </motion.div>

        {/* ── Register Company Modal ── */}
        <AnimatePresence>
          {showModal && (
            <RegisterCompanyModal
              showModal={showModal}
              setShowModal={setShowModal}
              errors={errors}
              setErrors={setErrors}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              isUploading={isUploading}
              handleLogoUpload={handleLogoUpload}
              handleSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     VIEW 2 — Company Profile (registered)
     ═══════════════════════════════════════════════════════════════ */
  if (company && !isEditing) {
    return (
      <div className="space-y-6">
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-48 md:h-56 rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D4AA]/20 via-[#6366F1]/20 to-[#00D4AA]/10" />
          <div className="absolute inset-0 bg-[#18181b]/60" />
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Company info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-5">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F59E0B]/40 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-amber-400/40 shadow-xl">
                {company.name?.[0] || "C"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white truncate">
                  {company.name}
                </h1>
                {company.industry && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
                    {company.industry}
                  </span>
                )}
              </div>
              {company.websiteUrl && (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-zinc-300/70 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Globe className="size-3.5" />
                  {company.websiteUrl}
                </a>
              )}
            </div>
            <button
              onClick={() => {
                setLogoUrl(company.logo);
                setIsEditing(true);
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors backdrop-blur-sm"
            >
              <Pencil className="size-4" />
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* ── About + Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-6 space-y-5"
        >
          <h3 className="text-base font-semibold text-white">About</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {company.description ||
              "We are a forward-thinking company committed to innovation and excellence. Our team is passionate about building products that make a difference."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#00D4AA]/10 flex items-center justify-center">
                <Briefcase className="size-4 text-[#00D4AA]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {company.employeeCount || "—"}
                </p>
                <p className="text-[11px] text-zinc-500">Employees</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <MapPin className="size-4 text-[#6366F1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {company.location || "—"}
                </p>
                <p className="text-[11px] text-zinc-500">Location</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                <Persons className="size-4 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">18</p>
                <p className="text-[11px] text-zinc-500">Open Roles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <Clock className="size-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">5 yrs</p>
                <p className="text-[11px] text-zinc-500">Founded</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Life at Company (Image Grid) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-white">Life at {company.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "bg-gradient-to-br from-[#00D4AA]/20 to-[#6366F1]/20",
              "bg-gradient-to-br from-[#F59E0B]/20 to-[#EF4444]/20",
              "bg-gradient-to-br from-[#6366F1]/20 to-[#00D4AA]/20",
              "bg-gradient-to-br from-[#10B981]/20 to-[#F59E0B]/20",
            ].map((bg, i) => (
              <div
                key={i}
                className={`${bg} rounded-xl aspect-[4/3] flex items-center justify-center border border-white/[0.04]`}
              >
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-white/50"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"
                      />
                    </svg>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium">
                    {["Office", "Team Event", "Workshop", "Culture"][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Active Roles ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Active Roles</h3>
            <Link
              href="/dashboard/recruiter/jobs"
              className="text-xs font-medium text-[#00D4AA] hover:text-[#00D4AA]/80 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {mockJobs.map((job, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/[0.03] border border-zinc-800/40 hover:border-zinc-700/60 transition-colors group"
              >
                <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-[#00D4AA] transition-colors">
                  {job.title}
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 text-[11px] font-medium">
                    {job.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 text-[11px] font-medium">
                    {job.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {job.applicants} applicants
                  </span>
                  <span className="text-[11px] text-zinc-600">{job.posted}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Hiring Team ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#18181b] border border-zinc-800/60 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-white">Hiring Team</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mockTeam.map((member, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-white/[0.02] border border-zinc-800/30"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00D4AA]/30 to-[#6366F1]/30 flex items-center justify-center text-white font-bold text-sm mb-3 ring-2 ring-white/[0.06]">
                  {member.initials}
                </div>
                <h4 className="text-sm font-semibold text-white">
                  {member.name}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     VIEW 3 — Edit Form (inline)
     ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="max-w-3xl mx-auto my-8 bg-zinc-950 p-8 border border-zinc-900 rounded-xl">
        <Form
          onSubmit={handleSubmit}
          className="space-y-8"
          validationErrors={errors}
          validationBehavior="aria"
        >
          <Fieldset className="space-y-6 w-full">
            <legend className="text-xl font-semibold text-zinc-200 border-b border-zinc-900 w-full pb-3 mb-2">
              {company ? "Update Company Profile" : "Register New Company"}
            </legend>

            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                name="companyName"
                defaultValue={company?.name || ""}
                isInvalid={!!errors.companyName}
                className="flex flex-col gap-1 w-full"
              >
                <Label className="text-zinc-400 font-medium text-sm">Company Name</Label>
                <Input placeholder="e.g. Acme Corp" className={textInputClass} />
                {errors.companyName && (
                  <FieldError className="text-xs text-danger mt-1">{errors.companyName}</FieldError>
                )}
              </TextField>

              <Select
                className={selectBoxClass}
                name="industry"
                defaultSelectedKeys={[company?.industry || "technology"]}
              >
                <Label className="text-zinc-400 font-medium text-sm mb-1 block">Industry / Category</Label>
                <Select.Trigger className={triggerClasses}>
                  <Select.Value className="text-white placeholder:text-zinc-600" />
                  <Select.Indicator>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className={popoverClasses}>
                  <ListBox className="outline-none">
                    {["Technology", "Design", "Marketing", "Finance", "Healthcare", "Education"].map((v) => (
                      <ListBox.Item key={v.toLowerCase()} id={v.toLowerCase()} className={listItemClasses} textValue={v}>
                        {v}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                name="websiteUrl"
                defaultValue={company?.websiteUrl || ""}
                isInvalid={!!errors.websiteUrl}
                className="flex flex-col gap-1 w-full"
              >
                <Label className="text-zinc-400 font-medium text-sm">Website URL</Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-600 text-sm font-medium select-none pointer-events-none border-r border-zinc-800 pr-2">
                    https://
                  </span>
                  <Input placeholder="www.company.com" className={`${textInputClass} pl-20`} />
                </div>
                {errors.websiteUrl && (
                  <FieldError className="text-xs text-danger mt-1">{errors.websiteUrl}</FieldError>
                )}
              </TextField>

              <TextField
                name="location"
                defaultValue={company?.location || ""}
                isInvalid={!!errors.location}
                className="flex flex-col gap-1 w-full"
              >
                <Label className="text-zinc-400 font-medium text-sm">Location</Label>
                <div className="relative flex items-center">
                  <Globe size={16} className="absolute left-3 text-zinc-600 pointer-events-none z-10" />
                  <Input placeholder="City, Country" className={`${textInputClass} pl-10`} />
                </div>
                {errors.location && (
                  <FieldError className="text-xs text-danger mt-1">{errors.location}</FieldError>
                )}
              </TextField>
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Select
                className={selectBoxClass}
                name="employeeCount"
                defaultSelectedKeys={[company?.employeeCount || "1-10"]}
              >
                <Label className="text-zinc-400 font-medium text-sm mb-1 block">Employee Count Range</Label>
                <Select.Trigger className={triggerClasses}>
                  <Select.Value className="text-white" />
                  <Select.Indicator>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className={popoverClasses}>
                  <ListBox className="outline-none">
                    {[
                      { id: "1-10", label: "1-10 employees" },
                      { id: "11-50", label: "11-50 employees" },
                      { id: "51-200", label: "51-200 employees" },
                      { id: "201+", label: "201+ employees" },
                    ].map((item) => (
                      <ListBox.Item key={item.id} id={item.id} className={listItemClasses} textValue={item.label}>
                        {item.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <div className="flex flex-col gap-1 w-full">
                <span className="text-zinc-400 font-medium text-sm">Company Logo</span>
                <div className="flex items-center gap-4 mt-1">
                  <label className="w-14 h-14 border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden">
                    <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="hidden" />
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ArrowUpToLine size={18} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    )}
                  </label>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-300">
                      {isUploading ? "Uploading file..." : "Upload image"}
                    </span>
                    <span className="text-xs text-zinc-600 mt-0.5">PNG, JPG up to 5MB</span>
                    {errors.logo && <span className="text-xs text-danger mt-1">{errors.logo}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4 */}
            <TextField
              name="description"
              defaultValue={company?.description || ""}
              className="flex flex-col gap-1 w-full"
            >
              <Label className="text-zinc-400 font-medium text-sm">Brief Description</Label>
              <TextArea
                placeholder="Tell us about your company's mission and culture..."
                rows={4}
                className={textAreaClass}
              />
            </TextField>
          </Fieldset>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-900 w-full">
            <Button
              type="button"
              variant="bordered"
              onPress={() => {
                setIsEditing(false);
                setShowModal(false);
              }}
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-lg px-5 font-medium h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black font-semibold hover:bg-zinc-200 rounded-lg px-6 transition-colors h-11"
            >
              {company ? "Save Updates" : "Register Company"}
            </Button>
          </div>
        </Form>
      </div>

      {/* Modal overlay for editing (keeps edit within page context) */}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Register Company Modal
   ═══════════════════════════════════════════════════════════════ */

function RegisterCompanyModal({
  showModal,
  setShowModal,
  errors,
  setErrors,
  logoUrl,
  setLogoUrl,
  isUploading,
  handleLogoUpload,
  handleSubmit,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[60%] max-h-[90vh] overflow-y-auto bg-[#18181b] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Xmark className="size-4" />
        </button>

        <Form
          onSubmit={handleSubmit}
          className="space-y-8"
          validationErrors={errors}
          validationBehavior="aria"
        >
          <Fieldset className="space-y-6 w-full">
            <legend className="text-xl font-semibold text-white border-b border-zinc-800/60 w-full pb-3 mb-2">
              Register New Company
            </legend>

            {/* ROW 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                name="companyName"
                isInvalid={!!errors.companyName}
                className="flex flex-col gap-1 w-full"
              >
                <Label className="text-zinc-400 font-medium text-sm">Company Name</Label>
                <Input placeholder="e.g. Acme Corp" className={textInputClass} />
                {errors.companyName && (
                  <FieldError className="text-xs text-danger mt-1">{errors.companyName}</FieldError>
                )}
              </TextField>

              <Select className={selectBoxClass} name="industry" defaultSelectedKeys={["technology"]}>
                <Label className="text-zinc-400 font-medium text-sm mb-1 block">Industry / Category</Label>
                <Select.Trigger className={triggerClasses}>
                  <Select.Value className="text-white placeholder:text-zinc-600" />
                  <Select.Indicator>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className={popoverClasses}>
                  <ListBox className="outline-none">
                    {["Technology", "Design", "Marketing", "Finance", "Healthcare", "Education"].map((v) => (
                      <ListBox.Item key={v.toLowerCase()} id={v.toLowerCase()} className={listItemClasses} textValue={v}>
                        {v}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            {/* ROW 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                name="websiteUrl"
                isInvalid={!!errors.websiteUrl}
                className="flex flex-col gap-1 w-full"
              >
                <Label className="text-zinc-400 font-medium text-sm">Website URL</Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-zinc-600 text-sm font-medium select-none pointer-events-none border-r border-zinc-800 pr-2">
                    https://
                  </span>
                  <Input placeholder="www.company.com" className={`${textInputClass} pl-20`} />
                </div>
                {errors.websiteUrl && (
                  <FieldError className="text-xs text-danger mt-1">{errors.websiteUrl}</FieldError>
                )}
              </TextField>

              <TextField
                name="location"
                isInvalid={!!errors.location}
                className="flex flex-col gap-1 w-full"
              >
                <Label className="text-zinc-400 font-medium text-sm">Location</Label>
                <div className="relative flex items-center">
                  <Globe size={16} className="absolute left-3 text-zinc-600 pointer-events-none z-10" />
                  <Input placeholder="City, Country" className={`${textInputClass} pl-10`} />
                </div>
                {errors.location && (
                  <FieldError className="text-xs text-danger mt-1">{errors.location}</FieldError>
                )}
              </TextField>
            </div>

            {/* ROW 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Select className={selectBoxClass} name="employeeCount" defaultSelectedKeys={["1-10"]}>
                <Label className="text-zinc-400 font-medium text-sm mb-1 block">Employee Count Range</Label>
                <Select.Trigger className={triggerClasses}>
                  <Select.Value className="text-white" />
                  <Select.Indicator>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className={popoverClasses}>
                  <ListBox className="outline-none">
                    {[
                      { id: "1-10", label: "1-10 employees" },
                      { id: "11-50", label: "11-50 employees" },
                      { id: "51-200", label: "51-200 employees" },
                      { id: "201+", label: "201+ employees" },
                    ].map((item) => (
                      <ListBox.Item key={item.id} id={item.id} className={listItemClasses} textValue={item.label}>
                        {item.label}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <div className="flex flex-col gap-1 w-full">
                <span className="text-zinc-400 font-medium text-sm">Company Logo</span>
                <div className="flex items-center gap-4 mt-1">
                  <label className="w-14 h-14 border border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group relative overflow-hidden">
                    <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="hidden" />
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ArrowUpToLine size={18} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    )}
                  </label>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-300">
                      {isUploading ? "Uploading file..." : "Upload image"}
                    </span>
                    <span className="text-xs text-zinc-600 mt-0.5">PNG, JPG up to 5MB</span>
                    {errors.logo && <span className="text-xs text-danger mt-1">{errors.logo}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4 — Full Width */}
            <TextField name="description" className="flex flex-col gap-1 w-full">
              <Label className="text-zinc-400 font-medium text-sm">Brief Description</Label>
              <TextArea
                placeholder="Tell us about your company's mission and culture..."
                rows={4}
                className={textAreaClass}
              />
            </TextField>
          </Fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-800/60 w-full">
            <Button
              type="button"
              variant="bordered"
              onPress={() => setShowModal(false)}
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-lg px-5 font-medium h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black font-semibold hover:bg-zinc-200 rounded-lg px-6 transition-colors h-11"
            >
              Register Company
            </Button>
          </div>
        </Form>
      </motion.div>
    </motion.div>
  );
}