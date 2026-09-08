"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserCircle,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Check,
  X,
  Lock,
  LogOut,
  Activity,
  Zap,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { ApiService } from "@/lib/api";
import { AnalyticsOverview } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();

  // Edit profile state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Stats
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    ApiService.fetchAnalytics()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) setEditName(user.name);
  }, [user]);

  const handleSaveName = async () => {
    if (!token || !editName.trim()) return;
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await ApiService.updateProfile(token, { name: editName.trim() });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      setIsEditingName(false);
      // Refresh page to update user context
      window.location.reload();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMsg(null);
    try {
      await ApiService.changePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to change password" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-[#8E92A0]">Loading profile...</p>
      </div>
    );
  }

  const accountStats = [
    {
      label: "Total Sessions",
      value: stats ? formatNumber(stats.total_sessions) : "—",
      icon: Activity,
      color: "text-[#6C35F7]",
    },
    {
      label: "Reports",
      value: stats ? formatNumber(stats.total_reports) : "—",
      icon: FileText,
      color: "text-emerald-400",
    },
    {
      label: "Tokens Used",
      value: stats ? formatNumber(stats.total_tokens) : "—",
      icon: Zap,
      color: "text-amber-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#C0C0C0] mb-1">
          <UserCircle className="w-3.5 h-3.5 text-[#6C35F7]" />
          <span>Account Management</span>
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-extrabold text-white">
          Your Profile
        </h1>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#1A1C22] border border-white/10 rounded-xl overflow-hidden"
      >
        {/* Top gradient line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#6C35F7] to-transparent" />

        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-20 h-20 rounded-full ring-2 ring-[#6C35F7]/40 ring-offset-2 ring-offset-[#1A1C22]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#6C35F7]/20 border-2 border-[#6C35F7]/50 flex items-center justify-center text-2xl font-bold text-[#A78BFA]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-[#141426] border border-[#6C35F7]/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C35F7]/30"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingProfile}
                      className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setIsEditingName(false); setEditName(user.name); }}
                      className="p-1.5 rounded-md bg-white/5 text-[#8E92A0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 rounded text-[#8E92A0] hover:text-[#6C35F7] transition-colors cursor-pointer"
                      title="Edit name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-[#C0C0C0]">
                  <Mail className="w-3.5 h-3.5 text-[#8E92A0]" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C0C0C0]">
                  <Shield className="w-3.5 h-3.5 text-[#8E92A0]" />
                  <Badge variant="purple" size="sm">{user.role || "Analyst"}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C0C0C0]">
                  <Calendar className="w-3.5 h-3.5 text-[#8E92A0]" />
                  <span className="text-xs text-[#8E92A0]">Member since {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile update message */}
          {profileMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs ${
                profileMsg.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {profileMsg.text}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {accountStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#1A1C22] border border-white/10 rounded-xl p-4 text-center"
            >
              <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-white font-heading">{stat.value}</p>
              <p className="text-[10px] text-[#8E92A0] font-mono uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#1A1C22] border border-white/10 rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#6C35F7]" />
            Security
          </h3>
        </div>

        <div className="p-5 space-y-4">
          {/* Change Password */}
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-3 text-sm text-[#C0C0C0] hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#6C35F7]/10 transition-colors">
                <Lock className="w-4 h-4 text-[#8E92A0] group-hover:text-[#6C35F7] transition-colors" />
              </div>
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-[11px] text-[#8E92A0]">Update your account password</p>
              </div>
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleChangePassword}
              className="space-y-3 bg-[#141426] rounded-xl p-4 border border-white/10"
            >
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E92A0] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E92A0] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7]/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8E92A0] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-[#1A1C22] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#6C35F7] focus:ring-1 focus:ring-[#6C35F7]/30 transition-all"
                />
              </div>

              {passwordMsg && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {passwordMsg.text}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" variant="primary" size="sm" disabled={isSavingPassword}>
                  {isSavingPassword ? "Saving..." : "Update Password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordMsg(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}

          {/* Logout */}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm text-rose-400 hover:text-rose-300 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-[11px] text-[#8E92A0]">End your current session</p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
