import { useState, useCallback, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "landing" | "auth-modal"
  | "beg-step1" | "beg-step2" | "beg-step3" | "beg-step4"
  | "beg-result" | "beg-detail"
  | "exp-step1" | "exp-step2" | "exp-step3" | "exp-step4" | "exp-step5"
  | "exp-result" | "exp-detail"
  | "adm-dashboard" | "adm-monitoring" | "adm-rate-limit"
  | "adm-master" | "adm-product-edit" | "adm-csv" | "adm-category"
  | "adm-keywords" | "adm-swap-report" | "adm-funnel"
  | "dev-hub";

// ── Design Tokens ──────────────────────────────────────────────────────────
const C = {
  primary: "#0075d5",
  primaryHover: "#005fae",
  primaryLight: "#e6f2fc",
  error: "#D32F2F",
  success: "#2e7d32",
  warning: "#f9a825",
  textStrong: "#1a1a1a",
  textBody: "#333333",
  textSub: "#888888",
  line: "#e0e0e0",
  bg: "#f7f9fc",
  surface: "#ffffff",
};

// ── Shared Styles ──────────────────────────────────────────────────────────
const btn = {
  primary: `inline-flex items-center justify-center px-6 h-11 rounded-md text-sm font-semibold text-white transition-all duration-200 cursor-pointer select-none`,
  secondary: `inline-flex items-center justify-center px-6 h-11 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer select-none border`,
  danger: `inline-flex items-center justify-center px-6 h-11 rounded-md text-sm font-semibold text-white transition-all duration-200 cursor-pointer select-none`,
};

// ── GNB ───────────────────────────────────────────────────────────────────
function GNB({ current, navigate }: { current: Screen; navigate: (s: Screen) => void }) {
  const isExpert = current.startsWith("exp-");
  const isBeg = !isExpert && current !== "landing" && !current.startsWith("adm") && current !== "dev-hub";
  const isLanding = current === "landing";
  return (
    <header
      style={{
        height: 64,
        background: isLanding ? "rgba(8,14,28,0.92)" : C.surface,
        backdropFilter: isLanding ? "blur(12px)" : "none",
        borderBottom: isLanding ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${C.line}`,
        position: "sticky", top: 0, zIndex: 100,
      }}
      className="flex items-center px-8 gap-6"
    >
      {/* Logo */}
      <button onClick={() => navigate("landing")} className="flex items-center gap-2 shrink-0 mr-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black" style={{ background: C.primary }}>P</div>
        <span className="font-bold text-base" style={{ color: isLanding ? "#fff" : C.textStrong }}>팝콘PC AI</span>
      </button>
      {/* Center nav */}
      <nav className="flex gap-1 flex-1">
        {[
          { label: "초급자 모드", action: () => navigate("beg-step1"), active: isBeg },
          { label: "고급자 모드", action: () => navigate("exp-step1"), active: isExpert },
        ].map(item => (
          <button key={item.label} onClick={item.action}
            className="px-4 h-9 rounded-md text-sm font-semibold transition-all"
            style={{
              background: item.active ? C.primaryLight : "transparent",
              color: item.active ? C.primary : isLanding ? "rgba(255,255,255,0.7)" : C.textSub,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("auth-modal")} className="px-4 h-9 rounded-md text-sm font-medium transition-all"
          style={{ color: isLanding ? "rgba(255,255,255,0.7)" : C.textSub }}>
          로그인
        </button>
        <button onClick={() => navigate("auth-modal")}
          className="px-4 h-9 rounded-md text-sm font-semibold transition-all"
          style={{ background: isLanding ? "rgba(255,255,255,0.12)" : C.bg, color: isLanding ? "#fff" : C.textBody, border: isLanding ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${C.line}` }}>
          회원가입
        </button>
        <button onClick={() => navigate("adm-dashboard")} className="px-3 h-9 rounded-md text-xs font-semibold"
          style={{ color: isLanding ? "rgba(255,255,255,0.4)" : C.textSub }}>관리자</button>
        <button onClick={() => navigate("dev-hub")} className="px-3 h-9 rounded-md text-xs font-semibold"
          style={{ background: "#1a1a1a", color: "#fff" }}>DEV</button>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#080e1c", color: "rgba(255,255,255,0.5)" }}>
      <div className="max-w-6xl mx-auto px-8 py-12 grid gap-8" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-black" style={{ background: C.primary }}>P</div>
            <span className="font-bold text-white text-sm">팝콘PC AI</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            3대 AI가 병렬로 분석하고<br />팝콘PC 실재고로 검증한 맞춤 견적.<br />하드웨어를 몰라도 괜찮습니다.
          </p>
          <div className="flex gap-2 mt-5">
            {["G", "C", "A"].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: ["#4285f4", "#10a37f", "#d97757"][i], color: "#fff" }}>{l}</div>
            ))}
          </div>
        </div>
        {[
          { title: "서비스", links: ["초급자 모드", "고급자 모드", "견적 비교", "장바구니"] },
          { title: "고객지원", links: ["자주 묻는 질문", "문의하기", "이용약관", "개인정보처리방침"] },
          { title: "회사", links: ["팝콘PC 소개", "공지사항", "채용", "파트너십"] },
        ].map(col => (
          <div key={col.title}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>{col.title}</p>
            <ul className="space-y-2">
              {col.links.map(l => (
                <li key={l}><button className="text-xs transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.5)" }}>{l}</button></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t px-8 py-5 flex items-center justify-between text-xs" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <span>© 2026 팝콘PC. All rights reserved.</span>
        <span>고객센터 1234-5678 (평일 09:00~18:00)</span>
      </div>
    </footer>
  );
}

// ── Admin LNB ─────────────────────────────────────────────────────────────
const adminMenus: { label: string; screens: Screen[]; target: Screen }[] = [
  { label: "대시보드", screens: ["adm-dashboard"], target: "adm-dashboard" },
  { label: "비용관제", screens: ["adm-monitoring", "adm-rate-limit"], target: "adm-monitoring" },
  { label: "상품관리", screens: ["adm-master", "adm-product-edit", "adm-csv", "adm-category"], target: "adm-master" },
  { label: "통계분석", screens: ["adm-keywords", "adm-swap-report", "adm-funnel"], target: "adm-keywords" },
];

function AdminLayout({ current, navigate, children }: { current: Screen; navigate: (s: Screen) => void; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <aside
        style={{ width: 200, background: "#1e293b", color: "#e2e8f0", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}
        className="flex flex-col"
      >
        <div className="px-5 py-5 font-bold text-base border-b border-slate-700">팝콘PC 관리</div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {adminMenus.map(m => (
            <button
              key={m.label}
              onClick={() => navigate(m.target)}
              className="text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all"
              style={{
                background: m.screens.includes(current) ? "#0075d5" : "transparent",
                color: m.screens.includes(current) ? "#fff" : "#94a3b8",
              }}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 text-sm border-t border-slate-700 text-slate-400">관리자님 ▾</div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex items-center px-6 gap-2 text-xs"
          style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.line}`, color: C.textSub }}
        >
          <span>팝콘PC 관리</span>
          <span>/</span>
          <span style={{ color: C.textBody }}>{adminMenus.find(m => m.screens.includes(current))?.label}</span>
          <div className="flex-1" />
          <span style={{ color: C.textBody, fontWeight: 600 }}>admin@popcornpc.com</span>
        </div>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// ── User Layout (GNB + Footer) ────────────────────────────────────────────
function UserLayout({ current, navigate, children }: { current: Screen; navigate: (s: Screen) => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <GNB current={current} navigate={navigate} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
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
function PromptPanel({ text, keywords }: { text: string; keywords: Record<string, string> }) {
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
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
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
function Card({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
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
// SCREENS
// ════════════════════════════════════════════════════════════════════════════

// ── Realtime Panel (인기 견적 + 가격 동향) ────────────────────────────────
const POPULAR_QUOTES = [
  { rank: 1, tag: "🎮 게임용", name: "RTX 4070 + R5 7600X 조합", price: "1,250,000원", delta: "+2.1%", up: true, count: 284 },
  { rank: 2, tag: "💼 사무용", name: "내장그래픽 R5 8600G 미니PC", price: "620,000원", delta: "-0.8%", up: false, count: 197 },
  { rank: 3, tag: "🎬 편집용", name: "RTX 4080 + R9 7950X 워크스테이션", price: "3,180,000원", delta: "+4.3%", up: true, count: 156 },
  { rank: 4, tag: "📡 방송용", name: "RTX 4070 Ti + i9-14900K 원컴방송", price: "2,450,000원", delta: "+1.2%", up: true, count: 143 },
  { rank: 5, tag: "🎓 학습용", name: "RTX 4060 + R5 7500F 가성비", price: "890,000원", delta: "-1.5%", up: false, count: 128 },
];

const PRICE_TRENDS = [
  { part: "RTX 4070", category: "GPU", price: "550,000원", change: "+12,000", pct: "+2.2%", up: true },
  { part: "R5 7600X", category: "CPU", price: "248,000원", change: "-8,000", pct: "-3.1%", up: false },
  { part: "DDR5 32GB", category: "RAM", price: "118,000원", change: "+3,000", pct: "+2.6%", up: true },
  { part: "NVMe 1TB", category: "SSD", price: "96,000원", change: "-2,000", pct: "-2.0%", up: false },
  { part: "850W Gold", category: "파워", price: "119,000원", change: "+1,000", pct: "+0.8%", up: true },
  { part: "B650 WiFi", category: "메인보드", price: "178,000원", change: "-5,000", pct: "-2.7%", up: false },
];

function RealtimePanel() {
  const [tick, setTick] = useState(0);
  // 1초마다 숫자를 살짝 흔들어 "실시간" 느낌 연출
  useState(() => { const id = setInterval(() => setTick(t => t + 1), 3000); return () => clearInterval(id); });

  return (
    <section style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto px-8 py-0">
        <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.line}` }}>
          {/* 인기 견적 탭 헤더 */}
          <div className="flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 -mb-px"
            style={{ borderColor: C.primary, color: C.primary, background: "#f8fbff" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            실시간 인기 견적
          </div>
          <div className="flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 -mb-px"
            style={{ borderColor: "#f59e0b", color: "#b45309", background: "#fffbeb" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            실시간 가격 동향
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 pr-2 text-xs" style={{ color: C.textSub }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준 업데이트
          </div>
        </div>

        {/* Two-column grid */}
        <div className="flex gap-0" style={{ minHeight: 200 }}>
          {/* ① 인기 견적 TOP 5 */}
          <div className="flex-1 py-4 pr-6" style={{ borderRight: `1px solid ${C.line}` }}>
            <div className="space-y-2">
              {POPULAR_QUOTES.map((q, i) => (
                <div key={q.rank}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                  style={{ background: i === 0 ? C.primaryLight : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.primaryLight)}
                  onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? C.primaryLight : "transparent")}
                >
                  {/* Rank badge */}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: i === 0 ? C.primary : i <= 2 ? C.primaryLight : C.bg, color: i === 0 ? "#fff" : i <= 2 ? C.primary : C.textSub }}>
                    {q.rank}
                  </div>
                  {/* Tag */}
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: C.bg, color: C.textBody }}>{q.tag}</span>
                  {/* Name */}
                  <span className="text-sm flex-1 truncate font-medium" style={{ color: C.textBody }}>{q.name}</span>
                  {/* Count */}
                  <span className="text-xs flex-shrink-0" style={{ color: C.textSub }}>{q.count}건</span>
                  {/* Price */}
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: C.primary }}>{q.price}</span>
                  {/* Delta */}
                  <span className="text-xs font-semibold flex-shrink-0 px-1.5 py-0.5 rounded"
                    style={{ color: q.up ? C.success : C.error, background: q.up ? "#e8f5e9" : "#fdecea" }}>
                    {q.up ? "▲" : "▼"} {q.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ② 가격 동향 */}
          <div className="w-80 shrink-0 py-4 pl-6">
            <div className="space-y-2">
              {PRICE_TRENDS.map(p => (
                <div key={p.part} className="flex items-center gap-3">
                  {/* Category badge */}
                  <span className="text-xs font-bold w-14 text-center py-0.5 rounded flex-shrink-0"
                    style={{ background: C.bg, color: C.textSub }}>{p.category}</span>
                  {/* Part name */}
                  <span className="text-sm flex-1 font-medium" style={{ color: C.textBody }}>{p.part}</span>
                  {/* Price */}
                  <span className="text-sm font-bold" style={{ color: C.textStrong }}>{p.price}</span>
                  {/* Change */}
                  <div className="flex items-center gap-1 flex-shrink-0 w-20 justify-end">
                    <span className="text-xs font-semibold" style={{ color: p.up ? C.success : C.error }}>
                      {p.up ? "▲" : "▼"} {p.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 pt-3" style={{ color: C.textSub, borderTop: `1px solid ${C.line}` }}>
              팝콘PC 실재고 기준 · 최근 24시간 변동 · {tick >= 0 && "실시간 반영"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Special Event Rolling Banner (금주의 특가) ────────────────────────────
const SPECIAL_EVENTS = [
  { badge: "🔥 특가", title: "RTX 4070 Super 번들", desc: "CPU+GPU+RAM 세트 구매 시", original: "1,580,000원", sale: "1,320,000원", discount: "-16%", color: "#e53935", bg: "#fff5f5", until: "~6/22" },
  { badge: "⚡ 한정", title: "AMD R9 9950X 특가", desc: "재고 10개 한정 · 쿨러 증정", original: "680,000원", sale: "580,000원", discount: "-15%", color: "#7b1fa2", bg: "#f9f0ff", until: "~6/20" },
  { badge: "🎁 증정", title: "삼성 DDR5 64GB 세트", desc: "견적 완성 시 써멀구리스 증정", original: "258,000원", sale: "218,000원", discount: "-15%", color: "#1565c0", bg: "#f0f7ff", until: "~6/25" },
  { badge: "💎 신상", title: "Intel Arc B580 12GB", desc: "가성비 GPU 팝콘PC 최저가", original: "340,000원", sale: "298,000원", discount: "-12%", color: "#00695c", bg: "#f0faf8", until: "~6/30" },
  { badge: "🚀 기획전", title: "영상편집 풀패키지", desc: "RTX 4080 + R9 + 64GB", original: "3,950,000원", sale: "3,480,000원", discount: "-12%", color: "#bf360c", bg: "#fff8f5", until: "~6/28" },
  { badge: "🛡 보증", title: "시소닉 1000W Titanium", desc: "7년 AS 보증 · 80+ Titanium", original: "310,000원", sale: "265,000원", discount: "-15%", color: "#f9a825", bg: "#fffde7", until: "~6/24" },
  { badge: "🎮 게이머", title: "배그 최적화 패키지", desc: "144fps+ 보장 견적 구성", original: "980,000원", sale: "840,000원", discount: "-14%", color: "#283593", bg: "#f0f2ff", until: "~6/21" },
];

function SpecialEventBanner() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const CARD_W = 280; // px per card including gap
  const TOTAL = SPECIAL_EVENTS.length;

  // Auto-scroll: advance by 1px every 20ms when not paused
  useState(() => {
    const id = setInterval(() => {
      if (!paused) setOffset(o => (o + 0.6) % (CARD_W * TOTAL));
    }, 20);
    return () => clearInterval(id);
  });

  // Duplicate for seamless loop
  const items = [...SPECIAL_EVENTS, ...SPECIAL_EVENTS];

  return (
    <section className="py-10" style={{ background: "#080e1c", overflow: "hidden" }}>
      <div className="max-w-6xl mx-auto px-8 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
            🔥 LIVE
          </span>
          <h2 className="text-lg font-bold" style={{ color: "#fff" }}>금주의 특가 이벤트</h2>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>· 이번 주 한정 할인</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {paused ? "▶ 재생" : "⏸ 일시정지"}
          </button>
        </div>
      </div>

      {/* Scrolling track */}
      <div
        className="relative"
        style={{ overflow: "hidden" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-4 px-8"
          style={{ transform: `translateX(-${offset}px)`, transition: "none", willChange: "transform" }}
        >
          {items.map((ev, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 cursor-pointer flex-shrink-0 transition-all"
              style={{
                width: 260,
                background: ev.bg,
                border: `1.5px solid ${ev.color}33`,
                boxShadow: `0 4px 20px ${ev.color}18`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px ${ev.color}30`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${ev.color}18`; }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: ev.color, color: "#fff" }}>{ev.badge}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: `${ev.color}18`, color: ev.color }}>{ev.until}</span>
              </div>
              {/* Title */}
              <p className="text-sm font-bold mb-1" style={{ color: "#1a1a1a" }}>{ev.title}</p>
              <p className="text-xs mb-3" style={{ color: C.textSub }}>{ev.desc}</p>
              {/* Price */}
              <div className="flex items-end gap-2">
                <span className="text-lg font-black" style={{ color: ev.color }}>{ev.sale}</span>
                <span className="text-xs line-through mb-0.5" style={{ color: C.textSub }}>{ev.original}</span>
              </div>
              {/* Discount badge */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-black px-2 py-0.5 rounded"
                  style={{ background: ev.color, color: "#fff" }}>{ev.discount}</span>
                <span className="text-xs" style={{ color: ev.color }}>→ 견적 담기</span>
              </div>
            </div>
          ))}
        </div>

        {/* Left / right fade overlays */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 80, height: "100%", background: "linear-gradient(to right, #080e1c, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: "100%", background: "linear-gradient(to left, #080e1c, transparent)", pointerEvents: "none" }} />
      </div>
    </section>
  );
}

// ── Landing ───────────────────────────────────────────────────────────────
function Landing({ navigate }: { navigate: (s: Screen) => void }) {
  const [hovered, setHovered] = useState<"beg" | "exp" | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { icon: "💬", title: "용도·예산 입력", desc: "게임용, 사무용, 영상편집 등 목적과 예산만 알려주세요. 부품 지식은 전혀 필요 없습니다." },
    { icon: "🤖", title: "3대 AI 병렬 분석", desc: "Gemini · ChatGPT · Claude가 동시에 최적 구성을 도출합니다. 7초 이내 완료." },
    { icon: "🔍", title: "재고·호환성 검증", desc: "팝콘PC 실재고와 5단계 호환성 검증을 자동으로 수행합니다." },
    { icon: "🛒", title: "바로 구매", desc: "확정된 견적을 한 번에 장바구니에 담고 팝콘PC 쇼핑몰에서 결제하세요." },
  ];

  const reviews = [
    { name: "김게임", score: 5, text: "PC 부품을 하나도 몰랐는데 용도랑 예산만 입력했더니 1분 만에 견적이 나왔어요. 진짜 신기합니다.", tag: "게임용 PC 구매", price: "1,240,000원" },
    { name: "박편집", score: 5, text: "영상편집용 고사양 PC인데 호환성 걱정 없이 한 번에 맞춰줘서 너무 편했어요. 다음에도 또 쓸게요.", tag: "영상편집용 PC", price: "2,180,000원" },
    { name: "이전문", score: 5, text: "고급자 모드로 AMD + NVIDIA 조합 고정 걸고 견적 뽑았는데 정확도 대박. 연쇄 스왑 기능도 신선.", tag: "고급자 견적", price: "3,450,000원" },
  ];

  const specPreview = [
    { cat: "CPU", name: "AMD 라이젠 5 7600X", badge: "가성비 TOP", color: "#e53935" },
    { cat: "GPU", name: "NVIDIA RTX 4070 12GB", badge: "게임 최적", color: "#43a047" },
    { cat: "RAM", name: "삼성 DDR5 32GB", badge: "고속", color: "#1e88e5" },
    { cat: "SSD", name: "삼성 980 Pro 1TB NVMe", badge: "초고속", color: "#8e24aa" },
    { cat: "메인보드", name: "ASUS ROG B650-A WiFi", badge: "추천", color: "#f4511e" },
    { cat: "파워", name: "시소닉 850W Gold", badge: "안정", color: "#f9a825" },
  ];

  return (
    <div style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif", background: C.bg }}>
      <GNB current="landing" navigate={navigate} />

      {/* ① HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg, #080e1c 0%, #0d1b2e 50%, #0a1628 100%)",
        minHeight: 620,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid decoration */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,117,213,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,117,213,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* Glow blobs */}
        <div style={{ position: "absolute", top: -80, left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,117,213,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(67,160,71,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="max-w-6xl mx-auto px-8 py-20 relative" style={{ zIndex: 1 }}>
          <div className="flex items-center gap-8">
            {/* Left copy */}
            <div style={{ flex: "0 0 52%" }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
                style={{ background: "rgba(0,117,213,0.15)", border: "1px solid rgba(0,117,213,0.3)", color: "#60a5fa" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "pulse 2s infinite" }} />
                Gemini · ChatGPT · Claude 3대 AI 병렬 구동
              </div>

              <h1 style={{ fontSize: 46, fontWeight: 800, color: "#fff", lineHeight: 1.18, letterSpacing: "-0.02em" }}>
                컴퓨터 몰라도<br />
                <span style={{
                  background: "linear-gradient(90deg, #60a5fa, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>전문가급 견적</span><br />
                <span style={{ color: "#fff" }}>1분 안에</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", maxWidth: 420 }}>
                용도와 예산만 입력하면 3대 AI가 팝콘PC 실재고로 호환성까지 검증한
                맞춤 조립PC 견적을 즉시 제공합니다.
              </p>

              {/* CTA buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => navigate("beg-step1")}
                  className="flex items-center gap-2 px-7 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{ height: 52, background: C.primary, boxShadow: "0 0 24px rgba(0,117,213,0.45)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.primaryHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
                >
                  초급자로 시작하기 →
                </button>
                <button
                  onClick={() => navigate("exp-step1")}
                  className="flex items-center gap-2 px-7 rounded-xl font-semibold text-sm transition-all"
                  style={{ height: 52, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                >
                  ⚙️ 고급자 모드
                </button>
              </div>

              {/* Trust row */}
              <div className="flex items-center gap-5 mt-8">
                {[
                  { icon: "⚡", text: "평균 57초 견적 완성" },
                  { icon: "🔒", text: "100% 호환성 보장" },
                  { icon: "📦", text: "당일 출고 재고 연동" },
                ].map(t => (
                  <div key={t.text} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span>{t.icon}</span>{t.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: PC image + floating spec card */}
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
                <img
                  src="https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&h=420&fit=crop&auto=format"
                  alt="고성능 게이밍 PC 셋업"
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                />
              </div>
              {/* Floating card — 견적 예시 */}
              <div style={{
                position: "absolute", bottom: -20, left: -24,
                background: "rgba(255,255,255,0.97)",
                borderRadius: 16, padding: "16px 20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                border: `1px solid ${C.line}`,
                minWidth: 220,
              }}>
                <p className="text-xs font-semibold mb-2" style={{ color: C.textSub }}>AI 추천 견적 예시</p>
                <p className="text-xl font-black mb-1" style={{ color: C.primary }}>1,250,000원</p>
                <p className="text-xs mb-2" style={{ color: C.textSub }}>RTX 4070 · 라이젠 5 7600X</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#f59e0b", fontSize: 11 }}>★</span>)}
                  <span className="text-xs ml-1" style={{ color: C.textSub }}>4.9 (2,847건)</span>
                </div>
              </div>
              {/* AI badge top right */}
              <div style={{
                position: "absolute", top: -14, right: -14,
                background: "linear-gradient(135deg, #4285f4, #10a37f)",
                borderRadius: 12, padding: "10px 16px",
                boxShadow: "0 8px 24px rgba(66,133,244,0.4)",
              }}>
                <p className="text-xs font-bold text-white">3대 AI</p>
                <p className="text-xs text-white opacity-80">병렬 분석 중</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(transparent, #f7f9fc)" }} />
      </section>

      {/* ② STATS BAR ─────────────────────────────────────────── */}
      <section style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between flex-wrap gap-4">
          {[
            { num: "57초", label: "평균 견적 생성" },
            { num: "98.7%", label: "호환성 검증 정확도" },
            { num: "3대", label: "AI 모델 동시 활용" },
            { num: "12,400+", label: "팝콘PC 실재고 연동" },
            { num: "4.9★", label: "사용자 평점" },
          ].map(s => (
            <div key={s.label} className="text-center px-4">
              <div className="text-2xl font-black" style={{ color: C.primary }}>{s.num}</div>
              <div className="text-xs mt-0.5" style={{ color: C.textSub }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ②-B REALTIME PANEL ─────────────────────────────────── */}
      <RealtimePanel />

      {/* ③ MODE CARDS ────────────────────────────────────────── */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.primary }}>나에게 맞는 모드 선택</p>
            <h2 className="text-3xl font-bold" style={{ color: C.textStrong }}>어떤 사용자이신가요?</h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Beginner card */}
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-250"
              style={{
                background: hovered === "beg" ? "#f0f7ff" : C.surface,
                border: `2px solid ${hovered === "beg" ? C.primary : C.line}`,
                boxShadow: hovered === "beg" ? "0 12px 40px rgba(0,117,213,0.15)" : "0 2px 12px rgba(0,0,0,0.05)",
                transform: hovered === "beg" ? "translateY(-4px)" : "none",
              }}
              onMouseEnter={() => setHovered("beg")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("beg-step1")}
            >
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-5"
                  style={{ background: C.primaryLight }}>🧑‍💻</div>
                <div className="inline-block ml-3 px-3 py-1 rounded-full text-xs font-semibold align-middle"
                  style={{ background: "#e8f5e9", color: "#2e7d32" }}>추천</div>
                <h3 className="text-xl font-bold mt-3 mb-2" style={{ color: C.textStrong }}>초급자 모드</h3>
                <p className="text-sm mb-6" style={{ color: C.textSub }}>PC 부품을 잘 몰라도 괜찮아요.<br />용도와 예산만 입력하면 됩니다.</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "용도·예산·감성 옵션만으로 완성 견적",
                    "AI 영업사원이 최적 구성 추천",
                    "4단계 쉬운 입력 → 즉시 결과",
                    "부품 교체도 쉽게 가능",
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: C.textBody }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: C.primaryLight, color: C.primary }}>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-all"
                  style={{ background: hovered === "beg" ? C.primary : "#1a1a1a" }}
                >
                  초급자로 시작하기 →
                </button>
              </div>
              {/* Bottom accent bar */}
              <div style={{ height: 4, background: hovered === "beg" ? C.primary : C.line, transition: "background 0.2s" }} />
            </div>

            {/* Expert card */}
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-250"
              style={{
                background: hovered === "exp" ? "#080e1c" : "#0f172a",
                border: `2px solid ${hovered === "exp" ? "#3b82f6" : "rgba(255,255,255,0.06)"}`,
                boxShadow: hovered === "exp" ? "0 12px 40px rgba(59,130,246,0.25)" : "0 2px 12px rgba(0,0,0,0.2)",
                transform: hovered === "exp" ? "translateY(-4px)" : "none",
              }}
              onMouseEnter={() => setHovered("exp")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("exp-step1")}
            >
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-5"
                  style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>⚙️</div>
                <div className="inline-block ml-3 px-3 py-1 rounded-full text-xs font-semibold align-middle"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>전문가용</div>
                <h3 className="text-xl font-bold mt-3 mb-2" style={{ color: "#fff" }}>고급자 모드</h3>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>원하는 스펙이 확실한 분을 위한<br />5단계 정밀 설정 모드.</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "CPU/GPU 제조사·세대 고정 필터",
                    "소켓·전력·물리 치수 5단계 검증",
                    "연쇄 스왑(Chain Swap) 자동 제안",
                    "전문가 AI 요청서 직접 편집",
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full h-12 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: hovered === "exp" ? "linear-gradient(90deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: hovered === "exp" ? "0 0 20px rgba(59,130,246,0.4)" : "none",
                  }}
                >
                  고급자로 시작하기 →
                </button>
              </div>
              <div style={{ height: 4, background: hovered === "exp" ? "#3b82f6" : "rgba(255,255,255,0.05)", transition: "background 0.2s" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ④ HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-20 px-8" style={{ background: C.surface }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.primary }}>간단한 4단계</p>
            <h2 className="text-3xl font-bold" style={{ color: C.textStrong }}>이렇게 쉽습니다</h2>
          </div>
          <div className="flex gap-4 mb-8 justify-center">
            {steps.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: activeStep === i ? C.primary : C.bg,
                  color: activeStep === i ? "#fff" : C.textSub,
                  border: `1.5px solid ${activeStep === i ? C.primary : C.line}`,
                }}>
                {i + 1}단계
              </button>
            ))}
          </div>
          {/* Active step display */}
          <div className="rounded-2xl p-10 text-center max-w-lg mx-auto"
            style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <div className="text-5xl mb-4">{steps[activeStep].icon}</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: C.textStrong }}>{steps[activeStep].title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: C.textSub }}>{steps[activeStep].desc}</p>
          </div>
          {/* Step timeline dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((_, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                style={{ width: activeStep === i ? 24 : 8, height: 8, borderRadius: 4, background: activeStep === i ? C.primary : C.line, transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ SPEC PREVIEW ─────────────────────────────────────── */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.primary }}>AI 추천 견적 미리보기</p>
              <h2 className="text-3xl font-bold" style={{ color: C.textStrong }}>이런 구성이 추천됩니다</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: C.primary }}>1,250,000원</p>
              <p className="text-xs" style={{ color: C.textSub }}>게임용 · 100만원대 · 화이트감성</p>
            </div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {specPreview.map(s => (
              <div key={s.cat} className="rounded-xl p-5 flex items-center gap-4 transition-all"
                style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.primary; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,117,213,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.line; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-base"
                  style={{ background: `${s.color}18` }}>
                  {s.cat === "CPU" ? "🔲" : s.cat === "GPU" ? "🎮" : s.cat === "RAM" ? "🧠" : s.cat === "SSD" ? "💾" : s.cat === "메인보드" ? "🔌" : "⚡"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold mb-0.5" style={{ color: C.textSub }}>{s.cat}</p>
                  <p className="text-sm font-medium truncate" style={{ color: C.textBody }}>{s.name}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: `${s.color}15`, color: s.color }}>{s.badge}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate("beg-step1")}
              className={btn.primary + " px-8"}
              style={{ background: C.primary, height: 48 }}>
              나만의 견적 받기 →
            </button>
          </div>
        </div>
      </section>

      {/* ⑥ AI ENGINES ──────────────────────────────────────── */}
      <section className="py-20 px-8" style={{ background: "#080e1c" }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#60a5fa" }}>검증된 AI 엔진</p>
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#fff" }}>3대 AI의 검증으로 완성되는 견적</h2>
          <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.45)" }}>각 모델의 응답을 교차 검증하고 팝콘PC 재고·마진 데이터로 최종 확정합니다.</p>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { name: "Google Gemini", desc: "부품 조합 최적화 전문. 광범위한 학습 데이터 기반 가성비 추천.", color: "#4285f4", icon: "G" },
              { name: "OpenAI ChatGPT", desc: "자연어 이해 최강. 사용자 요청 의도 파악 및 정밀 스펙 매핑.", color: "#10a37f", icon: "C" },
              { name: "Anthropic Claude", desc: "논리적 추론 특화. 호환성 제약 조건 분석 및 안전 대안 제안.", color: "#d97757", icon: "A" },
            ].map(ai => (
              <div key={ai.name} className="rounded-2xl p-7 text-left"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white mb-5"
                  style={{ background: ai.color }}>
                  {ai.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{ai.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{ai.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-5 rounded-2xl text-left"
            style={{ background: "rgba(0,117,213,0.1)", border: "1px solid rgba(0,117,213,0.2)" }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#60a5fa" }}>Fail-safe 보장</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>7초 이내 미응답·오류 모델은 자동 탈락 처리, 정상 모델만으로 견적을 완성합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⑦ REVIEWS ──────────────────────────────────────────── */}
      <section className="py-20 px-8" style={{ background: C.surface }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.primary }}>사용자 후기</p>
            <h2 className="text-3xl font-bold" style={{ color: C.textStrong }}>직접 써본 분들의 이야기</h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {reviews.map(r => (
              <div key={r.name} className="rounded-2xl p-7"
                style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>)}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: C.textBody }}>&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: C.primary }}>{r.name[0]}</div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: C.textStrong }}>{r.name}</p>
                      <p className="text-xs" style={{ color: C.textSub }}>{r.tag}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: C.primary }}>{r.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑦-B SPECIAL EVENT ROLLING BANNER ───────────────────── */}
      <SpecialEventBanner />

      {/* ⑧ FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-20 px-8" style={{ background: "linear-gradient(135deg, #0d1b2e 0%, #080e1c 100%)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
            지금 바로<br />
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              나만의 견적
            </span>을 받아보세요
          </h2>
          <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
            무료 · 로그인 불필요 · 1분 완성
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("beg-step1")}
              className="px-10 rounded-xl font-bold text-white transition-all"
              style={{ height: 56, background: C.primary, fontSize: 16, boxShadow: "0 0 32px rgba(0,117,213,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.background = C.primaryHover)}
              onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
            >
              초급자 견적 받기
            </button>
            <button
              onClick={() => navigate("exp-step1")}
              className="px-10 rounded-xl font-bold transition-all"
              style={{ height: 56, background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 16, border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            >
              고급자 견적 받기
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Auth Modal ─────────────────────────────────────────────────────────────
function AuthModal({ navigate }: { navigate: (s: Screen) => void }) {
  const [failed, setFailed] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  return (
    <UserLayout current="auth-modal" navigate={navigate}>
      <div className="flex items-center justify-center min-h-96 p-6" style={{ background: "rgba(0,0,0,0.04)" }}>
        <div className="relative rounded-2xl p-8 w-full max-w-sm" style={{ background: C.surface, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
          <button
            onClick={() => navigate("landing")}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-lg"
            style={{ color: C.textSub }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold mb-1" style={{ color: C.textStrong }}>팝콘PC 통합 로그인</h2>
          <p className="text-xs mb-6" style={{ color: C.textSub }}>기존 팝콘PC 쇼핑몰 계정으로 로그인됩니다.</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: C.textBody }}>아이디</label>
              <input
                value={id} onChange={e => setId(e.target.value)}
                className="w-full h-10 px-3 rounded-md text-sm"
                style={{ border: `1px solid ${C.line}`, outline: "none" }}
                placeholder="아이디를 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: C.textBody }}>비밀번호</label>
              <input
                type="password" value={pw} onChange={e => setPw(e.target.value)}
                className="w-full h-10 px-3 rounded-md text-sm"
                style={{ border: `1px solid ${C.line}`, outline: "none" }}
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>
          {failed && (
            <div className="mt-3 p-3 rounded-md text-sm" style={{ background: "#fdecea", color: C.error }}>
              로그인에 실패했습니다. 다시 시도하거나 비회원으로 진행하세요.
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <button
              className={btn.primary + " flex-1"}
              style={{ background: C.primary }}
              onClick={() => { if (!id || !pw) setFailed(true); else navigate("landing"); }}
            >
              로그인
            </button>
            <button
              className={btn.secondary + " flex-1"}
              style={{ borderColor: C.line, color: C.textBody }}
            >
              회원가입
            </button>
          </div>
          <button
            onClick={() => navigate("landing")}
            className="w-full mt-3 text-center text-xs py-2"
            style={{ color: C.textSub }}
          >
            비회원으로 계속하기
          </button>
        </div>
      </div>
    </UserLayout>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BEGINNER — shared helpers
// ═══════════════════════════════════════════════════════════════════════════

const BEG_STEPS = [
  { num: 1, label: "용도 선택" },
  { num: 2, label: "예산 설정" },
  { num: 3, label: "스타일 옵션" },
  { num: 4, label: "AI 요청" },
];

function BegStepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {BEG_STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background: s.num < current ? C.success : s.num === current ? C.primary : C.line,
                color: s.num <= current ? "#fff" : C.textSub,
              }}
            >
              {s.num < current ? "✓" : s.num}
            </div>
            <span className="text-xs font-medium hidden sm:block" style={{ color: s.num === current ? C.primary : s.num < current ? C.success : C.textSub }}>
              {s.label}
            </span>
          </div>
          {i < BEG_STEPS.length - 1 && (
            <div className="w-8 h-0.5 mx-2" style={{ background: s.num < current ? C.success : C.line }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Shared page shell for beg steps 1-3 (2-column)
function BegShell({ step, navigate, title, subtitle, promptText, promptKeys, onPrev, onNext, nextScreen, children }: {
  step: number; navigate: (s: Screen) => void;
  title: string; subtitle: string;
  promptText: string; promptKeys: Record<string, string>;
  onPrev?: () => void; onNext?: () => void; nextScreen?: Screen;
  children: React.ReactNode;
}) {
  return (
    <UserLayout current={`beg-step${step}` as Screen} navigate={navigate}>
      {/* Step header bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <BegStepBar current={step} />
          <span className="text-xs" style={{ color: C.textSub }}>초급자 모드 · {step}/4 단계</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.primary }}>STEP {step}</p>
          <h1 className="text-3xl font-bold" style={{ color: C.textStrong }}>{title}</h1>
          <p className="text-sm mt-1.5" style={{ color: C.textSub }}>{subtitle}</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0">{children}</div>

          {/* AI Prompt Panel */}
          <div className="w-72 shrink-0 sticky top-20">
            <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.primaryLight}`, boxShadow: "0 4px 20px rgba(0,117,213,0.08)" }}>
              <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #0075d5, #005fae)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm">🤖</span>
                  <p className="text-sm font-semibold text-white">실시간 AI 주문서</p>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>선택에 따라 자동으로 조합됩니다</p>
              </div>
              <div className="p-5" style={{ background: "#f8fbff" }}>
                <p className="text-sm leading-relaxed" style={{ color: C.textBody, lineHeight: 1.9 }}>
                  {promptText.split(/(\[[^\]]+\])/g).map((part, i) => {
                    const isKey = part.startsWith("[") && part.endsWith("]");
                    const key = isKey ? part.slice(1, -1) : null;
                    const val = key ? promptKeys[key] : null;
                    return isKey ? (
                      <span key={i} className="font-bold px-1.5 py-0.5 rounded mx-0.5"
                        style={{ color: val && val !== "?" ? C.primary : C.textSub, background: val && val !== "?" ? C.primaryLight : "#f0f0f0", transition: "all 0.3s" }}>
                        {val || "?"}
                      </span>
                    ) : <span key={i}>{part}</span>;
                  })}
                </p>
              </div>
              <div className="px-5 py-3" style={{ background: "#f0f7ff", borderTop: `1px solid ${C.primaryLight}` }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
                  <span className="text-xs" style={{ color: C.textSub }}>3대 AI 대기 중 — Gemini · ChatGPT · Claude</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
          {onPrev ? (
            <button onClick={onPrev}
              className="flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold transition-all"
              style={{ background: C.surface, color: C.textBody, border: `1.5px solid ${C.line}` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.primary)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.line)}
            >
              ← 이전 단계
            </button>
          ) : <div />}
          <button
            onClick={onNext ?? (() => nextScreen && navigate(nextScreen))}
            className="flex items-center gap-2 px-8 h-11 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: C.primary, boxShadow: "0 4px 14px rgba(0,117,213,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.background = C.primaryHover)}
            onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </UserLayout>
  );
}

// ── Beg Step 1 ─────────────────────────────────────────────────────────────
const PURPOSE_OPTIONS = [
  { key: "사무용", icon: "💼", desc: "문서 작업·웹서핑·화상회의", color: "#1565c0", bg: "#e3f2fd", img: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&h=160&fit=crop&auto=format" },
  { key: "게임용", icon: "🎮", desc: "FPS·RPG·배틀로얄 게임", color: "#6a1b9a", bg: "#f3e5f5", img: "https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=300&h=160&fit=crop&auto=format" },
  { key: "영상편집용", icon: "🎬", desc: "4K 편집·렌더링·After Effects", color: "#bf360c", bg: "#fbe9e7", img: "https://images.unsplash.com/photo-1619597455322-4fbbd820250a?w=300&h=160&fit=crop&auto=format" },
  { key: "인터넷방송용", icon: "📡", desc: "게임 원컴방송·스트리밍", color: "#2e7d32", bg: "#e8f5e9", img: "https://images.unsplash.com/photo-1614179924047-e1ab49a0a0cf?w=300&h=160&fit=crop&auto=format" },
];

const GAME_OPTIONS = [
  { key: "배틀그라운드", icon: "🔫", desc: "PUBG · 고사양 권장" },
  { key: "디아블로4", icon: "⚔️", desc: "액션 RPG · 중사양" },
  { key: "리그오브레전드", icon: "🏆", desc: "MOBA · 저사양" },
  { key: "사이버펑크 2077", icon: "🌆", desc: "오픈월드 · 초고사양" },
];

function BegStep1({ navigate }: { navigate: (s: Screen) => void }) {
  const [purpose, setPurpose] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const toggleGame = (g: string) => setGames(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);

  return (
    <BegShell
      step={1} navigate={navigate}
      title="어떤 용도로 쓰실 PC인가요?"
      subtitle="주 목적 하나를 선택해 주세요. AI가 맞춤 사양을 자동으로 설계합니다."
      promptText="주 용도는 [purpose]이며, 팝콘PC의 최적 부품으로 견적을 조립해 주세요."
      promptKeys={{ purpose: purpose || "?" }}
      nextScreen="beg-step2"
    >
      {/* Purpose big cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {PURPOSE_OPTIONS.map(p => (
          <div key={p.key}
            onClick={() => setPurpose(p.key)}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              border: `2px solid ${purpose === p.key ? p.color : C.line}`,
              boxShadow: purpose === p.key ? `0 8px 24px ${p.color}28` : "0 2px 8px rgba(0,0,0,0.05)",
              transform: purpose === p.key ? "translateY(-2px)" : "none",
            }}
          >
            <div className="relative h-32 overflow-hidden">
              <img src={p.img} alt={p.key} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: purpose === p.key ? `${p.color}33` : "rgba(0,0,0,0.25)" }} />
              <div style={{ position: "absolute", top: 12, left: 12, fontSize: 28 }}>{p.icon}</div>
              {purpose === p.key && (
                <div style={{ position: "absolute", top: 10, right: 10, background: p.color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                  ✓ 선택됨
                </div>
              )}
            </div>
            <div className="px-4 py-3" style={{ background: purpose === p.key ? p.bg : C.surface }}>
              <p className="font-bold text-sm" style={{ color: purpose === p.key ? p.color : C.textStrong }}>{p.key}</p>
              <p className="text-xs mt-0.5" style={{ color: C.textSub }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Game sub-selection */}
      {purpose === "게임용" && (
        <div className="rounded-2xl p-6" style={{ background: "#f3e5f5", border: "1.5px solid #ce93d8" }}>
          <p className="text-sm font-bold mb-1" style={{ color: "#6a1b9a" }}>🎮 주로 즐기는 게임을 골라주세요 (다중 선택)</p>
          <p className="text-xs mb-4" style={{ color: "#9c27b0" }}>AI가 해당 게임의 권장 사양을 기준으로 부품을 선정합니다.</p>
          <div className="grid grid-cols-2 gap-3">
            {GAME_OPTIONS.map(g => (
              <div key={g.key} onClick={() => toggleGame(g.key)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: games.includes(g.key) ? "#ce93d8" : C.surface,
                  border: `1.5px solid ${games.includes(g.key) ? "#9c27b0" : C.line}`,
                }}>
                <span className="text-xl">{g.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: games.includes(g.key) ? "#4a148c" : C.textBody }}>{g.key}</p>
                  <p className="text-xs" style={{ color: C.textSub }}>{g.desc}</p>
                </div>
                {games.includes(g.key) && <span className="ml-auto text-xs font-bold" style={{ color: "#4a148c" }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </BegShell>
  );
}

// ── Beg Step 2 ─────────────────────────────────────────────────────────────
const BUDGET_PRESETS = [
  { label: "보급형", range: [50, 70], desc: "인터넷·문서 작업 충분", icon: "💰", color: "#43a047" },
  { label: "중급형", range: [80, 120], desc: "게임·편집 균형 사양", icon: "💳", color: "#1e88e5" },
  { label: "고급형", range: [130, 180], desc: "고사양 게임·4K 편집", icon: "💎", color: "#8e24aa" },
  { label: "프리미엄", range: [200, 280], desc: "타협없는 최상급 구성", icon: "👑", color: "#e53935" },
];

function BegStep2({ navigate }: { navigate: (s: Screen) => void }) {
  const [budget, setBudget] = useState(100);
  const [preset, setPreset] = useState("");

  const getBudgetDesc = (v: number) => {
    if (v <= 70) return { label: "보급형", text: "기본적인 인터넷·문서 작업에 최적", color: "#43a047" };
    if (v <= 120) return { label: "중급형", text: "게임과 영상편집을 균형있게", color: "#1e88e5" };
    if (v <= 180) return { label: "고급형", text: "고사양 게임과 4K 편집 가능", color: "#8e24aa" };
    return { label: "프리미엄", text: "타협없는 최상급 성능", color: "#e53935" };
  };
  const desc = getBudgetDesc(budget);
  const pct = ((budget - 30) / (300 - 30)) * 100;

  return (
    <BegShell
      step={2} navigate={navigate}
      title="예산은 어느 정도 생각하세요?"
      subtitle="슬라이더를 움직이거나 아래 프리셋을 클릭하세요."
      promptText="예산은 약 [budget] 정도로, [grade] 구성을 원합니다."
      promptKeys={{ budget: `${budget}만원`, grade: desc.label }}
      onPrev={() => navigate("beg-step1")}
      nextScreen="beg-step3"
    >
      {/* Slider card */}
      <div className="rounded-2xl p-8 mb-6" style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs" style={{ color: C.textSub }}>설정 예산</p>
            <p className="text-5xl font-black mt-1" style={{ color: C.primary }}>{budget}<span className="text-2xl font-bold ml-1">만원</span></p>
          </div>
          <div className="text-right">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold" style={{ background: `${desc.color}18`, color: desc.color }}>
              {desc.label}
            </span>
            <p className="text-xs mt-1" style={{ color: C.textSub }}>{desc.text}</p>
          </div>
        </div>

        {/* Custom slider track */}
        <div className="relative mb-3">
          <div className="h-3 rounded-full" style={{ background: C.line }}>
            <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #43a047, ${C.primary})` }} />
          </div>
          <input type="range" min={30} max={300} step={5} value={budget}
            onChange={e => { setBudget(+e.target.value); setPreset(""); }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
            style={{ accentColor: C.primary }} />
        </div>
        <div className="flex justify-between text-xs" style={{ color: C.textSub }}>
          <span>30만원</span><span>150만원</span><span>300만원</span>
        </div>
      </div>

      {/* Preset cards */}
      <p className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>간편 프리셋 선택</p>
      <div className="grid grid-cols-4 gap-3">
        {BUDGET_PRESETS.map(p => (
          <div key={p.label}
            onClick={() => { setPreset(p.label); setBudget(p.range[0]); }}
            className="rounded-xl p-4 cursor-pointer text-center transition-all"
            style={{
              border: `2px solid ${preset === p.label ? p.color : C.line}`,
              background: preset === p.label ? `${p.color}10` : C.surface,
              transform: preset === p.label ? "translateY(-2px)" : "none",
              boxShadow: preset === p.label ? `0 4px 12px ${p.color}30` : "none",
            }}
          >
            <div className="text-2xl mb-2">{p.icon}</div>
            <p className="text-sm font-bold" style={{ color: preset === p.label ? p.color : C.textStrong }}>{p.label}</p>
            <p className="text-xs mt-1" style={{ color: C.textSub }}>{p.range[0]}~{p.range[1]}만</p>
          </div>
        ))}
      </div>
    </BegShell>
  );
}

// ── Beg Step 3 ─────────────────────────────────────────────────────────────
const STYLE_OPTIONS = [
  { key: "#화이트감성", icon: "🤍", desc: "깔끔한 화이트 케이스, 은은한 LED", preview: "bg-white border-gray-200", color: "#546e7a" },
  { key: "#화려한LED", icon: "🌈", desc: "다채로운 RGB 조명, 화려한 외관", preview: "bg-purple-900 border-purple-500", color: "#7b1fa2" },
  { key: "#저소음", icon: "🤫", desc: "정숙한 쿨링팬, 방음 설계 우선", preview: "bg-gray-800 border-gray-600", color: "#455a64" },
  { key: "#크기가작은PC", icon: "📦", desc: "미니 ITX, 책상 공간 최소화", preview: "bg-blue-900 border-blue-500", color: "#1565c0" },
  { key: "#가성비최우선", icon: "💸", desc: "예산 대비 최고 성능, 외관 무관", preview: "bg-green-900 border-green-500", color: "#2e7d32" },
  { key: "#미래지향적", icon: "🚀", desc: "하이엔드 부품, 오래 쓸 수 있는 PC", preview: "bg-indigo-900 border-indigo-500", color: "#283593" },
];

function BegStep3({ navigate }: { navigate: (s: Screen) => void }) {
  const [styles, setStyles] = useState<string[]>([]);
  const toggle = (s: string) => setStyles(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <BegShell
      step={3} navigate={navigate}
      title="원하는 스타일이 있나요?"
      subtitle="여러 개 선택 가능합니다. AI가 해당 스타일에 맞는 부품과 케이스를 우선 추천합니다."
      promptText="외관·스타일은 [style] 조건에 맞게 구성해 주세요."
      promptKeys={{ style: styles.length ? styles.join(", ") : "?" }}
      onPrev={() => navigate("beg-step2")}
      nextScreen="beg-step4"
    >
      <div className="grid grid-cols-3 gap-4">
        {STYLE_OPTIONS.map(o => (
          <div key={o.key}
            onClick={() => toggle(o.key)}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              border: `2px solid ${styles.includes(o.key) ? o.color : C.line}`,
              boxShadow: styles.includes(o.key) ? `0 6px 20px ${o.color}28` : "0 2px 8px rgba(0,0,0,0.05)",
              transform: styles.includes(o.key) ? "translateY(-3px)" : "none",
            }}
          >
            {/* Visual preview block */}
            <div className="h-24 relative flex items-center justify-center"
              style={{ background: styles.includes(o.key) ? `${o.color}18` : C.bg }}>
              <span className="text-5xl">{o.icon}</span>
              {styles.includes(o.key) && (
                <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: o.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>
                </div>
              )}
            </div>
            <div className="p-4" style={{ background: styles.includes(o.key) ? `${o.color}08` : C.surface }}>
              <p className="text-sm font-bold mb-1" style={{ color: styles.includes(o.key) ? o.color : C.textStrong }}>{o.key}</p>
              <p className="text-xs" style={{ color: C.textSub }}>{o.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {styles.length > 0 && (
        <div className="mt-5 p-4 rounded-xl flex items-center gap-3" style={{ background: C.primaryLight, border: `1px solid ${C.primary}33` }}>
          <span className="text-lg">✅</span>
          <p className="text-sm" style={{ color: C.primary }}>
            <span className="font-bold">{styles.length}개 스타일</span> 선택됨: {styles.join(" · ")}
          </p>
        </div>
      )}
    </BegShell>
  );
}

// ── Beg Step 4 (Summary) ───────────────────────────────────────────────────
function BegStep4({ navigate }: { navigate: (s: Screen) => void }) {
  const defaultText = `안녕하세요! 저는 PC를 잘 모르는 초급자입니다.\n주 용도는 [게임(배틀그라운드)]이며, 예산은 [100만 원~130만 원] 사이로,\n외관은 [화이트감성] 스타일로 최적의 견적을 조립해 주세요.\n호환성과 팝콘PC 재고를 반드시 확인해 주세요.`;
  const [text, setText] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState<{ gemini: string; chatgpt: string; claude: string }>({ gemini: "대기", chatgpt: "대기", claude: "대기" });

  const handleRecommend = () => {
    setLoading(true);
    setProgress(0);
    setTimeout(() => setAiStatus(p => ({ ...p, gemini: "분석중" })), 300);
    setTimeout(() => setAiStatus(p => ({ ...p, chatgpt: "분석중" })), 600);
    setTimeout(() => setAiStatus(p => ({ ...p, claude: "분석중" })), 900);
    const iv = setInterval(() => setProgress(p => Math.min(p + 3, 90)), 60);
    setTimeout(() => setAiStatus(p => ({ ...p, gemini: "완료" })), 1400);
    setTimeout(() => setAiStatus(p => ({ ...p, chatgpt: "완료" })), 1700);
    setTimeout(() => setAiStatus(p => ({ ...p, claude: "완료" })), 1900);
    setTimeout(() => { clearInterval(iv); setProgress(100); }, 2000);
    setTimeout(() => { navigate("beg-result"); }, 2400);
  };

  const aiColor: Record<string, string> = { "대기": C.textSub, "분석중": C.warning, "완료": C.success };
  const aiIcon: Record<string, string> = { "대기": "○", "분석중": "◐", "완료": "●" };

  return (
    <UserLayout current="beg-step4" navigate={navigate}>
      {/* Step header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <BegStepBar current={4} />
          <span className="text-xs" style={{ color: C.textSub }}>초급자 모드 · 4/4 단계</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.primary }}>STEP 4 — 마지막 단계</p>
          <h1 className="text-3xl font-bold" style={{ color: C.textStrong }}>AI 주문서 확인 및 발송</h1>
          <p className="text-sm mt-1.5" style={{ color: C.textSub }}>자동 조합된 주문서를 직접 수정하고, 3대 AI에게 견적을 요청하세요.</p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
          {/* Textarea */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.line}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
              <span className="text-sm font-semibold" style={{ color: C.textBody }}>✍️ 최종 AI 주문서 (직접 편집 가능)</span>
              <span className="text-xs" style={{ color: C.textSub }}>{text.length}자</span>
            </div>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              className="w-full p-5 text-sm resize-none outline-none"
              rows={9}
              style={{ color: C.textBody, lineHeight: 1.9, fontFamily: "'Noto Sans KR', sans-serif", border: "none" }}
            />
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
              <span className="text-xs" style={{ color: C.textSub }}>💡 핵심 조건(용도·예산·스타일)이 포함되어 있으면 AI가 더 정확하게 추천합니다.</span>
            </div>
          </div>

          {/* AI status panel */}
          <div className="w-56 shrink-0">
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-xs font-semibold mb-4" style={{ color: C.textSub }}>AI 엔진 상태</p>
              <div className="space-y-3">
                {[
                  { name: "Google Gemini", key: "gemini" as const, color: "#4285f4" },
                  { name: "OpenAI ChatGPT", key: "chatgpt" as const, color: "#10a37f" },
                  { name: "Anthropic Claude", key: "claude" as const, color: "#d97757" },
                ].map(ai => (
                  <div key={ai.key} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: ai.color }}>
                      {ai.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: C.textBody }}>{ai.name.split(" ")[1]}</p>
                      <p className="text-xs" style={{ color: aiColor[aiStatus[ai.key]] }}>
                        {aiIcon[aiStatus[ai.key]]} {aiStatus[ai.key]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {loading && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: C.textSub }}>처리 중</span>
                    <span style={{ color: C.primary }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: C.line }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${C.primary}, #34d399)` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
          <button onClick={() => navigate("beg-step3")}
            className="flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold transition-all"
            style={{ background: C.surface, color: C.textBody, border: `1.5px solid ${C.line}` }}>
            ← 이전 단계
          </button>
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="flex items-center gap-3 px-10 h-14 rounded-xl font-bold text-white transition-all"
            style={{
              background: loading ? C.textSub : `linear-gradient(135deg, ${C.primary}, #005fae)`,
              fontSize: 16,
              boxShadow: loading ? "none" : "0 6px 20px rgba(0,117,213,0.4)",
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
                AI 분석 중...
              </>
            ) : (
              <>🚀 지금 추천받기</>
            )}
          </button>
        </div>
      </div>
    </UserLayout>
  );
}

// ── Beg Result ────────────────────────────────────────────────────────────
const fpsDummyData = [
  { name: "배틀그라운드", fps: 140 }, { name: "디아블로4", fps: 120 },
  { name: "리그오브레전드", fps: 280 }, { name: "사이버펑크", fps: 75 },
];
const pricePieData = [
  { name: "CPU", value: 250000 }, { name: "GPU", value: 550000 },
  { name: "RAM", value: 120000 }, { name: "SSD", value: 100000 },
  { name: "기타", value: 230000 },
];
const PIE_COLORS = ["#0075d5", "#4db6ac", "#ffb74d", "#9575cd", "#78909c"];

const componentsDummy = [
  { cat: "CPU", icon: "🔲", name: "AMD 라이젠 5 7600X", detail: "6코어 / AM5 / 105W", price: "250,000원", color: "#e53935" },
  { cat: "GPU", icon: "🎮", name: "NVIDIA RTX 4070 12GB", detail: "GDDR6X / 200W TDP", price: "550,000원", color: "#43a047" },
  { cat: "RAM", icon: "🧠", name: "삼성 DDR5 32GB (16×2)", detail: "5600MHz / 듀얼채널", price: "120,000원", color: "#1e88e5" },
  { cat: "SSD", icon: "💾", name: "삼성 980 Pro 1TB NVMe", detail: "PCIe 4.0 / 7,000MB/s", price: "100,000원", color: "#8e24aa" },
  { cat: "메인보드", icon: "🔌", name: "ASUS ROG B650-A WiFi", detail: "ATX / WiFi 6E", price: "180,000원", color: "#f4511e" },
  { cat: "파워", icon: "⚡", name: "시소닉 850W 80PLUS Gold", detail: "850W / 85% 효율", price: "120,000원", color: "#f9a825" },
  { cat: "케이스", icon: "📦", name: "리안리 O11 Dynamic Mini", detail: "미들타워 / 강화유리", price: "130,000원", color: "#546e7a" },
];

const RESULT_SETS = {
  budget: { label: "가성비형", emoji: "💰", price: "850,000원", tag: "예산 최적화", color: "#43a047" },
  recommend: { label: "추천형", emoji: "⭐", price: "1,250,000원", tag: "밸런스 최강", color: C.primary },
  highend: { label: "고성능형", emoji: "🔥", price: "1,980,000원", tag: "타협없는 성능", color: "#e53935" },
};

function BegResult({ navigate }: { navigate: (s: Screen) => void }) {
  const [activeSet, setActiveSet] = useState<keyof typeof RESULT_SETS>("recommend");
  const set = RESULT_SETS[activeSet];

  return (
    <UserLayout current="beg-result" navigate={navigate}>
      {/* Result hero banner */}
      <div style={{ background: "linear-gradient(135deg, #080e1c 0%, #0d1b2e 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,117,213,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,117,213,0.05) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="max-w-6xl mx-auto px-8 py-10 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                  ✓ AI 분석 완료
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Gemini · ChatGPT · Claude 3대 검증</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">AI가 추천한 맞춤 PC 견적</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>게임용 · 100만원대 · 화이트감성 기준 최적 구성</p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>선택 견적</p>
              <p className="text-4xl font-black" style={{ color: "#60a5fa" }}>{set.price}</p>
              <span className="text-xs px-3 py-1 rounded-full mt-2 inline-block" style={{ background: `${set.color}22`, color: set.color, border: `1px solid ${set.color}44` }}>
                {set.emoji} {set.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Set selector tabs */}
        <div className="flex gap-3 mb-8">
          {(Object.entries(RESULT_SETS) as [keyof typeof RESULT_SETS, typeof RESULT_SETS[keyof typeof RESULT_SETS]][]).map(([k, v]) => (
            <button key={k} onClick={() => setActiveSet(k)}
              className="flex items-center gap-3 px-6 h-16 rounded-2xl text-left transition-all flex-1"
              style={{
                background: activeSet === k ? C.surface : C.bg,
                border: `2px solid ${activeSet === k ? v.color : C.line}`,
                boxShadow: activeSet === k ? `0 4px 16px ${v.color}28` : "none",
              }}>
              <span className="text-2xl">{v.emoji}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: activeSet === k ? v.color : C.textStrong }}>{v.label}</p>
                <p className="text-xs" style={{ color: C.textSub }}>{v.tag} · {v.price}</p>
              </div>
              {activeSet === k && <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${v.color}18`, color: v.color }}>선택</span>}
            </button>
          ))}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
          {/* Left: parts list */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            {/* PC image */}
            <div className="relative h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=700&h=280&fit=crop&auto=format"
                alt="추천 PC 구성" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))" }} />
              <div style={{ position: "absolute", bottom: 16, left: 20 }}>
                <p className="text-white font-bold text-lg">조립 PC 견적 완성</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>7종 부품 · 호환성 100% 검증</p>
              </div>
              <div style={{ position: "absolute", top: 12, right: 12, background: C.success, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>
                ✓ 재고 확인 완료
              </div>
            </div>
            {/* Parts */}
            <div className="p-5" style={{ background: C.surface }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: C.textSub }}>부품 명세 7종</p>
              <div className="space-y-2">
                {componentsDummy.map(c => (
                  <div key={c.cat} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.bg }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: `${c.color}15` }}>
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${c.color}18`, color: c.color }}>{c.cat}</span>
                        <span className="text-xs" style={{ color: C.textSub }}>{c.detail}</span>
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: C.textBody }}>{c.name}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: C.primary }}>{c.price}</p>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="mt-4 p-4 rounded-xl flex items-center justify-between" style={{ background: C.primaryLight }}>
                <span className="text-sm font-semibold" style={{ color: C.primary }}>견적 합계</span>
                <span className="text-xl font-black" style={{ color: C.primary }}>{set.price}</span>
              </div>
            </div>
          </div>

          {/* Right: charts + actions */}
          <div className="flex flex-col gap-5">
            {/* Price + badges */}
            <div className="rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: C.textBody }}>{set.label} 견적 요약</h2>
                <span className="text-2xl">{set.emoji}</span>
              </div>
              <p className="text-4xl font-black mb-2" style={{ color: set.color }}>{set.price}</p>
              <div className="flex flex-wrap gap-2">
                {["당일 출고", "호환성 100%", "AS 3년 보증", "무료 배송"].map(b => (
                  <span key={b} className="text-xs px-2.5 py-1 rounded-full" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>{b}</span>
                ))}
              </div>
            </div>

            {/* FPS chart */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>🎮 예상 게임 FPS 성능</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={fpsDummyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="fps" />
                  <Tooltip formatter={(v: number) => [`${v} fps`]} />
                  <Bar dataKey="fps" radius={[6, 6, 0, 0]}>
                    {fpsDummyData.map((d, i) => <Cell key={i} fill={d.fps >= 200 ? C.success : d.fps >= 100 ? C.primary : C.warning} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>💰 가격 구성 비율</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pricePieData} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={28}>
                    {pricePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${(v / 10000).toFixed(0)}만원`]} />
                  <Legend iconSize={12} wrapperStyle={{ fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button onClick={() => navigate("beg-detail")}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all"
                style={{ background: C.surface, color: C.primary, border: `2px solid ${C.primary}` }}>
                🔧 부품 개별 변경하기
              </button>
              <button className="w-full h-14 rounded-xl text-base font-bold text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${C.primary}, #005fae)`, boxShadow: "0 4px 14px rgba(0,117,213,0.35)" }}>
                🛒 장바구니 담기
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

// ── Beg Detail (Swap) ─────────────────────────────────────────────────────
function BegDetail({ navigate }: { navigate: (s: Screen) => void }) {
  const [swapCat, setSwapCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const alts: Record<string, { name: string; detail: string; diff: string; badge?: string }[]> = {
    CPU: [
      { name: "AMD 라이젠 7 7700X", detail: "8코어 · 105W", diff: "+80,000원", badge: "성능 업" },
      { name: "Intel Core i7-14700K", detail: "20코어 · 125W", diff: "+120,000원", badge: "최고 성능" },
      { name: "AMD 라이젠 5 7500F", detail: "6코어 · 65W · GPU 내장 없음", diff: "-40,000원", badge: "절약" },
    ],
    GPU: [
      { name: "NVIDIA RTX 4080 16GB", detail: "GDDR6X · 320W", diff: "+420,000원", badge: "최고 성능" },
      { name: "NVIDIA RTX 4060 Ti 8GB", detail: "GDDR6 · 160W", diff: "-130,000원", badge: "절약" },
      { name: "AMD RX 7900 GRE 16GB", detail: "GDDR6 · 260W", diff: "+80,000원" },
    ],
    RAM: [
      { name: "삼성 DDR5 64GB (32×2)", detail: "5600MHz · 고용량", diff: "+120,000원", badge: "업그레이드" },
      { name: "SK하이닉스 DDR5 32GB", detail: "6000MHz · 고클럭", diff: "+20,000원" },
    ],
  };

  const currentAlts = swapCat ? (alts[swapCat] ?? [{ name: "현재 최적 구성", detail: "대안 부품 없음", diff: "-" }]) : [];

  return (
    <UserLayout current="beg-detail" navigate={navigate}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center gap-4">
          <button onClick={() => navigate("beg-result")}
            className="flex items-center gap-2 text-sm font-medium px-4 h-9 rounded-lg"
            style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>
            ← 견적으로 돌아가기
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: C.textStrong }}>부품 상세 및 교체</h1>
            <p className="text-xs" style={{ color: C.textSub }}>교체할 부품을 클릭하면 호환 대안이 표시됩니다</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: hasError ? "#fdecea" : "#e8f5e9", color: hasError ? C.error : C.success }}>
              {hasError ? "⚠ 호환성 오류" : "✓ 호환성 정상"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Parts list */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textSub }}>현재 구성 부품 7종</p>
            {componentsDummy.map(c => {
              const isError = c.cat === "CPU" && hasError;
              const isActive = swapCat === c.cat;
              return (
                <div key={c.cat}
                  onClick={() => { setSwapCat(c.cat); setSelected(null); if (c.cat === "CPU") setHasError(true); }}
                  className="rounded-2xl p-4 cursor-pointer transition-all"
                  style={{
                    background: isActive ? C.primaryLight : C.surface,
                    border: `2px solid ${isError ? C.error : isActive ? C.primary : C.line}`,
                    boxShadow: isActive ? `0 4px 12px rgba(0,117,213,0.15)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: isError ? "#fdecea" : `${c.color}15` }}>
                      {isError ? "⚠" : c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${c.color}18`, color: c.color }}>{c.cat}</span>
                        {isError
                          ? <span className="text-xs font-semibold" style={{ color: C.error }}>● 호환 오류</span>
                          : <span className="text-xs" style={{ color: C.success }}>● 정상</span>}
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: C.textBody }}>{c.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textSub }}>{c.detail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: C.primary }}>{c.price}</p>
                      <p className="text-xs mt-0.5 px-2 py-0.5 rounded" style={{ background: C.primaryLight, color: C.primary }}>변경 →</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swap panel */}
          <div className="sticky top-20">
            {swapCat ? (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.line}`, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div className="px-6 py-4" style={{ background: C.primary }}>
                  <p className="text-sm font-bold text-white">🔄 {swapCat} 교체 후보</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>현재 구성과 호환 검증된 대안만 표시됩니다</p>
                </div>
                <div className="p-5 space-y-3" style={{ background: C.surface }}>
                  {currentAlts.map(a => (
                    <div key={a.name}
                      onClick={() => setSelected(a.name)}
                      className="p-4 rounded-xl cursor-pointer transition-all"
                      style={{
                        border: `2px solid ${selected === a.name ? C.primary : C.line}`,
                        background: selected === a.name ? C.primaryLight : C.bg,
                      }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold" style={{ color: selected === a.name ? C.primary : C.textBody }}>{a.name}</p>
                            {a.badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#e8f5e9", color: C.success }}>{a.badge}</span>}
                          </div>
                          <p className="text-xs" style={{ color: C.textSub }}>{a.detail}</p>
                        </div>
                        <span className="text-sm font-bold shrink-0"
                          style={{ color: a.diff === "-" ? C.textSub : a.diff.startsWith("+") ? C.error : C.success }}>
                          {a.diff}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {selected && (
                  <div className="px-5 pb-5" style={{ background: C.surface }}>
                    <button
                      onClick={() => { setSwapCat(null); setSelected(null); setHasError(false); }}
                      className="w-full h-11 rounded-xl text-sm font-bold text-white"
                      style={{ background: C.primary }}>
                      ✓ {selected} 으로 교체 적용
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl flex flex-col items-center justify-center text-center"
                style={{ minHeight: 360, background: C.bg, border: `2px dashed ${C.line}` }}>
                <div className="text-5xl mb-4">🔧</div>
                <p className="text-base font-semibold mb-2" style={{ color: C.textBody }}>부품을 선택하세요</p>
                <p className="text-sm" style={{ color: C.textSub }}>왼쪽 목록에서 교체할 부품을<br />클릭하면 대안이 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
          <div>
            {hasError && (
              <p className="text-sm font-semibold" style={{ color: C.error }}>
                ⚠ 호환성 오류 해결 후 장바구니를 이용하세요.
              </p>
            )}
          </div>
          <button
            className={"h-14 px-10 rounded-xl text-base font-bold text-white transition-all" + (hasError ? " opacity-40 cursor-not-allowed" : "")}
            style={{ background: hasError ? "#ccc" : `linear-gradient(135deg, ${C.primary}, #005fae)`, boxShadow: hasError ? "none" : "0 4px 14px rgba(0,117,213,0.35)" }}
            disabled={hasError}>
            🛒 장바구니 담기
          </button>
        </div>
      </div>
    </UserLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EXPERT SCREENS
// ════════════════════════════════════════════════════════════════════════════

// ── Expert palette (dark-tech feel) ─────────────────────────────────────
const EXP = {
  accent: "#3b82f6",
  accentDark: "#1d4ed8",
  accentLight: "rgba(59,130,246,0.1)",
  surface: "#0f172a",
  panel: "#1e293b",
  border: "rgba(255,255,255,0.08)",
  text: "#e2e8f0",
  textSub: "#94a3b8",
};

const EXP_STEPS = [
  { num: 1, label: "우선순위·브랜드" },
  { num: 2, label: "CPU 세대" },
  { num: 3, label: "메모리·SSD" },
  { num: 4, label: "전력·쿨링" },
  { num: 5, label: "전문가 요청" },
];

function ExpStepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {EXP_STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background: s.num < current ? C.success : s.num === current ? EXP.accent : "rgba(255,255,255,0.08)",
                color: s.num <= current ? "#fff" : EXP.textSub,
                border: s.num === current ? `2px solid ${EXP.accent}` : "2px solid transparent",
              }}
            >
              {s.num < current ? "✓" : s.num}
            </div>
            <span className="text-xs font-medium hidden lg:block" style={{ color: s.num === current ? EXP.accent : s.num < current ? C.success : EXP.textSub }}>
              {s.label}
            </span>
          </div>
          {i < EXP_STEPS.length - 1 && (
            <div className="w-6 h-0.5 mx-2" style={{ background: s.num < current ? C.success : "rgba(255,255,255,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Shared dark shell for expert steps 1-4
function ExpShell({ step, navigate, title, subtitle, promptText, promptKeys, onPrev, onNext, nextScreen, children }: {
  step: number; navigate: (s: Screen) => void;
  title: string; subtitle: string;
  promptText: string; promptKeys: Record<string, string>;
  onPrev?: () => void; onNext?: () => void; nextScreen?: Screen;
  children: React.ReactNode;
}) {
  return (
    <UserLayout current={`exp-step${step}` as Screen} navigate={navigate}>
      {/* Dark step header */}
      <div style={{ background: EXP.surface, borderBottom: `1px solid ${EXP.border}` }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <ExpStepBar current={step} />
          <span className="text-xs" style={{ color: EXP.textSub }}>고급자 모드 · {step}/5 단계</span>
        </div>
      </div>

      {/* Content area — split dark bg left, light right */}
      <div style={{ background: "#f7f9fc", minHeight: "calc(100vh - 128px)" }}>
        <div className="max-w-6xl mx-auto px-8 py-10">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: EXP.accentLight, color: EXP.accent, border: `1px solid rgba(59,130,246,0.2)` }}>
                ⚙ EXPERT STEP {step}
              </span>
              <span className="text-xs" style={{ color: C.textSub }}>하드 제약 조건 — AI가 절대 준수합니다</span>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: C.textStrong }}>{title}</h1>
            <p className="text-sm mt-1.5" style={{ color: C.textSub }}>{subtitle}</p>
          </div>

          <div className="flex gap-6 items-start">
            {/* Main */}
            <div className="flex-1 min-w-0">{children}</div>

            {/* Expert AI prompt panel */}
            <div className="w-72 shrink-0 sticky top-20">
              <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid rgba(59,130,246,0.3)`, boxShadow: "0 4px 24px rgba(59,130,246,0.12)" }}>
                <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">⚙️</span>
                    <p className="text-sm font-bold" style={{ color: "#fff" }}>전문가 AI 요청서</p>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>선택한 조건이 하드 제약으로 반영됩니다</p>
                </div>
                <div className="p-5" style={{ background: "#0f172a" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.9 }}>
                    {promptText.split(/(\[[^\]]+\])/g).map((part, i) => {
                      const isKey = part.startsWith("[") && part.endsWith("]");
                      const key = isKey ? part.slice(1, -1) : null;
                      const val = key ? promptKeys[key] : null;
                      return isKey ? (
                        <span key={i} className="font-bold px-1.5 py-0.5 rounded mx-0.5 transition-all"
                          style={{ color: val && val !== "?" ? "#60a5fa" : EXP.textSub, background: val && val !== "?" ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)" }}>
                          {val || "?"}
                        </span>
                      ) : <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
                <div className="px-5 py-3" style={{ background: "#1e293b", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#f9a825" }} />
                    <span className="text-xs" style={{ color: EXP.textSub }}>AI 분석 대기 중</span>
                  </div>
                </div>
              </div>

              {/* Hard constraint badge */}
              <div className="mt-3 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#ef4444" }}>🔒 하드 제약 조건 (Hard Constraints)</p>
                <p className="text-xs" style={{ color: C.textSub }}>지정된 조건을 위반하는 부품은 점수 계산 없이 즉시 탈락 처리됩니다.</p>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between mt-10 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
            {onPrev ? (
              <button onClick={onPrev}
                className="flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold transition-all"
                style={{ background: C.surface, color: C.textBody, border: `1.5px solid ${C.line}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = EXP.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.line)}
              >
                ← 이전 단계
              </button>
            ) : <div />}
            <button
              onClick={onNext ?? (() => nextScreen && navigate(nextScreen))}
              className="flex items-center gap-2 px-8 h-11 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: EXP.accent, boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.background = EXP.accentDark)}
              onMouseLeave={e => (e.currentTarget.style.background = EXP.accent)}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

// ── Shared option card ─────────────────────────────────────────────────────
function ExpOptionCard({ label, sub, icon, selected, onClick, accentColor = EXP.accent }: {
  label: string; sub?: string; icon: string; selected: boolean; onClick: () => void; accentColor?: string;
}) {
  return (
    <div onClick={onClick}
      className="rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3"
      style={{
        background: selected ? `${accentColor}12` : C.surface,
        border: `2px solid ${selected ? accentColor : C.line}`,
        boxShadow: selected ? `0 4px 14px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.04)",
        transform: selected ? "translateY(-1px)" : "none",
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: selected ? `${accentColor}18` : C.bg }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: selected ? accentColor : C.textStrong }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: C.textSub }}>{sub}</p>}
      </div>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: selected ? accentColor : C.line, background: selected ? accentColor : "transparent" }}>
        {selected && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
      </div>
    </div>
  );
}

// ── Exp Step 1 — Priority & Brand ──────────────────────────────────────────
function ExpStep1({ navigate }: { navigate: (s: Screen) => void }) {
  const [cpu, setCpu] = useState("AMD");
  const [gpu, setGpu] = useState("NVIDIA");
  const [priority, setPriority] = useState(70);

  const cpuBrands = [
    { key: "Intel", icon: "🔵", sub: "LGA1700 소켓 · 14세대", color: "#0068b5" },
    { key: "AMD", icon: "🔴", sub: "AM5 소켓 · 라이젠 7000/9000", color: "#ed1c24" },
    { key: "상관없음", icon: "🤍", sub: "AI가 최적 선택", color: "#888" },
  ];
  const gpuBrands = [
    { key: "NVIDIA", icon: "🟢", sub: "RTX 시리즈 · DLSS 지원", color: "#76b900" },
    { key: "AMD", icon: "🔴", sub: "RX 시리즈 · FSR 지원", color: "#ed1c24" },
    { key: "상관없음", icon: "🤍", sub: "AI가 최적 선택", color: "#888" },
  ];

  const priorityLabel = priority >= 80 ? "극성능 우선" : priority >= 60 ? "성능 중심" : priority >= 40 ? "균형형" : "가성비 우선";
  const priorityColor = priority >= 80 ? "#ef4444" : priority >= 60 ? EXP.accent : priority >= 40 ? "#10a37f" : "#f59e0b";

  return (
    <ExpShell step={1} navigate={navigate}
      title="우선순위와 선호 브랜드를 지정하세요"
      subtitle="CPU·GPU 제조사는 하드 제약으로 적용됩니다. 위반 부품은 AI 후보에서 즉시 탈락합니다."
      promptText="[cpu_maker] CPU 필수, [gpu_maker] GPU 지정 조건을 절대 준수해 주십시오."
      promptKeys={{ cpu_maker: `CPU: ${cpu} 필수`, gpu_maker: `GPU: ${gpu} 지정` }}
      nextScreen="exp-step2"
    >
      {/* Priority slider */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: C.textStrong }}>가치 우선순위 설정</p>
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${priorityColor}15`, color: priorityColor }}>
            {priorityLabel}
          </span>
        </div>
        <div className="relative mb-2">
          <div className="h-3 rounded-full" style={{ background: C.line }}>
            <div className="h-3 rounded-full transition-all" style={{ width: `${priority}%`, background: `linear-gradient(90deg, #f59e0b, ${priorityColor})` }} />
          </div>
          <input type="range" min={0} max={100} value={priority} onChange={e => setPriority(+e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-3" />
        </div>
        <div className="flex justify-between text-xs" style={{ color: C.textSub }}>
          <span>💰 가성비 우선</span>
          <span className="font-bold" style={{ color: priorityColor }}>{priority}%</span>
          <span>🚀 극성능 우선</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* CPU */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔲</span>
            <div>
              <p className="text-sm font-bold" style={{ color: C.textStrong }}>CPU 제조사</p>
              <p className="text-xs" style={{ color: C.error }}>필수 고정 · 하드 제약</p>
            </div>
          </div>
          <div className="space-y-2">
            {cpuBrands.map(b => (
              <ExpOptionCard key={b.key} label={b.key} sub={b.sub} icon={b.icon}
                selected={cpu === b.key} onClick={() => setCpu(b.key)} accentColor={b.color} />
            ))}
          </div>
        </div>
        {/* GPU */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎮</span>
            <div>
              <p className="text-sm font-bold" style={{ color: C.textStrong }}>GPU 제조사</p>
              <p className="text-xs" style={{ color: C.error }}>필수 고정 · 하드 제약</p>
            </div>
          </div>
          <div className="space-y-2">
            {gpuBrands.map(b => (
              <ExpOptionCard key={b.key} label={b.key} sub={b.sub} icon={b.icon}
                selected={gpu === b.key} onClick={() => setGpu(b.key)} accentColor={b.color} />
            ))}
          </div>
        </div>
      </div>
    </ExpShell>
  );
}

// ── Exp Step 2 — CPU Generation ────────────────────────────────────────────
function ExpStep2({ navigate }: { navigate: (s: Screen) => void }) {
  const [maker, setMaker] = useState<"Intel" | "AMD">("AMD");
  const [gen, setGen] = useState("AMD 라이젠 9000");
  const [oc, setOc] = useState("X시리즈 (최고 성능)");

  const intelGens = [
    { key: "Intel 14세대", label: "14세대 Core (Raptor Lake-R)", sub: "LGA1700 · 최대 24코어", icon: "🔵" },
    { key: "Intel 13세대", label: "13세대 Core (Raptor Lake)", sub: "LGA1700 · 전세대 호환", icon: "🔵" },
  ];
  const amdGens = [
    { key: "AMD 라이젠 9000", label: "라이젠 9000 시리즈 (Zen 5)", sub: "AM5 소켓 · 최신 아키텍처", icon: "🔴" },
    { key: "AMD 라이젠 7000", label: "라이젠 7000 시리즈 (Zen 4)", sub: "AM5 소켓 · 검증된 안정성", icon: "🔴" },
  ];
  const ocOptions = [
    { key: "K시리즈 (오버클럭 가능)", label: "K시리즈", sub: "오버클럭 잠금 해제 · 추가 성능", icon: "⚡" },
    { key: "X시리즈 (최고 성능)", label: "X시리즈 (AMD)", sub: "최고 클럭 · 최상위 라인업", icon: "🔥" },
    { key: "기본 라인업", label: "기본 라인업", sub: "안정성 우선 · 일반 쿨러 호환", icon: "✅" },
  ];

  return (
    <ExpShell step={2} navigate={navigate}
      title="CPU 세대와 오버클럭 옵션을 선택하세요"
      subtitle="선택한 세대·소켓이 메인보드 필터에도 연동됩니다."
      promptText="CPU는 [cpu_gen] 조건, 오버클럭 [oc_line] 라인업을 반드시 준수해 주십시오."
      promptKeys={{ cpu_gen: gen, oc_line: oc }}
      onPrev={() => navigate("exp-step1")} nextScreen="exp-step3"
    >
      {/* Maker toggle */}
      <div className="flex gap-2 mb-5">
        {(["Intel", "AMD"] as const).map(m => (
          <button key={m} onClick={() => { setMaker(m); setGen(m === "Intel" ? "Intel 14세대" : "AMD 라이젠 9000"); }}
            className="flex-1 h-12 rounded-xl text-sm font-bold transition-all"
            style={{
              background: maker === m ? (m === "Intel" ? "#0068b5" : "#ed1c24") : C.surface,
              color: maker === m ? "#fff" : C.textBody,
              border: `2px solid ${maker === m ? (m === "Intel" ? "#0068b5" : "#ed1c24") : C.line}`,
            }}>
            {m === "Intel" ? "🔵 Intel" : "🔴 AMD"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Generation */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <p className="text-sm font-bold mb-4" style={{ color: C.textStrong }}>CPU 세대 선택</p>
          <div className="space-y-2">
            {(maker === "Intel" ? intelGens : amdGens).map(g => (
              <ExpOptionCard key={g.key} label={g.label} sub={g.sub} icon={g.icon}
                selected={gen === g.key} onClick={() => setGen(g.key)} />
            ))}
          </div>
        </div>
        {/* OC */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <p className="text-sm font-bold mb-4" style={{ color: C.textStrong }}>오버클럭 라인업</p>
          <div className="space-y-2">
            {ocOptions.map(o => (
              <ExpOptionCard key={o.key} label={o.label} sub={o.sub} icon={o.icon}
                selected={oc === o.key} onClick={() => setOc(o.key)} accentColor="#f59e0b" />
            ))}
          </div>
        </div>
      </div>
    </ExpShell>
  );
}

// ── Exp Step 3 — Memory & SSD ──────────────────────────────────────────────
function ExpStep3({ navigate }: { navigate: (s: Screen) => void }) {
  const [mem, setMem] = useState("DDR5");
  const [cap, setCap] = useState("32GB");
  const [ch, setCh] = useState("듀얼채널");
  const [ssd, setSsd] = useState("NVMe PCIe 5.0");

  const memTypes = [
    { key: "DDR5", icon: "🟣", sub: "고성능 · 최신 플랫폼 필수", color: "#8e24aa" },
    { key: "DDR4", icon: "🔵", sub: "안정적 · 광범위 호환성", color: "#1e88e5" },
  ];
  const caps = [
    { key: "16GB", icon: "📦", sub: "일반 게임·업무" },
    { key: "32GB", icon: "📦", sub: "고사양 게임·편집" },
    { key: "64GB 이상", icon: "📦", sub: "딥러닝·렌더링" },
  ];
  const ssdTypes = [
    { key: "NVMe PCIe 5.0", icon: "⚡", sub: "최대 14GB/s · 최신 플래그십", color: "#f4511e" },
    { key: "NVMe PCIe 4.0", icon: "🚀", sub: "최대 7GB/s · 가성비 최강", color: EXP.accent },
    { key: "SATA SSD", icon: "💾", sub: "최대 550MB/s · 대용량 저장", color: "#888" },
  ];

  return (
    <ExpShell step={3} navigate={navigate}
      title="메모리와 저장장치 규격을 지정하세요"
      subtitle="메모리 타입은 CPU 세대와 소켓에 따라 호환성이 자동 검증됩니다."
      promptText="메모리는 [mem_type] [ch], SSD는 [ssd_gen] 인터페이스 필수."
      promptKeys={{ mem_type: `${mem} ${cap}`, ch, ssd_gen: ssd }}
      onPrev={() => navigate("exp-step2")} nextScreen="exp-step4"
    >
      <div className="grid grid-cols-2 gap-5">
        {/* Memory */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🧠</span>
              <p className="text-sm font-bold" style={{ color: C.textStrong }}>메모리 타입</p>
            </div>
            <div className="space-y-2">
              {memTypes.map(m => (
                <ExpOptionCard key={m.key} label={m.key} sub={m.sub} icon={m.icon}
                  selected={mem === m.key} onClick={() => setMem(m.key)} accentColor={m.color} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <p className="text-sm font-bold mb-3" style={{ color: C.textStrong }}>최소 용량</p>
            <div className="space-y-2">
              {caps.map(c => (
                <ExpOptionCard key={c.key} label={c.key} sub={c.sub} icon={c.icon}
                  selected={cap === c.key} onClick={() => setCap(c.key)} accentColor="#8e24aa" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <p className="text-sm font-bold mb-3" style={{ color: C.textStrong }}>채널 구성</p>
            <div className="space-y-2">
              {["듀얼채널", "싱글채널"].map(c => (
                <ExpOptionCard key={c} label={c} icon={c === "듀얼채널" ? "⚡" : "➖"}
                  sub={c === "듀얼채널" ? "대역폭 2배 · 게임·편집 권장" : "슬롯 1개 · 추후 확장 고려"}
                  selected={ch === c} onClick={() => setCh(c)} />
              ))}
            </div>
          </div>
        </div>
        {/* SSD */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💾</span>
            <p className="text-sm font-bold" style={{ color: C.textStrong }}>SSD 인터페이스</p>
          </div>
          <div className="space-y-2 mb-5">
            {ssdTypes.map(s => (
              <ExpOptionCard key={s.key} label={s.key} sub={s.sub} icon={s.icon}
                selected={ssd === s.key} onClick={() => setSsd(s.key)} accentColor={s.color} />
            ))}
          </div>
          {/* Speed visualization */}
          <div className="rounded-xl p-4" style={{ background: C.bg }}>
            <p className="text-xs font-semibold mb-3" style={{ color: C.textSub }}>순차 읽기 속도 비교</p>
            {[
              { label: "PCIe 5.0", speed: 14000, max: 14000, color: "#f4511e" },
              { label: "PCIe 4.0", speed: 7000, max: 14000, color: EXP.accent },
              { label: "SATA", speed: 550, max: 14000, color: "#888" },
            ].map(s => (
              <div key={s.label} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: C.textBody }}>{s.label}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.speed >= 1000 ? `${(s.speed / 1000).toFixed(0)}GB/s` : `${s.speed}MB/s`}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: C.line }}>
                  <div className="h-2 rounded-full" style={{ width: `${(s.speed / s.max) * 100}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExpShell>
  );
}

// ── Exp Step 4 — Power & Cooling ───────────────────────────────────────────
const COOLER_OPTIONS = [
  { key: "대장급 공랭 (NH-D15)", icon: "🌀", sub: "190mm 타워 · 최고 소음 효율", watt: "250W TDP 대응", color: "#546e7a" },
  { key: "2열 수랭 (240mm AIO)", icon: "💧", sub: "240mm 라디에이터 · 균형형", watt: "280W TDP 대응", color: "#1e88e5" },
  { key: "3열 수랭 (360mm AIO)", icon: "❄️", sub: "360mm 라디에이터 · 고성능", watt: "350W TDP 대응", color: "#6a1b9a" },
  { key: "커스텀 수랭 (Custom Loop)", icon: "🔬", sub: "맞춤 배관 · 극한 냉각", watt: "500W+ TDP 대응", color: "#f4511e" },
];

function ExpStep4({ navigate }: { navigate: (s: Screen) => void }) {
  const [margin, setMargin] = useState(30);
  const [cooler, setCooler] = useState("3열 수랭 (360mm AIO)");
  const marginColor = margin >= 40 ? C.success : margin >= 30 ? EXP.accent : margin >= 20 ? C.warning : C.error;

  return (
    <ExpShell step={4} navigate={navigate}
      title="전력 여유와 쿨링 방식을 설정하세요"
      subtitle="파워 마진이 부족하면 고부하 시 시스템 불안정이 발생합니다. 30% 이상 권장."
      promptText="파워 마진 [power_margin] 이상 확보, [cooler] 조합을 반드시 도출하십시오."
      promptKeys={{ power_margin: `${margin}%`, cooler: cooler.split(" ")[0] + " " + cooler.split(" ")[1] }}
      onPrev={() => navigate("exp-step3")} nextScreen="exp-step5"
    >
      <div className="space-y-5">
        {/* Power margin */}
        <div className="rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-sm font-bold mb-0.5" style={{ color: C.textStrong }}>파워 전력 여유 마진율</p>
              <p className="text-xs" style={{ color: C.textSub }}>총 소비전력 대비 파워 정격 여유율</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black" style={{ color: marginColor }}>{margin}%</p>
              <p className="text-xs" style={{ color: marginColor }}>
                {margin >= 40 ? "✓ 충분" : margin >= 30 ? "✓ 적정" : margin >= 20 ? "⚠ 최소" : "✗ 위험"}
              </p>
            </div>
          </div>
          <div className="relative mb-3">
            <div className="h-4 rounded-full overflow-hidden" style={{ background: C.line }}>
              <div className="h-4 rounded-full transition-all"
                style={{ width: `${((margin - 10) / 50) * 100}%`, background: `linear-gradient(90deg, #ef4444, ${marginColor})` }} />
            </div>
            <input type="range" min={10} max={60} step={5} value={margin} onChange={e => setMargin(+e.target.value)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
          </div>
          <div className="flex justify-between text-xs mb-4" style={{ color: C.textSub }}>
            <span>10% (위험)</span><span>30% (권장)</span><span>60% (여유)</span>
          </div>
          {/* Quick presets */}
          <div className="flex gap-2">
            {[{ v: 20, label: "절약형 20%" }, { v: 30, label: "권장 30%" }, { v: 40, label: "안전 40%" }].map(p => (
              <button key={p.v} onClick={() => setMargin(p.v)}
                className="flex-1 h-9 rounded-lg text-xs font-semibold transition-all"
                style={{ background: margin === p.v ? marginColor : C.bg, color: margin === p.v ? "#fff" : C.textBody, border: `1.5px solid ${margin === p.v ? marginColor : C.line}` }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cooler */}
        <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🌡️</span>
            <p className="text-sm font-bold" style={{ color: C.textStrong }}>쿨링 솔루션 선택</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COOLER_OPTIONS.map(c => (
              <div key={c.key}
                onClick={() => setCooler(c.key)}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{
                  background: cooler === c.key ? `${c.color}10` : C.bg,
                  border: `2px solid ${cooler === c.key ? c.color : C.line}`,
                  boxShadow: cooler === c.key ? `0 4px 12px ${c.color}25` : "none",
                }}>
                <div className="text-2xl mb-2">{c.icon}</div>
                <p className="text-xs font-bold mb-0.5" style={{ color: cooler === c.key ? c.color : C.textStrong }}>
                  {c.key.split(" ")[0]} {c.key.split(" ")[1]}
                </p>
                <p className="text-xs" style={{ color: C.textSub }}>{c.sub}</p>
                <div className="mt-2 text-xs font-semibold px-2 py-0.5 rounded-full inline-block"
                  style={{ background: `${c.color}15`, color: c.color }}>{c.watt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExpShell>
  );
}

// ── Exp Step 5 — Expert Prompt ─────────────────────────────────────────────
function ExpStep5({ navigate }: { navigate: (s: Screen) => void }) {
  const defaultText = `안녕하세요! 직접 스펙을 통제하려는 고급자입니다.\n[CPU: AMD AM5 소켓 기반 9000시리즈 필수], [GPU: NVIDIA 칩셋 지정]\n조건을 절대 준수해 주십시오. 메모리는 [DDR5 32GB 듀얼 채널 고주파 클럭],\n[정격 전력 마진 30% 이상], [3열 수랭 쿨러] 조합의 JSON 명세를 도출하십시오.\n물리 치수·소켓·전력 호환성을 5단계 모두 검증하여 응답해 주세요.`;
  const [text, setText] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState({ gemini: "대기", chatgpt: "대기", claude: "대기" });
  const aiColor: Record<string, string> = { "대기": EXP.textSub, "분석중": C.warning, "완료": C.success };

  const handleRecommend = () => {
    setLoading(true); setProgress(0);
    setTimeout(() => setAiStatus(p => ({ ...p, gemini: "분석중" })), 300);
    setTimeout(() => setAiStatus(p => ({ ...p, chatgpt: "분석중" })), 700);
    setTimeout(() => setAiStatus(p => ({ ...p, claude: "분석중" })), 1000);
    const iv = setInterval(() => setProgress(p => Math.min(p + 4, 90)), 60);
    setTimeout(() => setAiStatus(p => ({ ...p, gemini: "완료" })), 1500);
    setTimeout(() => setAiStatus(p => ({ ...p, chatgpt: "완료" })), 1800);
    setTimeout(() => setAiStatus(p => ({ ...p, claude: "완료" })), 2100);
    setTimeout(() => { clearInterval(iv); setProgress(100); }, 2200);
    setTimeout(() => navigate("exp-result"), 2600);
  };

  return (
    <UserLayout current="exp-step5" navigate={navigate}>
      {/* Dark header */}
      <div style={{ background: EXP.surface, borderBottom: `1px solid ${EXP.border}` }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <ExpStepBar current={5} />
          <span className="text-xs" style={{ color: EXP.textSub }}>고급자 모드 · 5/5 단계</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: EXP.accentLight, color: EXP.accent, border: `1px solid rgba(59,130,246,0.2)` }}>
              ⚙ EXPERT STEP 5 — 마지막 단계
            </span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: C.textStrong }}>전문가 AI 요청서 최종 검토</h1>
          <p className="text-sm mt-1.5" style={{ color: C.textSub }}>자동 조립된 요청서를 자유롭게 편집하고 3대 AI에게 전송하세요.</p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
          {/* Textarea */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.line}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: EXP.surface }}>
              <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>⚙️ 전문가 AI 요청서 (완전 편집 모드)</span>
              <span className="text-xs" style={{ color: EXP.textSub }}>{text.length}자</span>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)}
              className="w-full p-5 text-sm resize-none outline-none"
              rows={10}
              style={{ color: C.textBody, lineHeight: 1.9, fontFamily: "'Noto Sans KR', monospace", border: "none", background: "#f8fbff" }} />
            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "#f0f7ff", borderTop: `1px solid ${C.line}` }}>
              <span className="text-xs" style={{ color: C.textSub }}>💡 시스템 지시문은 전송 시 자동 결합됩니다. 물리 치수·TDP 조건을 명시할수록 정확도가 높아집니다.</span>
            </div>
          </div>

          {/* AI status panel */}
          <div className="w-56 shrink-0">
            <div className="rounded-2xl p-5" style={{ background: EXP.surface }}>
              <p className="text-xs font-semibold mb-4" style={{ color: EXP.textSub }}>AI 엔진 상태</p>
              <div className="space-y-3">
                {[
                  { name: "Google Gemini", key: "gemini" as const, color: "#4285f4" },
                  { name: "OpenAI ChatGPT", key: "chatgpt" as const, color: "#10a37f" },
                  { name: "Anthropic Claude", key: "claude" as const, color: "#d97757" },
                ].map(ai => (
                  <div key={ai.key} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: ai.color }}>
                      {ai.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "#e2e8f0" }}>{ai.name.split(" ")[1]}</p>
                      <p className="text-xs" style={{ color: aiColor[aiStatus[ai.key]] }}>
                        {aiStatus[ai.key] === "완료" ? "●" : aiStatus[ai.key] === "분석중" ? "◐" : "○"} {aiStatus[ai.key]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {loading && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: EXP.textSub }}>정밀 분석 중</span>
                    <span style={{ color: EXP.accent }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${EXP.accent}, #34d399)` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#ef4444" }}>🔒 Fail-safe 적용</p>
              <p className="text-xs" style={{ color: C.textSub }}>7초 내 미응답 모델 자동 탈락, 나머지로 완성</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
          <button onClick={() => navigate("exp-step4")}
            className="flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold transition-all"
            style={{ background: C.surface, color: C.textBody, border: `1.5px solid ${C.line}` }}>
            ← 이전 단계
          </button>
          <button onClick={handleRecommend} disabled={loading}
            className="flex items-center gap-3 px-10 h-14 rounded-xl font-bold text-white transition-all"
            style={{ background: loading ? EXP.textSub : `linear-gradient(135deg, ${EXP.accent}, ${EXP.accentDark})`, fontSize: 16, boxShadow: loading ? "none" : "0 6px 20px rgba(59,130,246,0.4)" }}>
            {loading ? "⚙️ AI 정밀 분석 중..." : "🚀 전문가 견적 받기"}
          </button>
        </div>
      </div>
    </UserLayout>
  );
}

// ── Exp Result ─────────────────────────────────────────────────────────────
const compatMatrix = [
  { item: "CPU 소켓 일치 (AM5)", status: "✓ 정상", value: "100%", ok: true },
  { item: "메모리 규격 호환 (DDR5)", status: "✓ 정상", value: "5600MHz", ok: true },
  { item: "파워 정격 마진", status: "✓ 여유", value: "132%", ok: true },
  { item: "쿨러 발열 TDP 감당", status: "✓ 안전", value: "130W→120W", ok: true },
  { item: "케이스 실장 공간 (ATX)", status: "✓ 적합", value: "E-ATX 지원", ok: true },
];

const expComponentsDummy = [
  { cat: "CPU", icon: "🔲", name: "AMD 라이젠 9 9950X", detail: "16코어 / AM5 / 170W", price: "580,000원", color: "#e53935" },
  { cat: "GPU", icon: "🎮", name: "NVIDIA RTX 4090 24GB", detail: "GDDR6X / 450W TDP", price: "1,980,000원", color: "#43a047" },
  { cat: "RAM", icon: "🧠", name: "G.Skill DDR5 64GB (32×2)", detail: "6400MHz / CL32", price: "280,000원", color: "#8e24aa" },
  { cat: "SSD", icon: "💾", name: "Samsung 990 Pro 2TB NVMe", detail: "PCIe 5.0 / 14,000MB/s", price: "240,000원", color: "#1e88e5" },
  { cat: "메인보드", icon: "🔌", name: "ASUS ROG Crosshair X670E", detail: "E-ATX / WiFi 6E", price: "420,000원", color: "#f4511e" },
  { cat: "파워", icon: "⚡", name: "시소닉 PRIME TX-1300W", detail: "1300W / 80+ Titanium", price: "280,000원", color: "#f9a825" },
  { cat: "쿨러", icon: "❄️", name: "Corsair H150i Elite Capellix", detail: "360mm / 3×120mm", price: "180,000원", color: "#6a1b9a" },
  { cat: "케이스", icon: "📦", name: "Fractal Design Torrent XL", detail: "E-ATX / 최대 공랭", price: "180,000원", color: "#546e7a" },
];

function ExpResult({ navigate }: { navigate: (s: Screen) => void }) {
  const benchData = [
    { name: "3DMark TS", score: 18500 },
    { name: "Cinebench R23", score: 48600 },
    { name: "PCMark 10", score: 9800 },
    { name: "Blender", score: 620 },
  ];
  const lowFpsData = [
    { name: "사이버펑크 RT", fps: 142 },
    { name: "배틀그라운드", fps: 240 },
    { name: "포트나이트", fps: 340 },
  ];

  return (
    <UserLayout current="exp-result" navigate={navigate}>
      {/* Result hero — dark expert theme */}
      <div style={{ background: "linear-gradient(135deg, #080e1c 0%, #0f172a 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="max-w-6xl mx-auto px-8 py-10 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                  ✓ 전문가 분석 완료
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: EXP.accentLight, color: EXP.accent, border: `1px solid rgba(59,130,246,0.3)` }}>
                  ⚙ 5대 호환성 검증 통과
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">전문가 맞춤 견적 리포트</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>AMD 9950X + RTX 4090 · DDR5 64GB · PCIe 5.0 기준 최적 구성</p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>전문가 견적 합계</p>
              <p className="text-4xl font-black" style={{ color: EXP.accent }}>4,140,000원</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>당일 출고 · Fail-safe 검증 완료</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
          {/* Left: parts */}
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: EXP.surface }}>
              <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>부품 명세 8종</p>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>✓ 재고 확인 완료</span>
            </div>
            <div className="p-5" style={{ background: C.surface }}>
              <div className="space-y-2">
                {expComponentsDummy.map(c => (
                  <div key={c.cat} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.bg }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${c.color}15` }}>{c.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${c.color}18`, color: c.color }}>{c.cat}</span>
                        <span className="text-xs" style={{ color: C.textSub }}>{c.detail}</span>
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: C.textBody }}>{c.name}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: EXP.accent }}>{c.price}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-xl flex items-center justify-between"
                style={{ background: `${EXP.accent}12`, border: `1px solid ${EXP.accent}33` }}>
                <span className="text-sm font-semibold" style={{ color: EXP.accent }}>견적 합계</span>
                <span className="text-xl font-black" style={{ color: EXP.accent }}>4,140,000원</span>
              </div>
            </div>
          </div>

          {/* Right: analytics */}
          <div className="flex flex-col gap-5">
            {/* Benchmark */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>📊 벤치마크 점수</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={benchData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {benchData.map((_, i) => <Cell key={i} fill={[EXP.accent, "#8e24aa", "#10a37f", "#f4511e"][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 1% Low FPS */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>🎮 1% Low FPS 분석</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={lowFpsData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="fps" />
                  <Tooltip formatter={(v: number) => [`${v} fps`]} />
                  <Bar dataKey="fps" fill="#4db6ac" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compat matrix */}
            <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>🔒 5대 호환성 매트릭스</p>
              <div className="space-y-2">
                {compatMatrix.map(r => (
                  <div key={r.item} className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{ background: r.ok ? "#e8f5e9" : "#fdecea" }}>
                    <span className="text-xs" style={{ color: C.textBody }}>{r.item}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: C.textSub }}>{r.value}</span>
                      <span className="text-xs font-bold" style={{ color: r.ok ? C.success : C.error }}>{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button onClick={() => navigate("exp-detail")}
                className="w-full h-12 rounded-xl text-sm font-semibold transition-all"
                style={{ background: C.surface, color: EXP.accent, border: `2px solid ${EXP.accent}` }}>
                🔧 연쇄 부품 변경하기
              </button>
              <button className="w-full h-14 rounded-xl text-base font-bold text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${EXP.accent}, ${EXP.accentDark})`, boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
                🛒 장바구니 담기
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

// ── Exp Detail — Chain Swap ─────────────────────────────────────────────────
function ExpDetail({ navigate }: { navigate: (s: Screen) => void }) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [chainSel, setChainSel] = useState("");
  const [chainResolved, setChainResolved] = useState(false);

  const chainOpts = [
    { label: "시소닉 PRIME TX-1300W", sub: "80+ Titanium · 최고 효율", diff: "+80,000원", badge: "추천" },
    { label: "비콰이어트 Dark Power 13 1300W", sub: "80+ Titanium · 정숙", diff: "+120,000원", badge: "" },
  ];

  return (
    <UserLayout current="exp-detail" navigate={navigate}>
      {/* Header */}
      <div style={{ background: EXP.surface, borderBottom: `1px solid ${EXP.border}` }}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center gap-4">
          <button onClick={() => navigate("exp-result")}
            className="flex items-center gap-2 text-sm font-medium px-4 h-9 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}>
            ← 견적으로 돌아가기
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>부품 상세 및 연쇄 변경 (Chain Swap)</h1>
            <p className="text-xs" style={{ color: EXP.textSub }}>부품 변경 시 연관 부품 교체를 AI가 자동으로 제안합니다</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ background: hasError && !chainResolved ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: hasError && !chainResolved ? "#ef4444" : "#22c55e" }}>
              {hasError && !chainResolved ? "⚠ 호환성 오류" : "✓ 호환성 정상"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Parts */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textSub }}>현재 구성 부품 8종 — GPU 변경 시 연쇄 스왑 발생</p>
            {expComponentsDummy.map(c => {
              const isErrorPart = (c.cat === "GPU" || c.cat === "파워") && hasError && !chainResolved;
              const isActive = activeCat === c.cat;
              return (
                <div key={c.cat}
                  onClick={() => { setActiveCat(c.cat); if (c.cat === "GPU") { setHasError(true); setChainResolved(false); } }}
                  className="rounded-2xl p-4 cursor-pointer transition-all"
                  style={{
                    background: isActive ? `${EXP.accent}10` : C.surface,
                    border: `2px solid ${isErrorPart ? C.error : isActive ? EXP.accent : C.line}`,
                    boxShadow: isActive ? `0 4px 12px rgba(59,130,246,0.15)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: isErrorPart ? "#fdecea" : `${c.color}15` }}>
                      {isErrorPart ? "⚠" : c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${c.color}18`, color: c.color }}>{c.cat}</span>
                        {isErrorPart
                          ? <span className="text-xs font-semibold" style={{ color: C.error }}>● {c.cat === "GPU" ? "변경 — 파워 연쇄 필요" : "파워 용량 부족"}</span>
                          : <span className="text-xs" style={{ color: C.success }}>● 정상</span>}
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: C.textBody }}>{c.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textSub }}>{c.detail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: EXP.accent }}>{c.price}</p>
                      <p className="text-xs mt-0.5 px-2 py-0.5 rounded" style={{ background: `${EXP.accent}15`, color: EXP.accent }}>변경 →</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chain swap panel */}
          <div className="sticky top-20">
            {hasError && !chainResolved ? (
              <div className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.error}`, boxShadow: "0 8px 32px rgba(211,47,47,0.15)" }}>
                <div className="px-6 py-4" style={{ background: "#fdecea" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.error }}>연쇄 변경이 필요합니다 (Chain Swap)</p>
                      <p className="text-xs mt-0.5" style={{ color: "#b71c1c" }}>GPU 변경으로 파워서플라이도 교체가 필요합니다</p>
                    </div>
                  </div>
                </div>
                <div className="p-6" style={{ background: C.surface }}>
                  <p className="text-sm mb-2" style={{ color: C.textBody }}>
                    선택한 그래픽카드의 TDP가 현재 파워 정격을 초과합니다.
                    <strong> 1300W 이상 파워</strong>로 함께 변경해야 조립이 가능합니다.
                  </p>
                  <p className="text-xs mb-5 p-3 rounded-lg" style={{ color: "#b71c1c", background: "#fdecea" }}>
                    🔒 물리 제약: 현재 파워(850W) → GPU 소비전력(450W) + 시스템(400W) = 850W 초과
                  </p>
                  <div className="space-y-3 mb-5">
                    {chainOpts.map(o => (
                      <div key={o.label}
                        onClick={() => setChainSel(o.label)}
                        className="p-4 rounded-xl cursor-pointer transition-all"
                        style={{ border: `2px solid ${chainSel === o.label ? EXP.accent : C.line}`, background: chainSel === o.label ? `${EXP.accent}10` : C.bg }}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold" style={{ color: chainSel === o.label ? EXP.accent : C.textBody }}>{o.label}</p>
                              {o.badge && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#e8f5e9", color: C.success }}>{o.badge}</span>}
                            </div>
                            <p className="text-xs" style={{ color: C.textSub }}>{o.sub}</p>
                          </div>
                          <span className="text-sm font-bold shrink-0" style={{ color: C.error }}>{o.diff}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { if (chainSel) { setChainResolved(true); setHasError(false); } }}
                    className="w-full h-12 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ background: chainSel ? `linear-gradient(135deg, ${EXP.accent}, ${EXP.accentDark})` : "#ccc", boxShadow: chainSel ? "0 4px 14px rgba(59,130,246,0.3)" : "none" }}
                    disabled={!chainSel}>
                    ✓ 연쇄 변경하고 계속하기
                  </button>
                  <p className="text-xs mt-2 text-center" style={{ color: C.textSub }}>승인 시 파워가 자동 교체되고 위험 상태가 해제됩니다.</p>
                </div>
              </div>
            ) : chainResolved ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: "#e8f5e9", border: `2px solid ${C.success}` }}>
                <div className="text-4xl mb-3">✅</div>
                <p className="text-base font-bold mb-1" style={{ color: C.success }}>연쇄 변경 완료</p>
                <p className="text-sm" style={{ color: "#2e7d32" }}>파워가 교체되어 호환성이 복구되었습니다.<br />모든 부품이 정상 상태입니다.</p>
              </div>
            ) : activeCat ? (
              <div className="rounded-2xl p-6 text-center" style={{ background: C.bg, border: `2px dashed ${C.line}` }}>
                <div className="text-4xl mb-3">🔧</div>
                <p className="text-base font-semibold mb-1" style={{ color: C.textBody }}>{activeCat} 변경 대기</p>
                <p className="text-sm" style={{ color: C.textSub }}>이 부품에 대한 대안 목록은<br />실제 구현 시 API에서 불러옵니다.</p>
              </div>
            ) : (
              <div className="rounded-2xl flex flex-col items-center justify-center text-center"
                style={{ minHeight: 380, background: C.bg, border: `2px dashed ${C.line}` }}>
                <div className="text-5xl mb-4">🔗</div>
                <p className="text-base font-semibold mb-2" style={{ color: C.textBody }}>부품을 선택하세요</p>
                <p className="text-sm" style={{ color: C.textSub }}>왼쪽 목록에서 변경할 부품을<br />클릭하세요. GPU 변경 시 연쇄<br />스왑이 자동으로 제안됩니다.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: `1px solid ${C.line}` }}>
          <div>
            {hasError && !chainResolved && (
              <p className="text-sm font-semibold" style={{ color: C.error }}>⚠ 연쇄 스왑을 승인하면 장바구니를 이용할 수 있습니다.</p>
            )}
          </div>
          <button
            className={"h-14 px-10 rounded-xl text-base font-bold text-white transition-all" + (hasError && !chainResolved ? " opacity-40 cursor-not-allowed" : "")}
            style={{ background: hasError && !chainResolved ? "#ccc" : `linear-gradient(135deg, ${EXP.accent}, ${EXP.accentDark})`, boxShadow: hasError && !chainResolved ? "none" : "0 4px 14px rgba(59,130,246,0.35)" }}
            disabled={hasError && !chainResolved}>
            🛒 장바구니 담기
          </button>
        </div>
      </div>
    </UserLayout>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADMIN SCREENS
// ════════════════════════════════════════════════════════════════════════════

const costLineData = [
  { time: "09:00", Gemini: 2.9, ChatGPT: 4.8, Claude: 5.9 },
  { time: "10:00", Gemini: 4.9, ChatGPT: 7.3, Claude: 9.5 },
  { time: "11:00", Gemini: 8.1, ChatGPT: 11.3, Claude: 13.0 },
  { time: "12:00", Gemini: 11.5, ChatGPT: 16.0, Claude: 18.3 },
  { time: "13:00", Gemini: 14.1, ChatGPT: 20.6, Claude: 24.4 },
  { time: "14:00", Gemini: 17.5, ChatGPT: 25.5, Claude: 30.9 },
];

function AdmDashboard({ navigate }: { navigate: (s: Screen) => void }) {
  const models = [
    { name: "Google Gemini", cost: "17,500원", color: "#4285f4" },
    { name: "OpenAI ChatGPT", cost: "25,480원", color: "#10a37f" },
    { name: "Anthropic Claude", cost: "30,940원", color: "#d97757" },
  ];
  return (
    <AdminLayout current="adm-dashboard" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>통합 운영 대시보드</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {models.map(m => (
          <Card key={m.name}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: C.textSub }}>{m.name}</h3>
            <div className="text-3xl font-bold" style={{ color: m.color }}>{m.cost}</div>
            <p className="text-xs mt-1" style={{ color: C.textSub }}>오늘 누적 비용</p>
          </Card>
        ))}
      </div>
      <Card className="mb-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>일일 누적 비용 추이 (시간별)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={costLineData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="time" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} tickFormatter={v => `${v}천원`} />
            <Tooltip formatter={(v: number) => `${(v * 1000).toLocaleString()}원`} />
            <Legend iconSize={12} wrapperStyle={{ fontSize: 13 }} />
            <Line type="monotone" dataKey="Gemini" stroke="#4285f4" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ChatGPT" stroke="#10a37f" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Claude" stroke="#d97757" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1" style={{ color: C.textBody }}>비용 차단 임계치 (Circuit Breaker)</h2>
            <div className="flex items-center gap-2">
              <span style={{ color: C.success }}>●</span>
              <span className="text-sm" style={{ color: C.textBody }}>정상 운영 중 — 일일 한도 <strong>70,000원</strong> 대비 현재 73,920원 (⚠ 초과 주의)</span>
            </div>
          </div>
          <button className={btn.danger + " text-sm"} style={{ background: C.error }}>🚨 비용 차단 임계 설정</button>
        </div>
      </Card>
    </AdminLayout>
  );
}

function AdmMonitoring({ navigate }: { navigate: (s: Screen) => void }) {
  const [period, setPeriod] = useState<"분당" | "시간당" | "일별">("시간당");
  const models = [
    { model: "Google Gemini 1.5 Pro", inTok: "1,240,000", outTok: "820,000", speed: "2.1s" },
    { model: "OpenAI GPT-4o", inTok: "1,580,000", outTok: "940,000", speed: "1.8s" },
    { model: "Anthropic Claude 3.5", inTok: "1,820,000", outTok: "1,100,000", speed: "2.4s" },
  ];
  return (
    <AdminLayout current="adm-monitoring" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>AI API 트래픽 모니터링</h1>
      <div className="flex gap-2 mb-4">
        {(["분당", "시간당", "일별"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="px-4 h-8 rounded-md text-sm font-medium transition-all"
            style={{ background: period === p ? C.primary : C.surface, color: period === p ? "#fff" : C.textBody, border: `1px solid ${period === p ? C.primary : C.line}` }}>
            {p}
          </button>
        ))}
      </div>
      <Card>
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>모델별 토큰 사용량 ({period})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              {["모델", "입력 토큰", "출력 토큰", "평균 응답속도"].map(h => (
                <th key={h} className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map(m => (
              <tr key={m.model} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-3 font-medium" style={{ color: C.textBody }}>{m.model}</td>
                <td className="py-3" style={{ color: C.primary }}>{m.inTok}</td>
                <td className="py-3" style={{ color: "#4db6ac" }}>{m.outTok}</td>
                <td className="py-3" style={{ color: C.textBody }}>{m.speed}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>분당/시간당/일별 토글 · logs 테이블 고속 집계</p>
      </Card>
    </AdminLayout>
  );
}

function AdmRateLimit({ navigate }: { navigate: (s: Screen) => void }) {
  const [limits, setLimits] = useState({ 일반회원: 10, 우수회원: 50, 딜러: 200 });
  const [blockInput, setBlockInput] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <AdminLayout current="adm-rate-limit" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>회원별 AI 추천 이용 제한</h1>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>등급별 일일 호출 한도</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              <th className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>등급</th>
              <th className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>일일 최대 횟수</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(limits) as [keyof typeof limits, number][]).map(([grade, val]) => (
              <tr key={grade} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-3 font-medium" style={{ color: C.textBody }}>{grade}</td>
                <td className="py-3">
                  <input
                    type="number" value={val}
                    onChange={e => setLimits(p => ({ ...p, [grade]: +e.target.value }))}
                    className="w-24 h-8 px-2 rounded text-sm"
                    style={{ border: `1px solid ${C.line}` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="mb-4">
        <h3 className="text-base font-semibold mb-3" style={{ color: C.textBody }}>특정 회원/IP 개별 차단</h3>
        <div className="flex gap-2">
          <input
            value={blockInput} onChange={e => setBlockInput(e.target.value)}
            placeholder="회원ID 또는 IP 주소"
            className="flex-1 h-10 px-3 rounded-md text-sm"
            style={{ border: `1px solid ${C.line}` }}
          />
          <button className={btn.danger + " text-sm"} style={{ background: C.error }}>차단 추가</button>
        </div>
      </Card>
      <div className="flex justify-end">
        <button className={btn.primary} style={{ background: C.primary }} onClick={() => setSaved(true)}>정책 저장</button>
      </div>
      {saved && <div className="mt-3 p-3 rounded-md text-sm" style={{ background: "#e8f5e9", color: C.success }}>✓ 저장 완료 — 카운터에 즉시 반영됩니다.</div>}
      <p className="text-xs mt-2" style={{ color: C.textSub }}>저장 시 카운터에 즉시 캐싱 반영됩니다.</p>
    </AdminLayout>
  );
}

function AdmMaster({ navigate }: { navigate: (s: Screen) => void }) {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const products = [
    { code: "101268", name: "라이젠 R5 1400", cat: "CPU", status: "판매중" },
    { code: "102341", name: "GTX 1050 Ti 4GB", cat: "그래픽카드", status: "품절" },
    { code: "103892", name: "삼성 DDR5 16GB", cat: "메모리", status: "판매중" },
    { code: "104012", name: "WD Black SN850X 1TB", cat: "SSD", status: "판매중" },
    { code: "105233", name: "ASUS Z790 Prime", cat: "메인보드", status: "단종" },
  ];
  const statusColors: Record<string, string> = { "판매중": C.success, "품절": C.textSub, "단종": C.error, "삭제대기": C.warning };
  return (
    <AdminLayout current="adm-master" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>상품 마스터 관리</h1>
      <Card className="mb-4">
        <div className="flex gap-2 flex-wrap">
          <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }}>
            <option value="">카테고리 전체</option>
            {["CPU", "그래픽카드", "메모리", "SSD", "메인보드", "파워", "케이스"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }}>
            <option value="">상태 전체</option>
            {["판매중", "품절", "단종", "삭제대기"].map(s => <option key={s}>{s}</option>)}
          </select>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="키워드 (예: RTX)" className="flex-1 h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }} />
          <button className={btn.primary + " text-sm"} style={{ background: C.primary }}>검색</button>
          <button className={btn.secondary + " text-sm"} style={{ borderColor: C.primary, color: C.primary }} onClick={() => navigate("adm-product-edit")}>+ 신규 등록</button>
        </div>
      </Card>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              {["상품코드", "상품명", "카테고리", "상태", "관리"].map(h => (
                <th key={h} className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.code} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-3 font-mono text-xs" style={{ color: C.textSub }}>{p.code}</td>
                <td className="py-3 font-medium" style={{ color: C.textBody }}>{p.name}</td>
                <td className="py-3 text-xs" style={{ color: C.textBody }}>{p.cat}</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${statusColors[p.status]}22`, color: statusColors[p.status] }}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3">
                  <button onClick={() => navigate("adm-product-edit")} className="px-3 h-7 rounded text-xs font-semibold" style={{ background: C.primaryLight, color: C.primary }}>수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: C.textSub }}>50개 단위 페이징 · 0.3초 이내 스캔</p>
          <div className="flex gap-1">
            {["◂", "1", "2", "3", "▸"].map(p => (
              <button key={p} className="w-8 h-8 rounded text-sm" style={{ border: `1px solid ${C.line}`, background: p === "1" ? C.primary : C.surface, color: p === "1" ? "#fff" : C.textBody }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}

function AdmProductEdit({ navigate }: { navigate: (s: Screen) => void }) {
  const [saved, setSaved] = useState(false);
  const [code] = useState("101268");
  const [name, setName] = useState("AMD 라이젠 5 7600X");
  const [maker, setMaker] = useState("AMD");
  const [cat, setCat] = useState("CPU");
  const [statVal, setStatVal] = useState("판매중");
  const [socket, setSocket] = useState("AM5");
  const [watt, setWatt] = useState("105");
  const [width, setWidth] = useState("40");
  const [tags, setTags] = useState<string[]>(["#저소음"]);
  return (
    <AdminLayout current="adm-product-edit" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>상품 등록 / 수정</h1>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>기본 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>자체상품코드 (PK, 읽기전용)</label>
            <input value={code} readOnly className="w-full h-10 px-3 rounded-md text-sm bg-gray-50" style={{ border: `1px solid ${C.line}`, color: C.textSub }} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>상품명</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>제조사</label>
            <input value={maker} onChange={e => setMaker(e.target.value)} className="w-full h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>카테고리</label>
            <select value={cat} onChange={e => setCat(e.target.value)} className="w-full h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }}>
              {["CPU", "그래픽카드", "메모리", "SSD", "메인보드", "파워", "케이스"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>상태값</label>
            <select value={statVal} onChange={e => setStatVal(e.target.value)} className="w-full h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }}>
              {["판매중", "품절", "단종", "삭제대기"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Card>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-1" style={{ color: C.textBody }}>AI 연산 필드 (필수 검증) *</h2>
        <p className="text-xs mb-4" style={{ color: C.textSub }}>추천 엔진이 호환성·전력 검증에 사용합니다.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "소켓 규격 *", val: socket, set: setSocket, ph: "AM5" },
            { label: "소비전력 W *", val: watt, set: setWatt, ph: "105" },
            { label: "부품 가로 mm *", val: width, set: setWidth, ph: "40" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.primary}` }} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-3" style={{ color: C.textBody }}>외관 감성 속성</h2>
        <div className="flex gap-2">
          {["#화이트", "#RGB LED", "#저소음"].map(t => <Chip key={t} label={t} selected={tags.includes(t)} onClick={() => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])} />)}
        </div>
      </Card>
      <div className="flex justify-between">
        <button onClick={() => navigate("adm-master")} className={btn.secondary} style={{ borderColor: C.line, color: C.textBody }}>← 목록으로</button>
        <button className={btn.primary} style={{ background: C.primary }} onClick={() => setSaved(true)}>저장하기</button>
      </div>
      {saved && <div className="mt-3 p-3 rounded-md text-sm" style={{ background: "#e8f5e9", color: C.success }}>✓ 저장 완료</div>}
      <p className="text-xs mt-2" style={{ color: C.textSub }}>* 필수 입력. 누락 시 저장이 차단됩니다.</p>
    </AdminLayout>
  );
}

function AdmCsv({ navigate }: { navigate: (s: Screen) => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [result, setResult] = useState<{ insert: number; update: number; error: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setResult({ insert: 42, update: 118, error: 3 }); }, 1800);
  };
  return (
    <AdminLayout current="adm-csv" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>대량 상품 업데이트 (CSV)</h1>
      <Card className="mb-4">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f.name); }}
          className="rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all"
          style={{ borderColor: dragging ? C.primary : C.line, background: dragging ? C.primaryLight : C.bg }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="text-4xl mb-3">📁</div>
          <p className="text-sm font-semibold" style={{ color: C.textBody }}>
            {file ? `선택됨: ${file}` : "00.상품다운.csv 파일을 끌어놓거나 선택"}
          </p>
          <p className="text-xs mt-1" style={{ color: C.textSub }}>또는 클릭하여 파일 선택</p>
          <button className={btn.secondary + " mt-4 text-sm"} style={{ borderColor: C.primary, color: C.primary }} onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
            파일 선택
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f.name); }} />
        </div>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>자체상품코드(PK) 기준 — 신규 Insert / 기존 Update (Upsert)</p>
      </Card>
      <div className="flex justify-end mb-4">
        <button className={btn.primary} style={{ background: uploading ? C.textSub : C.primary }} onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? "처리 중..." : "업로드 실행"}
        </button>
      </div>
      {result && (
        <Card>
          <h3 className="text-base font-semibold mb-3" style={{ color: C.textBody }}>처리 결과</h3>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: C.success }}>✓ {result.insert}건</div>
              <div className="text-xs" style={{ color: C.textSub }}>신규 등록</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: C.primary }}>✓ {result.update}건</div>
              <div className="text-xs" style={{ color: C.textSub }}>수정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: C.error }}>⚠ {result.error}건</div>
              <div className="text-xs" style={{ color: C.textSub }}>오류</div>
            </div>
          </div>
          {result.error > 0 && (
            <button className={btn.secondary + " mt-4 text-sm"} style={{ borderColor: C.error, color: C.error }}>
              오류 목록 다운로드
            </button>
          )}
        </Card>
      )}
    </AdminLayout>
  );
}

function AdmCategory({ navigate }: { navigate: (s: Screen) => void }) {
  const [margins, setMargins] = useState<Record<string, number>>({ "그래픽카드": 15, CPU: 12, 메모리: 18, 파워: 20 });
  const [toggleCode, setToggleCode] = useState("");
  const [toggleStatus, setToggleStatus] = useState("품절");
  const [saved, setSaved] = useState(false);
  return (
    <AdminLayout current="adm-category" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.textStrong }}>카테고리 정책 제어</h1>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>카테고리별 일괄 마진율</h2>
        <div className="space-y-4">
          {Object.entries(margins).map(([cat, val]) => (
            <div key={cat}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: C.textBody }}>{cat}</span>
                <span className="font-semibold" style={{ color: C.primary }}>{val}%</span>
              </div>
              <input type="range" min={5} max={50} value={val}
                onChange={e => setMargins(p => ({ ...p, [cat]: +e.target.value }))}
                className="w-full" style={{ accentColor: C.primary }} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-3" style={{ color: C.textBody }}>실시간 품절/단종 스위치</h2>
        <div className="flex gap-2">
          <input value={toggleCode} onChange={e => setToggleCode(e.target.value)} placeholder="상품코드 입력" className="flex-1 h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }} />
          <select value={toggleStatus} onChange={e => setToggleStatus(e.target.value)} className="h-10 px-3 rounded-md text-sm" style={{ border: `1px solid ${C.line}` }}>
            {["판매중", "품절", "단종"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className={btn.primary + " text-sm"} style={{ background: C.primary }}>적용</button>
        </div>
        <p className="text-xs mt-2" style={{ color: C.textSub }}>적용 시 1초 이내 추천 풀·스왑 대안에서 즉시 제외됩니다.</p>
      </Card>
      <div className="flex justify-end">
        <button className={btn.primary} style={{ background: C.primary }} onClick={() => setSaved(true)}>정책 저장</button>
      </div>
      {saved && <div className="mt-3 p-3 rounded-md text-sm" style={{ background: "#e8f5e9", color: C.success }}>✓ 정책이 저장되었습니다.</div>}
    </AdminLayout>
  );
}

function AdmKeywords({ navigate }: { navigate: (s: Screen) => void }) {
  const keywords = [
    { rank: 1, keyword: "배틀그라운드상옵", count: 1842 },
    { rank: 2, keyword: "원컴방송용", count: 1203 },
    { rank: 3, keyword: "딥러닝코딩", count: 987 },
    { rank: 4, keyword: "가성비게임PC", count: 876 },
    { rank: 5, keyword: "무소음사무용", count: 654 },
  ];
  return (
    <AdminLayout current="adm-keywords" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: C.textStrong }}>통계 분석</h1>
      <div className="flex gap-2 mb-6">
        {(["인기 키워드", "탈락 부품", "전환 퍼널"] as const).map(tab => (
          <button key={tab} onClick={() => { if (tab === "탈락 부품") navigate("adm-swap-report"); if (tab === "전환 퍼널") navigate("adm-funnel"); }}
            className="px-5 h-10 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === "인기 키워드" ? C.primary : C.surface, color: tab === "인기 키워드" ? "#fff" : C.textBody, border: `1.5px solid ${tab === "인기 키워드" ? C.primary : C.line}` }}>
            {tab}
          </button>
        ))}
      </div>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>인기 키워드 랭킹 TOP 5</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={keywords} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis type="number" tick={{ fontSize: 13 }} />
            <YAxis type="category" dataKey="keyword" tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="count" fill={C.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-1">
          {keywords.map(k => (
            <div key={k.rank} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: k.rank <= 3 ? C.primary : C.textSub }}>{k.rank}</span>
                <span className="text-sm" style={{ color: C.textBody }}>{k.keyword}</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: C.primary }}>{k.count.toLocaleString()}회</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>유저 직접 입력 프롬프트 형태소 상위 명사 집계 (개인정보 마스킹 후)</p>
      </Card>
    </AdminLayout>
  );
}

function AdmSwapReport({ navigate }: { navigate: (s: Screen) => void }) {
  const swapData = [
    { name: "RTX 3070 8GB", count: 312 }, { name: "i7-12700K", count: 287 },
    { name: "DDR4 16GB", count: 241 }, { name: "GTX 1660 Super", count: 198 },
    { name: "Ryzen 5 5600X", count: 175 },
  ];
  return (
    <AdminLayout current="adm-swap-report" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: C.textStrong }}>통계 분석</h1>
      <div className="flex gap-2 mb-6">
        {(["인기 키워드", "탈락 부품", "전환 퍼널"] as const).map(tab => (
          <button key={tab} onClick={() => { if (tab === "인기 키워드") navigate("adm-keywords"); if (tab === "전환 퍼널") navigate("adm-funnel"); }}
            className="px-5 h-10 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === "탈락 부품" ? C.primary : C.surface, color: tab === "탈락 부품" ? "#fff" : C.textBody, border: `1.5px solid ${tab === "탈락 부품" ? C.primary : C.line}` }}>
            {tab}
          </button>
        ))}
      </div>
      <Card>
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>카테고리별 최다 탈락 부품 TOP 5</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={swapData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#ffb74d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              {["순위", "부품명", "탈락 횟수"].map(h => <th key={h} className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {swapData.map((s, i) => (
              <tr key={s.name} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-2 text-xs font-bold" style={{ color: C.textSub }}>{i + 1}</td>
                <td className="py-2 text-sm" style={{ color: C.textBody }}>{s.name}</td>
                <td className="py-2 text-sm font-semibold" style={{ color: "#ffb74d" }}>{s.count}회</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>AI가 제안했으나 사용자가 스왑 제외한 부품 역분석 (가중치 수정용)</p>
      </Card>
    </AdminLayout>
  );
}

function AdmFunnel({ navigate }: { navigate: (s: Screen) => void }) {
  const steps = [
    { step: "메인 진입", reach: 10000, conv: 100, drop: 0 },
    { step: "모드 선택", reach: 8200, conv: 82, drop: 18 },
    { step: "조건 입력 완료", reach: 5600, conv: 68.3, drop: 31.7 },
    { step: "추천 노출", reach: 4100, conv: 73.2, drop: 26.8 },
    { step: "커스터마이징", reach: 2300, conv: 56.1, drop: 43.9 },
    { step: "장바구니", reach: 1400, conv: 60.9, drop: 39.1 },
    { step: "결제 성공", reach: 820, conv: 58.6, drop: 41.4 },
  ];
  return (
    <AdminLayout current="adm-funnel" navigate={navigate}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: C.textStrong }}>통계 분석</h1>
      <div className="flex gap-2 mb-6">
        {(["인기 키워드", "탈락 부품", "전환 퍼널"] as const).map(tab => (
          <button key={tab} onClick={() => { if (tab === "인기 키워드") navigate("adm-keywords"); if (tab === "탈락 부품") navigate("adm-swap-report"); }}
            className="px-5 h-10 rounded-lg text-sm font-semibold transition-all"
            style={{ background: tab === "전환 퍼널" ? C.primary : C.surface, color: tab === "전환 퍼널" ? "#fff" : C.textBody, border: `1.5px solid ${tab === "전환 퍼널" ? C.primary : C.line}` }}>
            {tab}
          </button>
        ))}
      </div>
      <Card className="mb-4">
        <h2 className="text-base font-semibold mb-4" style={{ color: C.textBody }}>사용자 전환 퍼널 시각화</h2>
        <div className="flex flex-col items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center gap-3 w-full" style={{ maxWidth: 600 }}>
              <div
                className="flex items-center justify-center text-white text-xs font-semibold rounded"
                style={{
                  width: `${(s.reach / 10000) * 100}%`,
                  minWidth: 120,
                  height: 38,
                  background: `rgba(0,117,213,${0.9 - i * 0.1})`,
                  transition: "width 0.5s",
                }}
              >
                {s.step}
              </div>
              <span className="text-sm font-bold" style={{ color: C.primary }}>{s.reach.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-base font-semibold mb-3" style={{ color: C.textBody }}>단계별 수치</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              {["단계", "도달 수", "전환율 (%)", "이탈률 (%)"].map(h => <th key={h} className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {steps.map(s => (
              <tr key={s.step} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-2 text-sm" style={{ color: C.textBody }}>{s.step}</td>
                <td className="py-2 text-sm font-semibold" style={{ color: C.primary }}>{s.reach.toLocaleString()}</td>
                <td className="py-2 text-sm" style={{ color: C.textBody }}>{s.conv}%</td>
                <td className="py-2">
                  <span className="text-sm font-semibold px-2 py-0.5 rounded" style={{
                    color: s.drop > 35 ? C.error : C.textBody,
                    background: s.drop > 35 ? "#fdecea" : "transparent",
                  }}>
                    {s.drop}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>메인 진입부터 결제까지 유저 저니 단계별 도달·이탈 분석</p>
      </Card>
    </AdminLayout>
  );
}

// ── Dev Hub ───────────────────────────────────────────────────────────────
function DevHub({ navigate }: { navigate: (s: Screen) => void }) {
  const [mockMode, setMockMode] = useState<"mock" | "real">("mock");
  const [weights, setWeights] = useState({ 재고소진: 40, 마진극대: 80, 최저가가성비: 60 });
  const screens: { id: string; file: string; status: "배포완료" | "코딩중" | "로컬검증" | "대기" }[] = [
    { id: "FR-LND-010", file: "index.html", status: "배포완료" },
    { id: "FR-LND-020", file: "auth-modal.html", status: "배포완료" },
    { id: "FR-BEG-010", file: "step1-purpose.html", status: "코딩중" },
    { id: "FR-BEG-020", file: "step2-budget.html", status: "코딩중" },
    { id: "FR-BEG-030", file: "step3-option.html", status: "대기" },
    { id: "FR-BEG-050", file: "step4-summary.html", status: "대기" },
    { id: "FR-BEG-090", file: "result.html", status: "대기" },
    { id: "FR-BEG-110", file: "estimate-detail.html", status: "대기" },
    { id: "FR-EXP-010", file: "step1-priority.html", status: "로컬검증" },
    { id: "FR-EXP-090", file: "result-expert.html", status: "대기" },
    { id: "FR-ADM-010", file: "dashboard.html", status: "배포완료" },
    { id: "FR-ANA-030", file: "funnel.html", status: "대기" },
  ];
  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      "배포완료": { label: "●배포완료", color: C.success, bg: "#e8f5e9" },
      "코딩중": { label: "🟡코딩중", color: "#b45309", bg: "#fffbeb" },
      "로컬검증": { label: "🔵로컬검증", color: C.primary, bg: C.primaryLight },
      "대기": { label: "⚪대기", color: C.textSub, bg: C.muted ?? "#f0f4f8" },
    };
    return map[s] || map["대기"];
  };
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {/* Title bar */}
      <div className="px-6 py-4" style={{ background: C.textStrong }}>
        <h1 className="text-xl font-bold text-white">팝콘PC AI — 통합 개발·운영 마스터 제어 허브</h1>
        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>DEV-HUB-010 | 개발자/기획자/고객 공용 게이트</p>
      </div>
      {/* Infra status bar */}
      <div className="px-6 py-3 flex items-center gap-6 text-sm" style={{ background: "#1e293b" }}>
        {[
          { label: "로컬 DB", status: true },
          { label: "개발서버 DB", status: true },
          { label: "Nginx", status: true },
          { label: "Mock API", status: mockMode === "mock" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span style={{ color: s.status ? C.success : C.error }}>●</span>
            <span style={{ color: "#94a3b8" }}>{s.label}:</span>
            <span className="font-semibold" style={{ color: s.status ? "#86efac" : "#fca5a5" }}>
              {s.status ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        ))}
        <button onClick={() => navigate("landing")} className="ml-auto px-3 h-7 rounded text-xs font-semibold text-white" style={{ background: C.primary }}>← 랜딩으로</button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Section 1: Progress matrix */}
        <Card>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>① 화면 구현 진척도 매트릭스</h2>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                {["화면 ID", "파일명", "구현 상태", "이동 링크"].map(h => (
                  <th key={h} className="text-left py-2 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {screens.map(s => {
                const badge = statusBadge(s.status);
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td className="py-2 font-mono text-xs" style={{ color: C.textSub }}>{s.id}</td>
                    <td className="py-2 text-xs" style={{ color: C.textBody }}>{s.file}</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button className="px-2 h-6 rounded text-xs" style={{ background: C.primaryLight, color: C.primary }}>정적 미리보기</button>
                        <button className="px-2 h-6 rounded text-xs" style={{ background: "#e8f5e9", color: C.success }}>동작 테스트</button>
                        <button className="px-2 h-6 rounded text-xs" style={{ background: "#fffbeb", color: "#b45309" }}>수정 프롬프트</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs mt-3" style={{ color: C.textSub }}>상태: ⚪대기 → 🟡코딩중 → 🔵로컬검증 → ●배포완료</p>
        </Card>

        {/* Section 2: Dev Tools */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>② 개발 테스트 도구 (개발자 전용)</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>가상 세션 강제 주입</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "일반 회원", grade: "normal" },
                  { label: "우수 회원", grade: "premium" },
                  { label: "게스트 유입", grade: "guest" },
                ].map(b => (
                  <button key={b.grade} className="px-4 h-9 rounded-md text-sm font-semibold" style={{ background: C.primaryLight, color: C.primary }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>외부 LLM API Mock 스위치</h3>
              <div className="flex gap-2">
                {(["mock", "real"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMockMode(m)}
                    className="flex-1 h-9 rounded-md text-sm font-semibold transition-all"
                    style={{ background: mockMode === m ? C.primary : C.surface, color: mockMode === m ? "#fff" : C.textBody, border: `1.5px solid ${mockMode === m ? C.primary : C.line}` }}
                  >
                    {m === "mock" ? "가상 JSON 응답" : "실제 API 호출"}
                  </button>
                ))}
              </div>
              {mockMode === "real" && <p className="text-xs mt-2" style={{ color: C.error }}>⚠ 실제 API 호출 — 비용이 발생합니다.</p>}
            </Card>
          </div>
        </div>

        {/* Section 3: Operator Preview */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>③ 운영자 미리보기 (DB 연동형)</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>추천 로직 실시간 가중치</h3>
              {Object.entries(weights).map(([k, v]) => (
                <div key={k} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: C.textBody }}>{k}</span>
                    <span className="font-semibold" style={{ color: C.primary }}>{v}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={v}
                    onChange={e => setWeights(p => ({ ...p, [k]: +e.target.value }))}
                    className="w-full" style={{ accentColor: C.primary }} />
                </div>
              ))}
              <button className={btn.primary + " w-full text-sm mt-1"} style={{ background: C.primary }}>가중치 저장</button>
            </Card>
            <Card>
              <h3 className="text-sm font-semibold mb-3" style={{ color: C.textBody }}>3사 LLM API 비용 관제</h3>
              <div className="space-y-3 mb-4">
                {[
                  { name: "Gemini", cost: "17,500원", color: "#4285f4" },
                  { name: "ChatGPT", cost: "25,480원", color: "#10a37f" },
                  { name: "Claude", cost: "30,940원", color: "#d97757" },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.textBody }}>{m.name}</span>
                    <span className="text-lg font-bold" style={{ color: m.color }}>{m.cost}</span>
                  </div>
                ))}
              </div>
              <button className={btn.danger + " w-full text-sm"} style={{ background: C.error }}>🚨 비용 차단 임계 설정</button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const navigate = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  const screenMap: Record<Screen, React.ReactNode> = {
    "landing": <Landing navigate={navigate} />,
    "auth-modal": <AuthModal navigate={navigate} />,
    "beg-step1": <BegStep1 navigate={navigate} />,
    "beg-step2": <BegStep2 navigate={navigate} />,
    "beg-step3": <BegStep3 navigate={navigate} />,
    "beg-step4": <BegStep4 navigate={navigate} />,
    "beg-result": <BegResult navigate={navigate} />,
    "beg-detail": <BegDetail navigate={navigate} />,
    "exp-step1": <ExpStep1 navigate={navigate} />,
    "exp-step2": <ExpStep2 navigate={navigate} />,
    "exp-step3": <ExpStep3 navigate={navigate} />,
    "exp-step4": <ExpStep4 navigate={navigate} />,
    "exp-step5": <ExpStep5 navigate={navigate} />,
    "exp-result": <ExpResult navigate={navigate} />,
    "exp-detail": <ExpDetail navigate={navigate} />,
    "adm-dashboard": <AdmDashboard navigate={navigate} />,
    "adm-monitoring": <AdmMonitoring navigate={navigate} />,
    "adm-rate-limit": <AdmRateLimit navigate={navigate} />,
    "adm-master": <AdmMaster navigate={navigate} />,
    "adm-product-edit": <AdmProductEdit navigate={navigate} />,
    "adm-csv": <AdmCsv navigate={navigate} />,
    "adm-category": <AdmCategory navigate={navigate} />,
    "adm-keywords": <AdmKeywords navigate={navigate} />,
    "adm-swap-report": <AdmSwapReport navigate={navigate} />,
    "adm-funnel": <AdmFunnel navigate={navigate} />,
    "dev-hub": <DevHub navigate={navigate} />,
  };

  return (
    <div style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {screenMap[screen]}
    </div>
  );
}
