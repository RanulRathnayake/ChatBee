"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

export const Button = ({ variant = "primary", className, ...rest }: Props) => {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<typeof variant, string> = {
    primary:
      "bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white shadow-lg shadow-sky-500/30",
    outline:
      "border border-slate-600 hover:bg-slate-800 text-slate-50 shadow-sm",
    ghost: "hover:bg-slate-800 text-slate-50",
  };

  return (
    <button className={clsx(base, variants[variant], className)} {...rest} />
  );
};
