"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { clientMutation } from "@/lib/core/client";
import { Card, Button } from "@heroui/react";
import { FloppyDisk } from "@gravity-ui/icons";

const AdminSettingsPage = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.image || "",
    password: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const body = {
        name: form.name,
        email: form.email,
        image: form.avatar,
      };
      if (form.password) body.password = form.password;

      const result = await clientMutation("/users/me", body, "PUT");

      if (result && !result.error) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-sm text-zinc-500">
          Manage your admin account settings.
        </p>
      </div>

      <Card className="bg-[#18181b] border border-neutral-800 rounded-2xl p-0">
        <Card.Content className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-purple-400 font-bold text-2xl">
                  {form.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
              <div className="flex-1">
                <label className="text-sm font-medium text-zinc-400 block mb-1.5">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={form.avatar}
                  onChange={(e) => handleChange("avatar", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Admin Name"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-zinc-400 block mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-purple-500 transition-colors placeholder-zinc-600"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`text-sm px-4 py-2.5 rounded-xl ${
                  message.type === "success"
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                    : "bg-rose-950/40 text-rose-400 border border-rose-800/40"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
              >
                <FloppyDisk className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;