"use client";

import useSWR, { useSWRConfig } from "swr";
import { api } from "@/lib/apiClient";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";  
import type { Conversation } from "@/lib/types";
import ConversationItem from "./ConversationItem";
import { useState } from "react";
import CreateConversationModal from "./CreateConversationModal";

type Props = {
  activeConversation: Conversation | null;
  onSelectConversation: (c: Conversation) => void;
};

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const Sidebar = ({ activeConversation, onSelectConversation }: Props) => {
  const { user, logout } = useAuth();     
  const { mutate } = useSWRConfig();

  const [search, setSearch] = useState("");

  const key =
    search.trim().length > 0
      ? `/chat/conversations/search?q=${encodeURIComponent(search.trim())}`
      : "/chat/conversations";

  const { data, isLoading, error } = useSWR<Conversation[]>(key, fetcher);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreated = (conversation: Conversation) => {
    onSelectConversation(conversation);

    mutate("/chat/conversations");
    if (search.trim()) {
      mutate(
        `/chat/conversations/search?q=${encodeURIComponent(search.trim())}`
      );
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <>
      <aside className="w-full max-w-xs border-r border-slate-800 bg-slate-950/80 backdrop-blur flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-200">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col leading-4">
              <span className="text-sm font-semibold text-slate-50">
                {user?.username ?? "User"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="text-xs px-3 py-1"
            onClick={logout}
          >
            Logout
          </Button>
        </div>

        <div className="px-4 py-4 flex items-center justify-between border-b border-slate-800">
          <p className="text-lg font-semibold text-slate-50">Chats</p>

          <Button
            variant="outline"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs px-3 py-1"
            type="button"
          >
            + New
          </Button>
        </div>

        <div className="px-4 pt-3 pb-2 border-b border-slate-800">
          <div className="relative">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-8"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-rose-400">
              Failed to load conversations.
            </div>
          )}

          {!isLoading && !error && data && data.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              No conversations yet. Click &quot;New&quot; to start one.
            </div>
          )}

          <ul className="divide-y divide-slate-800">
            {data?.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                active={activeConversation?.id === c.id}
                onClick={() => onSelectConversation(c)}
              />
            ))}
          </ul>
        </div>
      </aside>

      {isCreateOpen && (
        <CreateConversationModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
};

export default Sidebar;
