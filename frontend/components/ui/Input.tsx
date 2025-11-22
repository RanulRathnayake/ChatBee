"use client";

import { InputHTMLAttributes } from "react";
import clsx from "clsx";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, className, ...rest }: Props) => {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-xs uppercase tracking-wider text-slate-300">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500",
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
};
