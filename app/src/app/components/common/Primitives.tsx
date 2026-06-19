import type React from 'react';
import { C } from '../../constants/design';

// ── Step Indicator ────────────────────────────────────────────────────────
export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i < current ? 28 : 10,
            height: 10,
            borderRadius: 5,
            background: i < current ? C.primary : C.line,
            transition: "all 0.3s",
          }}
        />
      ))}
      <span className="text-xs ml-1" style={{ color: C.textSub }}>{current}/{total}</span>
    </div>
  );
}

// ── Prompt Panel ──────────────────────────────────────────────────────────
export function PromptPanel({ text, keywords }: { text: string; keywords: Record<string, string> }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <div
      className="rounded-xl p-5 h-full"
      style={{ background: "#f0f7ff", border: `1px solid ${C.primaryLight}` }}
    >
      <p className="text-sm font-semibold mb-3" style={{ color: C.primary }}>실시간 AI 주문서</p>
      <p className="text-sm leading-relaxed" style={{ color: C.textBody }}>
        {parts.map((part, i) => {
          const isKey = part.startsWith("[") && part.endsWith("]");
          const key = isKey ? part.slice(1, -1) : null;
          return isKey ? (
            <span key={i} className="font-semibold px-1 rounded" style={{ color: C.primary, background: C.primaryLight }}>
              {keywords[key!] || part}
            </span>
          ) : <span key={i}>{part}</span>;
        })}
      </p>
    </div>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────
export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer"
      style={{
        background: selected ? C.primaryLight : C.surface,
        border: `1.5px solid ${selected ? C.primary : C.line}`,
        color: selected ? C.primary : C.textBody,
      }}
    >
      {selected && <span className="mr-1">✓</span>}{label}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{ background: C.surface, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", ...style }}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
