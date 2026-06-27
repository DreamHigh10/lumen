import React, { useState, useEffect } from "react";
import { Shield, UserPlus, Trash2, Mail, Users, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  currentEmail: string;
}

export default function AdminPanel({ currentEmail }: AdminPanelProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/emails");
      if (!res.ok) throw new Error("Could not retrieve whitelisted emails.");
      const data = await res.json();
      setEmails(data);
    } catch (err: any) {
      setError(err.message || "Failed to load whitelist.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setError(null);
      setSuccessMessage(null);
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!res.ok) throw new Error("Could not authorize email.");
      const data = await res.json();
      setEmails(data.emails);
      setSuccessMessage(`"${newEmail}" has been granted elite access.`);
      setNewEmail("");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add email.");
    }
  };

  const handleDeleteEmail = async (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === currentEmail.toLowerCase()) {
      alert("You cannot remove your own active email address.");
      return;
    }
    if (!confirm(`Revoke access for "${emailToDelete}"?`)) return;

    try {
      setError(null);
      setSuccessMessage(null);
      const res = await fetch(`/api/emails/${encodeURIComponent(emailToDelete)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to revoke access.");
      const data = await res.json();
      setEmails(data.emails);
      setSuccessMessage(`Access revoked for ${emailToDelete}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Could not delete email.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-850"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="admin-panel-view">
      <div className="bg-stone-900 text-white rounded-xl border border-stone-800 shadow-xl p-6 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-stone-800 rounded-full blur-2xl opacity-40"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-stone-950 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif tracking-tight font-bold text-blue-500">Elite Access Administration</h2>
            <p className="text-xs text-stone-400 mt-1 max-w-xl">
              You are signed in as <strong className="text-stone-200">{currentEmail}</strong>. 
              Only listed students and classmates can interact with your AI Clone. Add or remove access keys below.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form column */}
        <div className="md:col-span-1 bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xs space-y-5">
          <div>
            <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-1.5">
              <UserPlus size={16} /> Grant New Access
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">Authorise a classmate or business partner.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-lg text-xs flex items-center gap-1.5">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-lg text-xs flex items-center gap-1.5">
              <CheckCircle size={14} /> {successMessage}
            </div>
          )}

          <form onSubmit={handleAddEmail} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-500">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. user@domain.com"
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-stone-950 text-stone-100 placeholder-stone-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold py-2 rounded-lg text-xs transition cursor-pointer"
            >
              Authorize Email Key
            </button>
          </form>
        </div>

        {/* Right list column */}
        <div className="md:col-span-2 bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-850 mb-4">
            <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-1.5">
              <Users size={16} /> Authorized Members Whitelist
            </h3>
            <span className="bg-stone-950 border border-stone-850 text-stone-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
              {emails.length} active
            </span>
          </div>

          <div className="divide-y divide-stone-850 max-h-96 overflow-y-auto pr-1">
            {emails.map((email) => {
              const isOwner = email.toLowerCase() === currentEmail.toLowerCase() || email === "ogungbadekehinde19@gmail.com";
              return (
                <div key={email} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isOwner ? "bg-blue-950/40 text-blue-400 font-bold border border-blue-900/40" : "bg-stone-950 border border-stone-850 text-stone-300"
                    }`}>
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-200">{email}</p>
                      <p className="text-[10px] text-stone-550 mt-0.5">
                        {isOwner ? "Owner / Main Educator" : "Approved Student Key"}
                      </p>
                    </div>
                  </div>

                  {!isOwner ? (
                    <button
                      onClick={() => handleDeleteEmail(email)}
                      className="text-stone-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-950/40 transition cursor-pointer"
                      title="Revoke Permission"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <span className="text-[9px] bg-blue-950/40 border border-blue-900/40 text-blue-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      Master Key
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
