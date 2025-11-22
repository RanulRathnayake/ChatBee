"use client";

import type { Conversation } from "@/lib/types";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

type Props = {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
};

const ConversationItem = ({ conversation, active, onClick }: Props) => {
  const { user: currentUser } = useAuth();

  let title: string;

  if (conversation.isGroup) {
    title =
      conversation.name && conversation.name.trim().length > 0
        ? conversation.name
        : "Unnamed group";
  } else {
    
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== currentUser?.id
    );

    title =
      otherParticipant?.user.username ??
      conversation.participants[1]?.user.username ??
      "Unknown user";
  }

  const last = conversation.lastMessage;

  return (
    <li
      onClick={onClick}
      className={clsx(
        "px-4 py-3 cursor-pointer transition flex flex-col gap-1",
        active
          ? "bg-sky-500/10 border-l-2 border-sky-500"
          : "hover:bg-slate-900/70"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-50 truncate">
          {title}
        </p>
        {last && (
          <span className="text-[10px] text-slate-500">
            {new Date(last.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {last && (
        <p className="text-xs text-slate-400 truncate">
          <span className="font-medium">
            {last.sender.username}:{" "}
          </span>
          {last.content}
        </p>
      )}
    </li>
  );
};

export default ConversationItem;
