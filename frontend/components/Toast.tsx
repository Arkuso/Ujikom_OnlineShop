"use client";

import { useToastStore } from "@/lib/useToaststore";
import { useEffect, useState } from "react";

export default function Toast() {
  const { isVisible, message, type, hideToast } = useToastStore();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Wait for transition to finish
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!shouldRender && !isVisible) return null;

  return (
    <div
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border transition-all duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3 backdrop-blur-xl ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-8 scale-95"
      } ${
        type === "success"
          ? "bg-[#171717]/90 text-white border-white/10"
          : "bg-rose-600/90 text-white border-rose-500/50"
      }`}
    >
      {type === "success" ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg">
          <svg
            className="w-3 h-3 text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
      <span className="text-sm font-['Vercetti-Regular'] tracking-wide font-medium whitespace-nowrap">
        {message}
      </span>
      <button 
        onClick={hideToast}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <svg className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
