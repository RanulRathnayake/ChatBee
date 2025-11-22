"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  onSend: (content: string) => void;
};

const MessageInput = ({ onSend }: Props) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-slate-900/70 rounded-2xl px-3 py-2 shadow-lg shadow-slate-950/50"
    >
      <input
        className="flex-1 bg-transparent border-none outline-none text-sm text-slate-50 placeholder:text-slate-500"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" className="text-sm px-4 py-2">
        Send
      </Button>
    </form>
  );
};

export default MessageInput;
