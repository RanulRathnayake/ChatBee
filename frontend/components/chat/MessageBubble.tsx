"use client";

import type { Message } from "@/lib/types";
import clsx from "clsx";
import { useEffect, useRef, useState, MouseEvent } from "react";

type Props = {
  message: Message;
  isMe: boolean;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
};

const MessageBubble = ({ message, isMe, onEdit, onDelete }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleContextMenu = (e: MouseEvent) => {
    if (!isMe) return; 
    e.preventDefault();
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent | globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !(containerRef.current as any).contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className={clsx("relative flex w-full", {
        "justify-end": isMe,
        "justify-start": !isMe,
      })}
    >
      <div
        className={clsx(
          "max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-md",
          isMe
            ? "bg-sky-500 text-white rounded-br-sm"
            : "bg-slate-800 text-slate-50 rounded-bl-sm"
        )}
      >
        {!isMe && (
          <p className="text-[10px] text-slate-300 mb-1">
            {message.sender.username}
          </p>
        )}
        <p>{message.content}</p>
        <p className="text-[10px] text-slate-300 mt-1 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {isMe && menuOpen && (
        <div
          className={clsx(
            "absolute z-20 mt-1 w-28 rounded-md border border-slate-700 bg-slate-900 text-xs shadow-lg",
            isMe ? "right-0 top-full" : "left-0 top-full"
          )}
        >
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-slate-800"
            onClick={() => {
              setMenuOpen(false);
              onEdit(message);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-rose-300 hover:bg-rose-950/50"
            onClick={() => {
              setMenuOpen(false);
              onDelete(message);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
