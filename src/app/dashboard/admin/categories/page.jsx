"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Tag,
} from "lucide-react";
import { protectedClientFetch, clientMutation, clientDelete, clientFetch } from "@/lib/core/client";

function InlineForm({ initialName = "", initialDesc = "", onSave, onCancel, placeholder }) {
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: desc.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-[#222228] rounded-lg">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder || "Name"}
        className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 outline-none placeholder-[#71717A] min-w-0"
        autoFocus
      />
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optional)"
        className="w-40 bg-transparent text-white text-sm px-2 py-1.5 outline-none placeholder-[#71717A]"
      />
      <button
        type="submit"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors cursor-pointer shrink-0"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-[#71717A] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <X size={14} />
      </button>
    </form>
  );
}

function SkillInlineForm({ initialName = "", initialCategory = "", onSave, onCancel, categories }) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), category: category.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-[#222228] rounded-lg">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill name"
        className="flex-1 bg-transparent text-white text-sm px-2 py-1.5 outline-none placeholder-[#71717A] min-w-0"
        autoFocus
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-[#0E0E11] border border-white/[0.08] rounded-lg text-white text-sm px-2 py-1.5 outline-none appearance-none cursor-pointer shrink-0"
      >
        <option value="">No category</option>
        {categories.map((cat) => (
          <option key={cat._id?.$oid || cat._id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors cursor-pointer shrink-0"
      >
        <Check size={14} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-[#71717A] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <X size={14} />
      </button>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const { data: session, isPending } = useSession();
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [showSkillForm, setShowSkillForm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, skls] = await Promise.all([
        protectedClientFetch("/api/categories"),
        protectedClientFetch("/api/skills"),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setSkills(Array.isArray(skls) ? skls : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending) fetchData();
  }, [isPending, fetchData]);

  // ── Category Actions ──
  const handleCreateCategory = async ({ name, description }) => {
    await clientMutation("/api/categories", { name, description }, "POST");
    setShowCatForm(false);
    fetchData();
  };

  const handleUpdateCategory = async ({ name, description }) => {
    const id = editingCat._id?.$oid || editingCat._id;
    await clientMutation(`/api/categories/${id}`, { name, description }, "PUT");
    setEditingCat(null);
    fetchData();
  };

  const handleDeleteCategory = async (cat) => {
    const id = cat._id?.$oid || cat._id;
    await clientDelete(`/api/categories/${id}`);
    fetchData();
  };

  // ── Skill Actions ──
  const handleCreateSkill = async ({ name, category }) => {
    await clientMutation("/api/skills", { name, category }, "POST");
    setShowSkillForm(false);
    fetchData();
  };

  const handleDeleteSkill = async (skill) => {
    const id = skill._id?.$oid || skill._id;
    await clientDelete(`/api/skills/${id}`);
    fetchData();
  };

  if (isPending || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-32">
          <div className="w-7 h-7 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* ═══ Categories Section ═══ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[42px] font-bold tracking-tight text-white leading-none">
              Categories & Skills
            </h1>
            <p className="text-[#A1A1AA] text-sm mt-2">
              Manage job categories and skills for better organization.
            </p>
          </div>
          <button
            onClick={() => setShowCatForm(true)}
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2.5 rounded-[10px] hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden">
          {/* Add form */}
          {showCatForm && (
            <div className="px-5 pt-4 pb-2 border-b border-white/[0.05]">
              <InlineForm
                placeholder="Category name"
                onSave={handleCreateCategory}
                onCancel={() => setShowCatForm(false)}
              />
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Categories list">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Jobs</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const catId = cat._id?.$oid || cat._id;
                  const isEditing = editingCat && (editingCat._id?.$oid || editingCat._id) === catId;

                  return (
                    <tr key={catId} className="border-b border-white/[0.05] hover:bg-[#222228] transition-colors">
                      <td className="py-3 px-5 text-white font-medium">{cat.name}</td>
                      <td className="py-3 px-5 text-[#A1A1AA] text-sm max-w-[300px] truncate">{cat.description || "—"}</td>
                      <td className="py-3 px-5 text-[#A1A1AA] text-sm">{cat.jobCount ?? "—"}</td>
                      <td className="py-3 px-5">
                        {isEditing ? (
                          <InlineForm
                            initialName={cat.name}
                            initialDesc={cat.description || ""}
                            onSave={handleUpdateCategory}
                            onCancel={() => setEditingCat(null)}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingCat(cat)}
                              className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-[#A1A1AA] hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#71717A] text-sm">
                      No categories yet. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ Skills Section ═══ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-white">Skills</h2>
          <button
            onClick={() => setShowSkillForm(true)}
            className="inline-flex items-center gap-2 bg-[#1B1B1F] border border-white/[0.06] text-[#A1A1AA] text-sm font-medium px-4 py-2.5 rounded-[10px] hover:bg-[#222228] hover:border-white/[0.08] transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Skill
          </button>
        </div>

        <div className="bg-[#1B1B1F] border border-white/[0.05] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.18)] overflow-hidden">
          {/* Add form */}
          {showSkillForm && (
            <div className="px-5 pt-4 pb-2 border-b border-white/[0.05]">
              <SkillInlineForm
                onSave={handleCreateSkill}
                onCancel={() => setShowSkillForm(false)}
                categories={categories}
              />
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Skills list">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left text-[#71717A] font-medium py-3 px-5 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => {
                  const skillId = skill._id?.$oid || skill._id;
                  return (
                    <tr key={skillId} className="border-b border-white/[0.05] hover:bg-[#222228] transition-colors">
                      <td className="py-3 px-5 text-white font-medium">{skill.name}</td>
                      <td className="py-3 px-5">
                        {skill.category ? (
                          <span className="bg-[#3A3A40] text-[#A1A1AA] text-[12px] px-2.5 py-1 rounded-full">
                            {skill.category}
                          </span>
                        ) : (
                          <span className="text-[#71717A] text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <button
                          onClick={() => handleDeleteSkill(skill)}
                          className="inline-flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-[10px] border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-[#71717A] text-sm">
                      No skills yet. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}