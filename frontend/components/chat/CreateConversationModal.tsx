"use client";

import { useState, FormEvent } from "react";
import useSWR from "swr";
import { api } from "@/lib/apiClient";
import type { Conversation, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
};

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const CreateConversationModal = ({ isOpen, onClose, onCreated }: Props) => {
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useSWR<User[]>("/users", fetcher);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetState = () => {
    setSelectedIds([]);
    setGroupName("");
    setMode("direct");
    setError(null);
    setSearch("");
  };

  const handleClose = () => {
    if (submitting) return;
    resetState();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      if (mode === "direct") {
        if (selectedIds.length !== 1) {
          setError("Select exactly one user for a direct chat.");
          setSubmitting(false);
          return;
        }
        const res = await api.post("/chat/conversations/direct", {
          otherUserId: selectedIds[0],
        });
        const conversation: Conversation = res.data;
        onCreated(conversation);
      } else {
        if (!groupName.trim()) {
          setError("Please enter a group name.");
          setSubmitting(false);
          return;
        }
        if (selectedIds.length < 2) {
          setError("Select at least two users for a group.");
          setSubmitting(false);
          return;
        }
        const res = await api.post("/chat/conversations/group", {
          name: groupName.trim(),
          participantIds: selectedIds,
        });
        const conversation: Conversation = res.data;
        onCreated(conversation);
      }

      resetState();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to create conversation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isDirectDisabled = selectedIds.length !== 1;
  const isGroupDisabled = !groupName.trim() || selectedIds.length < 2;

  const filteredUsers =
    users?.filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-sky-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Create chat
            </h2>
          </div>
          <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >x</Button>
        </div>

        <div className="inline-flex rounded-full bg-slate-900 border border-slate-700 mb-4 p-1">
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`px-4 py-1 text-xs rounded-full transition ${
              mode === "direct"
                ? "bg-sky-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setMode("group")}
            className={`px-4 py-1 text-xs rounded-full transition ${
              mode === "group"
                ? "bg-sky-500 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Group
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        
          {mode === "group" && (
            <div className="space-y-1">
              <label className="text-xs 
              uppercase 
              tracking-widest 
              text-slate-400">
                Group name
              </label>
              <input
                className="
                w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g. Project Squad"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs tracking-widest text-slate-400">
              Search user 
            </p>

            <div className="mb-2">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Select user{mode === "group" ? "s" : ""}
            </p>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70">
              {isLoading && (
                <div className="w-full py-6 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <div className="p-4 text-sm text-slate-500">
                  {search.trim()
                    ? "No users match your search."
                    : "No users available."}
                </div>
              )}
              {!isLoading && filteredUsers.length > 0 && (
                <ul className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => {
                    const selected = selectedIds.includes(u.id);
                    return (
                      <li
                        key={u.id}
                        onClick={() => toggleSelect(u.id)}
                        className={`px-4 py-2 flex items-center justify-between cursor-pointer text-sm transition ${
                          selected
                            ? "bg-sky-500/20 text-sky-100"
                            : "hover:bg-slate-900 text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{u.username}</span>
                            <span className="text-[11px] text-slate-400">
                              {u.email}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`h-4 w-4 rounded-sm border ${
                            selected
                              ? "bg-sky-500 border-sky-400"
                              : "border-slate-600"
                          }`}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                (mode === "direct" && isDirectDisabled) ||
                (mode === "group" && isGroupDisabled)
              }
            >
              {submitting
                ? "Creating..."
                : mode === "direct"
                ? "Create direct chat"
                : "Create group"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateConversationModal;
