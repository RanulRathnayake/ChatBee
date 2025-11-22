"use client";

import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useState } from "react";
import type { Conversation } from "@/lib/types";

const ChatLayout = () => {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
      />
      <div className="flex-1">
        {activeConversation ? (
          <ChatWindow conversation={activeConversation}
          onLeave={(id) => {
            if (activeConversation.id === id) {
              setActiveConversation(null);
            }    
          }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg font-medium mb-1">
              Pick a conversation to start chatting
            </p>
            <p className="text-sm text-slate-500">
              Your messages will appear here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
