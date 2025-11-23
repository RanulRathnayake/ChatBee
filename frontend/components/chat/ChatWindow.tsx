"use client";

import { useEffect, useRef, useState } from "react";
import type { Conversation, Message } from "@/lib/types";
import useSWR, { useSWRConfig } from "swr";
import { api } from "@/lib/apiClient";
import { Spinner } from "@/components/ui/Spinner";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

type Props = {
  conversation: Conversation;
  onLeave?: (conversationId: string) => void;
};

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const ChatWindow = ({ conversation, onLeave }: Props) => {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState("");
  const [leaving, setLeaving] = useState(false);

  const { data, isLoading } = useSWR<Message[]>(
    `/chat/conversations/${conversation.id}/messages`,
    fetcher
  );

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();

       socket.emit("joinConversation", {
      conversationId: conversation.id,
    });

    const onNewMessage = (msg: Message) => {
      if (msg.conversationId !== conversation.id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onEditMessage = (msg: Message) => {
      if (msg.conversationId !== conversation.id) return;

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? msg : m))
      );
    };

    const onDeleteMessage = (payload: { id: string; conversationId: string }) => {
      if (payload.conversationId !== conversation.id) return;

      setMessages((prev) => prev.filter((m) => m.id !== payload.id));
    };

    socket.on("message", onNewMessage);
    socket.on("editMessage", onEditMessage);
    socket.on("deleteMessage", onDeleteMessage);

    return () => {
      socket.off("message", onNewMessage);
      socket.off("editMessage", onEditMessage);
      socket.off("deleteMessage", onDeleteMessage);
    };
  }, [conversation.id]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      conversationId: conversation.id,
      sender:
        user ||
        ({
          id: "me",
          email: "",
          username: "Me",
        } as any),
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.post("/chat/messages", {
        conversationId: conversation.id,
        content,
      });

      const saved: Message = res.data;

      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      );
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  let headerTitle: string;

  if (conversation.isGroup) {
    headerTitle =
      conversation.name && conversation.name.trim().length > 0
        ? conversation.name
        : "Unnamed group";
  } else {
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?.id
    );

    headerTitle =
      otherParticipant?.user.username ??
      conversation.participants[0]?.user.username ??
      "Unknown user";
  }

  const startEdit = (msg: Message) => {
    if (msg.sender.id !== user?.id) return;

    setEditingMessage(msg);
    setEditContent(msg.content);
  };

  const saveEdit = async () => {
    if (!editingMessage) return;
    const trimmed = editContent.trim();
    if (!trimmed) return;

    try {
      const res = await api.patch(`/chat/messages/${editingMessage.id}`, {
        content: trimmed,
      });

      const updated: Message = res.data;

      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );

      setEditingMessage(null);
      setEditContent("");
    } catch (e) {
      console.error("Failed to edit message", e);
    }
  };

  const deleteMessage = async (msg: Message) => {
    if (msg.sender.id !== user?.id) return;

    try {
      await api.delete(`/chat/messages/${msg.id}`);

      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    } catch (e) {
      console.error("Failed to delete message", e);
    }
  };

  const handleLeaveGroup = async () => {
    if (!conversation.isGroup || leaving) return;

    try {
      setLeaving(true);
      await api.post(`/chat/conversations/${conversation.id}/leave`);

      mutate("/chat/conversations");

      if (onLeave) {
        onLeave(conversation.id);
      }
    } catch (e) {
      console.error("Failed to leave group", e);
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            {headerTitle}
          </h2>
        </div>

        {conversation.isGroup && (
          <button
            type="button"
            onClick={handleLeaveGroup}
            disabled={leaving}
            className="text-xs px-3 py-1 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {leaving ? "Leaving..." : "Leave group"}
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-2">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isLoading &&
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMe={m.sender.id === user?.id}
              onEdit={startEdit}
              onDelete={deleteMessage}
            />
          ))}

        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-slate-800 px-4 sm:px-8 py-3">
        <MessageInput onSend={handleSend} />
      </footer>

      {editingMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-50 mb-3">
              Edit message
            </h3>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
                onClick={() => {
                  setEditingMessage(null);
                  setEditContent("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-xs px-3 py-1 rounded-lg bg-sky-500 text-white hover:bg-sky-400"
                onClick={saveEdit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
