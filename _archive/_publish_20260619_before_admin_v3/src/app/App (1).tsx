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
  // Admin V3.0
  | "adm-dashboard"
  | "adm-product-master" | "adm-csv-import"
  | "adm-price-policy" | "adm-recommend-weights"
  | "adm-keywords" | "adm-click-report" | "adm-funnel"
  | "adm-system-limit" | "adm-operators"
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
const adminMenus: { label: string; screens: Screen[]; target: Screen; icon: string }[] = [
  { label: "대시보드", screens: ["adm-dashboard"], target: "adm-dashboard", icon: "📊" },
  { label: "상품/재고", screens: ["adm-product-master", "adm-csv-import"], target: "adm-product-master", icon: "📦" },
  { label: "가격/정책", screens: ["adm-price-policy", "adm-recommend-weights"], target: "adm-price-policy", icon: "💰" },
  { label: "마케팅분석", screens: ["adm-keywords", "adm-click-report", "adm-funnel"], target: "adm-keywords", icon: "📈" },
  { label: "운영자관리", screens: ["adm-operators"], target: "adm-operators", icon: "👥" },
  { label: "시스템제어", screens: ["adm-system-limit", "dev-hub"], target: "adm-system-limit", icon: "⚙️" },
];

function AdminLayout({ current, navigate, children, breadcrumb }: { current: Screen; navigate: (s: Screen) => void; children: React.ReactNode; breadcrumb?: string }) {
  const activeMenu = adminMenus.find(m => m.screens.includes(current));
  return (
    <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <aside
        style={{ width: 210, background: "#0f172a", color: "#e2e8f0", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}
        className="flex flex-col"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button onClick={() => navigate("landing")} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: C.primary }}>P</div>
            <div>
              <p className="font-bold text-sm text-white">팝콘PC</p>
              <p className="text-xs" style={{ color: "#64748b" }}>관리자 V3.0</p>
            </div>
          </button>
        </div>
        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {adminMenus.map(m => {
            const isActive = m.screens.includes(current);
            return (
              <button key={m.label} onClick={() => navigate(m.target)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2.5"
                style={{ background: isActive ? C.primary : "transparent", color: isActive ? "#fff" : "#64748b" }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 14 }}>{m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </nav>
        {/* DevHub shortcut */}
        <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <button onClick={() => navigate("dev-hub")}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.04)", color: "#64748b" }}>
            <span>🛠</span> DEV HUB
          </button>
        </div>
        <div className="px-5 py-3 text-sm border-t" style={{ borderColor: "rgba(255,255,255,0.07)", color: "#475569" }}>
          👤 관리자님 ▾
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <div className="flex items-center px-6 gap-2" style={{ height: 52, background: C.surface, borderBottom: `1px solid ${C.line}` }}>
          <span className="text-sm" style={{ color: C.textSub }}>팝콘PC 관리</span>
          <span style={{ color: C.line }}>/</span>
          <span className="text-sm font-medium" style={{ color: C.textBody }}>{activeMenu?.label}</span>
          {breadcrumb && <>
            <span style={{ color: C.line }}>/</span>
            <span className="text-sm" style={{ color: C.textBody }}>{breadcrumb}</span>
          </>}
          <div className="flex-1" />
          <span className="text-sm font-medium" style={{ color: C.textBody }}>admin@popcornpc.com</span>
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


// ════════════════════════════════════════════════════════════════════════════
// ADMIN V3.0 — BATCH 4 (비즈니스·상품·정책·키워드)
// ════════════════════════════════════════════════════════════════════════════

// ── 공통 서브컴포넌트 ──────────────────────────────────────────────────────
function AdminPageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: C.textStrong }}>{title}</h1>
        {sub && <p className="text-sm mt-1" style={{ color: C.textSub }}>{sub}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.primary, icon }: { label: string; value: string; sub?: string; color?: string; icon?: string }) {
  return (
    <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-sm" style={{ color: C.textSub }}>{label}</p>
      </div>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: C.textSub }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: "정상" | "주의" | "위험" | "차단" | string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "정상": { bg: "#e8f5e9", color: C.success },
    "주의": { bg: "#fff8e1", color: C.warning },
    "위험": { bg: "#fdecea", color: C.error },
    "차단": { bg: "#fdecea", color: C.error },
    "추천완료": { bg: C.primaryLight, color: C.primary },
    "장바구니": { bg: "#e8f5e9", color: C.success },
    "결제진입": { bg: "#fff8e1", color: C.warning },
  };
  const s = map[status] ?? { bg: C.bg, color: C.textSub };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function AnalyticsTabBar({ active, navigate }: { active: "keywords" | "click" | "funnel"; navigate: (s: Screen) => void }) {
  const tabs = [
    { key: "keywords" as const, label: "인기 키워드", screen: "adm-keywords" as Screen },
    { key: "click" as const, label: "클릭/스왑 리포트", screen: "adm-click-report" as Screen },
    { key: "funnel" as const, label: "전환 퍼널", screen: "adm-funnel" as Screen },
  ];
  return (
    <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: C.bg, width: "fit-content" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => navigate(t.screen)}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: active === t.key ? C.surface : "transparent", color: active === t.key ? C.primary : C.textSub,
            boxShadow: active === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── adm-dashboard — 통합 비즈니스 & 트렌드 대시보드 ────────────────────────
const recentQuotes = [
  { mode: "초급자", use: "배틀그라운드용", spec: "Ryzen 5 7600X / RTX 4070 / 32GB / 1TB", price: "1,280,000원", status: "장바구니", time: "2분 전" },
  { mode: "고급자", use: "3D 작업용", spec: "i7-14700K / RTX 4080 / 64GB / 2TB", price: "2,340,000원", status: "추천완료", time: "8분 전" },
  { mode: "초급자", use: "화이트 감성 PC", spec: "Ryzen 5 7600X / RTX 4060 W / 16GB / 500GB", price: "1,420,000원", status: "결제진입", time: "11분 전" },
  { mode: "초급자", use: "원컴 방송용", spec: "i9-14900K / RTX 4070 Ti / 64GB / 1TB", price: "3,180,000원", status: "추천완료", time: "19분 전" },
  { mode: "고급자", use: "딥러닝 서버", spec: "Ryzen 9 9950X / RTX 4090 / 128GB / 4TB", price: "7,480,000원", status: "추천완료", time: "34분 전" },
];

const promoCtrData = [
  { name: "RTX4060 특가", ctr: 15.0 }, { name: "R7 7500F 기획전", ctr: 11.4 },
  { name: "1TB NVMe 특가", ctr: 9.4 }, { name: "파워 번들", ctr: 7.8 }, { name: "케이스 화이트", ctr: 5.2 },
];

const keywordTrends = [
  { rank: 1, kw: "배틀그라운드 상옵", count: 1842, up: true },
  { rank: 2, kw: "원컴방송용", count: 1203, up: true },
  { rank: 3, kw: "딥러닝 코딩", count: 987, up: false },
  { rank: 4, kw: "화이트 감성", count: 876, up: true },
  { rank: 5, kw: "RTX 4070", count: 754, up: false },
];


// 랜딩과 동일한 부품 목록에 7일 히스토리 추가
const PART_TABLE_DATA = [
  { part: "RTX 4070", category: "GPU", price: "550,000원", priceNum: 550,
    history: [530, 538, 542, 545, 548, 548, 550], change: "+12,000", pct: "+2.2%", up: true, color: "#0075d5" },
  { part: "라이젠 R5 7600X", category: "CPU", price: "248,000원", priceNum: 248,
    history: [258, 255, 254, 252, 250, 249, 248], change: "-8,000", pct: "-3.1%", up: false, color: "#e53935" },
  { part: "DDR5 32GB 듀얼", category: "RAM", price: "118,000원", priceNum: 118,
    history: [114, 115, 115, 116, 117, 117, 118], change: "+3,000", pct: "+2.6%", up: true, color: "#8e24aa" },
  { part: "NVMe SSD 1TB", category: "SSD", price: "96,000원", priceNum: 96,
    history: [99, 98, 98, 97, 97, 96, 96], change: "-2,000", pct: "-2.0%", up: false, color: "#43a047" },
  { part: "850W 80+ Gold", category: "파워", price: "119,000원", priceNum: 119,
    history: [117, 117, 118, 118, 118, 119, 119], change: "+1,000", pct: "+0.8%", up: true, color: "#f9a825" },
  { part: "ASUS B650 WiFi", category: "메인보드", price: "178,000원", priceNum: 178,
    history: [184, 183, 182, 181, 180, 179, 178], change: "-5,000", pct: "-2.7%", up: false, color: "#546e7a" },
  { part: "Corsair 360mm AIO", category: "쿨러", price: "142,000원", priceNum: 142,
    history: [140, 141, 141, 142, 142, 142, 142], change: "+1,000", pct: "+0.7%", up: true, color: "#1565c0" },
];
const DAYS = ["6/13", "6/14", "6/15", "6/16", "6/17", "6/18", "6/19"];

// 인라인 스파크라인 (SVG)
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 80, H = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const color = up ? C.success : C.error;
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* last dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = W;
        const y = H - ((last - min) / range) * (H - 4) - 2;
        return <circle cx={x} cy={y} r={3} fill={color} />;
      })()}
    </svg>
  );
}

function PriceTrendPanel() {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [sortKey, setSortKey] = useState<"part" | "category" | "price" | "pct">("category");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...PART_TABLE_DATA].sort((a, b) => {
    let av: string | number = sortKey === "pct" ? parseFloat(a.pct) : sortKey === "price" ? a.priceNum : a[sortKey];
    let bv: string | number = sortKey === "pct" ? parseFloat(b.pct) : sortKey === "price" ? b.priceNum : b[sortKey];
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  };
  const sortIcon = (key: typeof sortKey) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : " ↕";

  // 차트용 통합 데이터
  const chartData = DAYS.map((d, i) => ({
    d,
    GPU: PART_TABLE_DATA[0].history[i],
    CPU: PART_TABLE_DATA[1].history[i],
    RAM: PART_TABLE_DATA[2].history[i],
    SSD: PART_TABLE_DATA[3].history[i],
    파워: PART_TABLE_DATA[4].history[i],
  }));

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}`, background: C.surface }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
        <div>
          <h2 className="text-base font-bold" style={{ color: C.textStrong }}>부품 가격동향 (7일)</h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>팝콘PC 실재고 기준 · 24시간 변동 포함</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 뷰 토글 */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
            {([
              { key: "chart", label: "📈 차트" },
              { key: "table", label: "📋 표" },
            ] as const).map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className="px-3 h-8 text-xs font-semibold transition-all"
                style={{
                  background: view === v.key ? C.primary : C.surface,
                  color: view === v.key ? "#fff" : C.textSub,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 차트 뷰 */}
      {view === "chart" && (
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="d" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="천원" />
              <Tooltip formatter={(v: number) => [`${v}천원`]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              {[
                { dk: "GPU", color: "#0075d5" }, { dk: "CPU", color: "#e53935" },
                { dk: "RAM", color: "#8e24aa" }, { dk: "SSD", color: "#43a047" },
                { dk: "파워", color: "#f9a825" },
              ].map((l, i) => (
                <Line key={`ptl-${i}`} type="monotone" dataKey={l.dk} name={l.dk} stroke={l.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {/* 현재가 요약 칩 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {PART_TABLE_DATA.map(p => (
              <div key={p.part} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span style={{ color: C.textBody }}>{p.part}</span>
                <span className="font-bold" style={{ color: p.color }}>{p.price}</span>
                <span className="font-semibold" style={{ color: p.up ? C.success : C.error }}>{p.pct}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 표 뷰 */}
      {view === "table" && (
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.bg, borderBottom: `2px solid ${C.line}` }}>
                {[
                  { label: "카테고리", key: "category" },
                  { label: "부품명", key: "part" },
                  { label: "현재가", key: "price" },
                  { label: "7일 추이", key: null },
                  { label: "전일 변동", key: null },
                  { label: "변동률", key: "pct" },
                ].map(h => (
                  <th
                    key={h.label}
                    className="text-left px-4 py-3 text-xs font-semibold select-none"
                    style={{ color: h.key === sortKey ? C.primary : C.textSub, cursor: h.key ? "pointer" : "default" }}
                    onClick={() => h.key && toggleSort(h.key as typeof sortKey)}
                  >
                    {h.label}{h.key ? sortIcon(h.key as typeof sortKey) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr
                  key={p.part}
                  style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 === 0 ? C.surface : "#fafbfc" }}
                >
                  {/* 카테고리 */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${p.color}15`, color: p.color }}>
                      {p.category}
                    </span>
                  </td>
                  {/* 부품명 */}
                  <td className="px-4 py-3 font-medium" style={{ color: C.textBody }}>{p.part}</td>
                  {/* 현재가 */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold" style={{ color: C.primary }}>{p.price}</span>
                  </td>
                  {/* 스파크라인 */}
                  <td className="px-4 py-3">
                    <Sparkline data={p.history} up={p.up} />
                  </td>
                  {/* 전일 변동 */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold"
                      style={{ color: p.up ? C.success : C.error }}>
                      {p.up ? "+" : ""}{p.change}
                    </span>
                  </td>
                  {/* 변동률 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: p.up ? "#e8f5e9" : "#fdecea",
                          color: p.up ? C.success : C.error,
                        }}>
                        {p.up ? "▲" : "▼"} {p.pct}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
            <p className="text-xs" style={{ color: C.textSub }}>
              팝콘PC 실재고 기준 · 최근 7일 일별 가격 · 클릭하면 가격 정책 화면에서 마진 조정 가능
            </p>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span className="text-xs" style={{ color: C.textSub }}>실시간 반영</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdmDashboard({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <AdminLayout current="adm-dashboard" navigate={navigate}>
      <AdminPageHeader
        title="통합 비즈니스 & 트렌드 대시보드"
        sub="오늘의 견적 흐름, 특가 반응, 유저 관심사, 가격동향을 한 화면에서 확인합니다."
      >
        <button className="px-4 h-9 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>
          🔄 새로고침
        </button>
      </AdminPageHeader>

      {/* 섹션1: 실시간 견적 피드 */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <h2 className="text-base font-bold" style={{ color: C.textStrong }}>실시간 AI 최종 견적 피드</h2>
          </div>
          <span className="text-xs" style={{ color: C.textSub }}>최근 50건</span>
        </div>
        <div style={{ background: C.surface }}>
          {recentQuotes.map((q, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: i < recentQuotes.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                style={{ background: q.mode === "초급자" ? C.primaryLight : "#f3e5f5", color: q.mode === "초급자" ? C.primary : "#7b1fa2" }}>
                {q.mode}
              </span>
              <span className="text-sm font-medium shrink-0 w-28" style={{ color: C.textBody }}>{q.use}</span>
              <span className="text-xs flex-1 truncate" style={{ color: C.textSub }}>{q.spec}</span>
              <span className="text-sm font-bold shrink-0" style={{ color: C.primary }}>{q.price}</span>
              <StatusBadge status={q.status} />
              <span className="text-xs shrink-0" style={{ color: C.textSub }}>{q.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 섹션2+3: CTR + 키워드 */}
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* CTR */}
        <Card>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>금주 특가상품 클릭률 CTR</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={promoCtrData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, "CTR"]} />
              <Bar key="bar-ctr" dataKey="ctr" name="CTR" fill={C.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        {/* 키워드 */}
        <Card>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>유저 관심사 TOP 10</h2>
          <div className="space-y-2">
            {keywordTrends.map(k => (
              <div key={k.rank} className="flex items-center gap-3 py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: k.rank <= 3 ? C.primary : C.bg, color: k.rank <= 3 ? "#fff" : C.textSub }}>{k.rank}</span>
                <span className="text-sm flex-1 font-medium" style={{ color: C.textBody }}>{k.kw}</span>
                <span className="text-xs" style={{ color: C.textSub }}>{k.count.toLocaleString()}회</span>
                <span className="text-xs font-bold" style={{ color: k.up ? C.success : C.error }}>{k.up ? "▲" : "▼"}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: C.textSub }}>개인정보 마스킹 후 명사 키워드만 집계합니다.</p>
        </Card>
      </div>

      {/* 섹션4+5: 가격동향 + AI 비용 위젯 */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
        <PriceTrendPanel />

        {/* AI 비용 미니 위젯 */}
        <div className="w-56 shrink-0">
          <div className="rounded-2xl p-5 h-full" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>AI 비용 상태</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>정상</span>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { name: "Gemini", val: "17,500원", color: "#4285f4" },
                { name: "ChatGPT", val: "25,480원", color: "#10a37f" },
                { name: "Claude", val: "30,940원", color: "#d97757" },
              ].map(ai => (
                <div key={ai.name} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#94a3b8" }}>{ai.name}</span>
                  <span className="text-sm font-bold" style={{ color: ai.color }}>{ai.val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("adm-system-limit")}
              className="w-full h-9 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(0,117,213,0.15)", color: "#60a5fa", border: "1px solid rgba(0,117,213,0.2)" }}>
              시스템 제어 →
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// ── adm-product-master — 상품 마스터 및 재고 제어 ───────────────────────────
const PRODUCTS_DUMMY = [
  { code: "101268", name: "AMD 라이젠 R5 7600X", cat: "CPU", maker: "AMD", status: "판매중", price: "248,000원", aiField: "완료" },
  { code: "204455", name: "RTX 4060 WHITE 8GB", cat: "그래픽카드", maker: "NVIDIA", status: "판매중", price: "438,000원", aiField: "일부누락" },
  { code: "300112", name: "시소닉 850W 80+ Gold", cat: "파워", maker: "Seasonic", status: "품절", price: "119,000원", aiField: "완료" },
  { code: "401233", name: "삼성 DDR5 32GB 듀얼", cat: "메모리", maker: "Samsung", status: "판매중", price: "118,000원", aiField: "완료" },
  { code: "502881", name: "리안리 O11 Dynamic EVO", cat: "케이스", maker: "Lian Li", status: "판매중", price: "178,000원", aiField: "검증필요" },
  { code: "603014", name: "ASUS ROG B650-A WiFi", cat: "메인보드", maker: "ASUS", status: "단종", price: "178,000원", aiField: "완료" },
];

function AdmProductMaster({ navigate }: { navigate: (s: Screen) => void }) {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [maker, setMaker] = useState("");
  const [keyword, setKeyword] = useState("");
  const [editCode, setEditCode] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmCode, setConfirmCode] = useState<string | null>(null);

  const statusColors: Record<string, { bg: string; color: string }> = {
    "판매중": { bg: "#e8f5e9", color: C.success },
    "품절": { bg: "#f5f5f5", color: C.textSub },
    "단종": { bg: "#fdecea", color: C.error },
    "삭제대기": { bg: "#fff8e1", color: C.warning },
  };
  const aiFieldColors: Record<string, { bg: string; color: string }> = {
    "완료": { bg: "#e8f5e9", color: C.success },
    "일부누락": { bg: "#fff8e1", color: C.warning },
    "검증필요": { bg: "#fdecea", color: C.error },
  };
  const editTarget = PRODUCTS_DUMMY.find(p => p.code === editCode);

  return (
    <AdminLayout current="adm-product-master" navigate={navigate} breadcrumb="상품 마스터">
      <AdminPageHeader
        title="상품 마스터 및 재고 제어"
        sub="상품 검색, AI 호환성 필드 수정, 품절/단종 1초 차단을 처리합니다."
      >
        <button onClick={() => navigate("adm-csv-import")}
          className="px-4 h-9 rounded-lg text-sm font-semibold"
          style={{ background: C.primary, color: "#fff" }}>
          📤 CSV 업서트
        </button>
      </AdminPageHeader>

      {/* 검색 필터 */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="flex gap-2 flex-wrap">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 120 }}>
            <option value="">카테고리 전체</option>
            {["CPU", "그래픽카드", "메모리", "SSD", "메인보드", "파워", "케이스", "쿨러"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 100 }}>
            <option value="">상태 전체</option>
            {["판매중", "품절", "단종", "삭제대기"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={maker} onChange={e => setMaker(e.target.value)}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 120 }}>
            <option value="">제조사 전체</option>
            {["AMD", "NVIDIA", "Intel", "Samsung", "ASUS", "Seasonic"].map(m => <option key={m}>{m}</option>)}
          </select>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="상품명, 모델명, RTX, Ryzen..."
            className="flex-1 h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 200 }} />
          <button className="h-10 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>검색</button>
          <button className="h-10 px-4 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>초기화</button>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: editCode ? "1fr 360px" : "1fr" }}>
        {/* 상품 테이블 */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.bg, borderBottom: `2px solid ${C.line}` }}>
                {["상품코드", "상품명", "카테고리", "제조사", "상태", "판매가", "AI 필드", "관리"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS_DUMMY.map((p, i) => {
                const sc = statusColors[p.status] ?? { bg: C.bg, color: C.textSub };
                const ac = aiFieldColors[p.aiField] ?? { bg: C.bg, color: C.textSub };
                return (
                  <tr key={p.code} style={{ borderBottom: `1px solid ${C.line}`, background: editCode === p.code ? C.primaryLight : C.surface }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: C.textSub }}>{p.code}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: C.textBody }}>{p.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.textBody }}>{p.cat}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.textBody }}>{p.maker}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm" style={{ color: C.primary }}>{p.price}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: ac.bg, color: ac.color }}>{p.aiField}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditCode(p.code === editCode ? null : p.code)}
                          className="px-3 h-7 rounded-md text-xs font-semibold"
                          style={{ background: editCode === p.code ? C.primary : C.primaryLight, color: editCode === p.code ? "#fff" : C.primary }}>
                          {editCode === p.code ? "닫기" : "편집"}
                        </button>
                        {p.status === "판매중" && (
                          <button onClick={() => setConfirmCode(p.code)}
                            className="px-3 h-7 rounded-md text-xs font-semibold"
                            style={{ background: "#fdecea", color: C.error }}>품절</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
            <p className="text-xs" style={{ color: C.textSub }}>50개 단위 페이징 · 상품 검색 0.3초 이내 응답 목표</p>
            <div className="flex gap-1">
              {["◂", "1", "2", "3", "▸"].map(p => (
                <button key={p} className="w-8 h-8 rounded text-sm"
                  style={{ border: `1px solid ${C.line}`, background: p === "1" ? C.primary : C.surface, color: p === "1" ? "#fff" : C.textBody }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI 호환성 필드 편집 패널 */}
        {editCode && editTarget && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.primary}`, boxShadow: `0 4px 20px rgba(0,117,213,0.12)` }}>
            <div className="px-5 py-4" style={{ background: C.primary }}>
              <h2 className="text-sm font-bold text-white">AI 호환성 필드 편집</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>AI 추천 엔진 연산에 사용되는 기술 필드</p>
            </div>
            <div className="p-5 space-y-3" style={{ background: C.surface }}>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>자체상품코드 (PK, 읽기전용)</label>
                <input readOnly value={editTarget.code} className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, background: C.bg }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>상품명</label>
                <input defaultValue={editTarget.name} className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
              </div>
              {[
                { label: "part_type", placeholder: "GPU / CPU / RAM / SSD..." },
                { label: "socket", placeholder: "AM5, LGA1700..." },
                { label: "chipset", placeholder: "B650, Z790..." },
                { label: "tdp_watt *", placeholder: "160" },
                { label: "rated_watt", placeholder: "850" },
                { label: "length_mm *", placeholder: "245" },
                { label: "gpu_max_mm", placeholder: "310" },
                { label: "pcie_gen", placeholder: "PCIe 4.0" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: f.label.includes("*") ? C.error : C.textSub }}>{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${f.label.includes("*") ? C.primary : C.line}` }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: C.textSub }}>감성 태그</label>
                <div className="flex gap-2">
                  {["#화이트", "#RGB LED", "#저소음"].map(t => (
                    <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input type="checkbox" style={{ accentColor: C.primary }} /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" defaultChecked style={{ accentColor: C.primary }} />
                <span style={{ color: C.textBody }}>관리자 보강값 보존 (margin_locked)</span>
              </label>
              <div className="p-3 rounded-lg text-xs" style={{ background: "#fdecea", color: C.error, display: saved ? "none" : "none" }}>
                소켓, 전력 W, 치수 mm 등 필수 연산 필드를 확인해주세요.
              </div>
            </div>
            <div className="px-5 py-4 flex gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
              <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                className="flex-1 h-9 rounded-lg text-sm font-bold text-white" style={{ background: C.primary }}>저장</button>
              <button onClick={() => setEditCode(null)}
                className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>닫기</button>
            </div>
            {saved && <div className="mx-5 mb-4 p-3 rounded-lg text-xs text-center" style={{ background: "#e8f5e9", color: C.success }}>✓ 저장 완료</div>}
          </div>
        )}
      </div>

      {/* 품절 확인 모달 */}
      {confirmCode && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-80" style={{ background: C.surface, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 className="text-base font-bold mb-2" style={{ color: C.textStrong }}>품절 처리 확인</h3>
            <p className="text-sm mb-5" style={{ color: C.textBody }}>
              해당 상품은 <strong>1초 이내</strong> 추천 후보군과 스왑 대안 목록에서 제외됩니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCode(null)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold" style={{ border: `1px solid ${C.line}`, color: C.textBody }}>취소</button>
              <button onClick={() => setConfirmCode(null)}
                className="flex-1 h-10 rounded-lg text-sm font-bold text-white" style={{ background: C.error }}>품절 처리</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ── adm-csv-import — CSV 업서트 ────────────────────────────────────────────
function AdmCsvImport({ navigate }: { navigate: (s: Screen) => void }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [result, setResult] = useState<{ ins: number; upd: number; err: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) { setFile(f.name); setTimeout(() => setVerified(true), 500); }
  };
  const handleRun = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setResult({ ins: 1240, upd: 3512, err: 8 }); }, 2000);
  };

  const errRows = [
    { row: 128, code: "없음", field: "자체상품코드", reason: "필수 PK 누락" },
    { row: 412, code: "300114", field: "상태값", reason: "허용되지 않은 상태값" },
    { row: 889, code: "204455", field: "가격", reason: "숫자 형식 오류" },
  ];

  return (
    <AdminLayout current="adm-csv-import" navigate={navigate} breadcrumb="CSV 업서트">
      <AdminPageHeader
        title="대량 상품 업데이트 CSV"
        sub="00.상품다운.csv를 자체상품코드 기준으로 Insert / Update 처리합니다."
      >
        <button onClick={() => navigate("adm-product-master")}
          className="px-4 h-9 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>
          ← 상품 마스터
        </button>
      </AdminPageHeader>

      {/* 업로드 영역 */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="rounded-2xl p-12 text-center cursor-pointer mb-5 transition-all"
        style={{ border: `2px dashed ${dragging ? C.primary : C.line}`, background: dragging ? C.primaryLight : C.surface }}>
        <div className="text-5xl mb-4">📁</div>
        <p className="text-base font-semibold mb-1" style={{ color: C.textBody }}>
          {file ? `선택됨: ${file}` : "00.상품다운.csv 파일을 끌어놓거나 선택하세요"}
        </p>
        <p className="text-sm mb-5" style={{ color: C.textSub }}>자체상품코드(PK) 기준 — 신규 상품 Insert / 기존 상품 Update</p>
        <button className="px-6 h-10 rounded-lg text-sm font-semibold"
          style={{ background: C.primaryLight, color: C.primary, border: `1px solid ${C.primary}` }}
          onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
          파일 선택
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f.name); setTimeout(() => setVerified(true), 500); } }} />
      </div>

      {/* 사전 검증 */}
      {verified && !result && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>업로드 전 검증</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: "전체 행", val: "4,760건", color: C.textStrong },
              { label: "예상 신규", val: "1,240건", color: C.primary },
              { label: "예상 수정", val: "3,512건", color: C.success },
              { label: "예상 오류", val: "8건", color: C.error },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: C.bg }}>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
                <p className="text-xs mt-0.5" style={{ color: C.textSub }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold" style={{ color: C.textSub }}>필수 컬럼:</span>
            {["자체상품코드", "상품명", "카테고리", "상태값", "매입가", "일반회원가"].map(c => (
              <span key={c} className="px-2 py-0.5 rounded" style={{ background: "#e8f5e9", color: C.success }}>✓ {c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mb-5">
        <button onClick={handleRun} disabled={!file || uploading}
          className="h-11 px-8 rounded-xl text-sm font-bold text-white"
          style={{ background: !file || uploading ? "#ccc" : C.primary }}>
          {uploading ? "업로드 처리 중..." : "업로드 실행"}
        </button>
      </div>

      {/* 처리 결과 */}
      {result && (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <div className="px-5 py-4 flex items-center gap-4" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
            <h2 className="text-base font-bold" style={{ color: C.textStrong }}>처리 결과</h2>
            <span className="px-3 h-7 flex items-center rounded-full text-xs font-bold" style={{ background: "#e8f5e9", color: C.success }}>✓ 완료</span>
          </div>
          <div className="p-5" style={{ background: C.surface }}>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="p-4 rounded-xl text-center" style={{ background: "#e8f5e9" }}>
                <p className="text-2xl font-black" style={{ color: C.success }}>✓ {result.ins.toLocaleString()}건</p>
                <p className="text-xs mt-1" style={{ color: C.textSub }}>신규 등록</p>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: C.primaryLight }}>
                <p className="text-2xl font-black" style={{ color: C.primary }}>✓ {result.upd.toLocaleString()}건</p>
                <p className="text-xs mt-1" style={{ color: C.textSub }}>수정</p>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "#fdecea" }}>
                <p className="text-2xl font-black" style={{ color: C.error }}>⚠ {result.err}건</p>
                <p className="text-xs mt-1" style={{ color: C.textSub }}>오류</p>
              </div>
            </div>
            {result.err > 0 && (
              <>
                <h3 className="text-sm font-bold mb-3" style={{ color: C.textStrong }}>오류 행 리포트</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                      {["행번호", "자체상품코드", "오류 필드", "오류 사유"].map(h => (
                        <th key={h} className="text-left py-2 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {errRows.map(r => (
                      <tr key={r.row} style={{ borderBottom: `1px solid ${C.line}` }}>
                        <td className="py-2 text-xs" style={{ color: C.textSub }}>{r.row}</td>
                        <td className="py-2 text-xs font-mono" style={{ color: C.textBody }}>{r.code}</td>
                        <td className="py-2 text-xs" style={{ color: C.error }}>{r.field}</td>
                        <td className="py-2 text-xs" style={{ color: C.textBody }}>{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-2 mt-4">
                  <button className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: "#fdecea", color: C.error }}>오류 목록 다운로드</button>
                  <button onClick={() => navigate("adm-product-master")}
                    className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: C.primaryLight, color: C.primary }}>상품 마스터로 이동</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ── adm-price-policy — 가격 정책 및 카테고리 마진 ──────────────────────────
const adminPriceTrendData = [
  { d: "6/13", supply: 420, retail: 550, market: 530 },
  { d: "6/14", supply: 422, retail: 548, market: 528 },
  { d: "6/15", supply: 430, retail: 560, market: 545 },
  { d: "6/16", supply: 428, retail: 558, market: 542 },
  { d: "6/17", supply: 435, retail: 570, market: 555 },
  { d: "6/18", supply: 440, retail: 575, market: 562 },
  { d: "6/19", supply: 442, retail: 578, market: 566 },
];

function AdmPricePolicy({ navigate }: { navigate: (s: Screen) => void }) {
  const [margins, setMargins] = useState({ 그래픽카드: 15, CPU: 12, 메모리: 18, SSD: 16, 파워: 20 });
  const [extras, setExtras] = useState({ 그래픽카드: 2, CPU: 1, 메모리: 0, SSD: 1, 파워: 3 });
  const [saved, setSaved] = useState(false);

  return (
    <AdminLayout current="adm-price-policy" navigate={navigate} breadcrumb="가격 정책">
      <AdminPageHeader
        title="가격 정책 및 카테고리 마진"
        sub="공급가 변동과 시장 가격동향을 참고해 카테고리별 마진율을 조정합니다."
      />

      {/* 가격동향 */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: C.textStrong }}>부품 가격동향</h2>
          <div className="flex gap-2">
            <select className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
              {["그래픽카드", "CPU", "메모리", "SSD", "파워"].map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="h-9 px-4 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>조회</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={adminPriceTrendData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="d" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="천원" />
            <Tooltip formatter={(v: number) => [`${v}천원`]} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Line key="pp-line-0" type="monotone" dataKey="supply" name="공급가" stroke="#888" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            <Line key="pp-line-1" type="monotone" dataKey="retail" name="일반회원가" stroke={C.primary} strokeWidth={2.5} dot={false} />
            <Line key="pp-line-2" type="monotone" dataKey="market" name="시장가" stroke="#10a37f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: C.textSub }}>CSV 업서트 시 가격 변동이 감지되면 가격 이력에 저장됩니다.</p>
      </Card>

      {/* 마진율 */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-5" style={{ color: C.textStrong }}>카테고리별 마진율 정책</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                {["카테고리", "기본 마진율", "추가 가산율", "적용", "최근 수정"].map(h => (
                  <th key={h} className="text-left py-3 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(margins) as (keyof typeof margins)[]).map(cat => (
                <tr key={cat} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="py-4 font-semibold" style={{ color: C.textBody }}>{cat}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={50} value={margins[cat]}
                        onChange={e => setMargins(p => ({ ...p, [cat]: +e.target.value }))}
                        className="w-28" style={{ accentColor: C.primary }} />
                      <span className="text-sm font-bold w-10" style={{ color: C.primary }}>{margins[cat]}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={20} value={extras[cat as keyof typeof extras]}
                        onChange={e => setExtras(p => ({ ...p, [cat]: +e.target.value }))}
                        className="w-20" style={{ accentColor: "#10a37f" }} />
                      <span className="text-sm font-bold w-8" style={{ color: "#10a37f" }}>{extras[cat as keyof typeof extras]}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "#e8f5e9", color: C.success }}>적용</span>
                  </td>
                  <td className="py-4 text-xs" style={{ color: C.textSub }}>오늘</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 안내 */}
      <div className="p-4 rounded-xl mb-5" style={{ background: C.primaryLight, border: `1px solid ${C.primary}33` }}>
        <p className="text-sm" style={{ color: C.primary }}>💡 마진 정책 변경은 다음 AI 추천 요청부터 반영됩니다. 기존 확정 견적은 저장 시점 기준 가격을 유지합니다.</p>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => setSaved(false)} className="h-11 px-6 rounded-xl text-sm font-semibold"
          style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>변경 취소</button>
        <button onClick={() => setSaved(true)} className="h-11 px-8 rounded-xl text-sm font-bold text-white"
          style={{ background: C.primary }}>정책 저장</button>
      </div>
      {saved && <div className="mt-3 p-3 rounded-lg text-sm text-center" style={{ background: "#e8f5e9", color: C.success }}>✓ 가격 정책이 저장되었습니다.</div>}
    </AdminLayout>
  );
}

// ── adm-recommend-weights — AI 추천 가중치 ─────────────────────────────────
function AdmRecommendWeights({ navigate }: { navigate: (s: Screen) => void }) {
  const [weights, setWeights] = useState({ stock: 40, margin: 30, value: 30 });
  const [saved, setSaved] = useState(false);
  const total = weights.stock + weights.margin + weights.value;
  const valid = total === 100;

  const setW = (k: keyof typeof weights, v: number) => {
    setWeights(p => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const previews = [
    { icon: "📦", label: "재고소진 우선", val: weights.stock, desc: "재고 회전율 상승", sub: "품절 예정 상품 우선 추천", color: C.primary },
    { icon: "💰", label: "마진극대 우선", val: weights.margin, desc: "견적당 예상 마진 증가", sub: "수익성 높은 부품 조합 강화", color: "#10a37f" },
    { icon: "💎", label: "가성비 우선", val: weights.value, desc: "사용자 예산 적합도 상승", sub: "비용 대비 성능 최적화", color: "#f59e0b" },
  ];

  return (
    <AdminLayout current="adm-recommend-weights" navigate={navigate} breadcrumb="추천 가중치">
      <AdminPageHeader
        title="AI 추천 엔진 가중치 제어"
        sub="재고소진, 마진극대, 가성비 비중의 총합을 100%로 조정합니다."
      />

      {/* 슬라이더 카드 */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold" style={{ color: C.textStrong }}>추천 정책 가중치</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: C.textSub }}>총합:</span>
            <span className="text-xl font-black" style={{ color: valid ? C.success : C.error }}>{total}%</span>
          </div>
        </div>
        <div className="space-y-6">
          {previews.map(p => (
            <div key={p.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm font-semibold" style={{ color: C.textBody }}>{p.label}</span>
                </div>
                <span className="text-2xl font-black" style={{ color: p.color }}>{p.val}%</span>
              </div>
              <div className="relative">
                <div className="h-4 rounded-full" style={{ background: C.line }}>
                  <div className="h-4 rounded-full transition-all" style={{ width: `${p.val}%`, background: p.color }} />
                </div>
                <input type="range" min={0} max={100} value={p.val}
                  onChange={e => setW(p.label === "재고소진 우선" ? "stock" : p.label === "마진극대 우선" ? "margin" : "value", +e.target.value)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-4" />
              </div>
              <p className="text-xs mt-1" style={{ color: C.textSub }}>{p.sub}</p>
            </div>
          ))}
        </div>
        {!valid && (
          <div className="mt-4 p-3 rounded-lg text-sm" style={{ background: "#fdecea", color: C.error }}>
            ⚠ 가중치 총합은 반드시 100%여야 합니다. 현재: {total}%
          </div>
        )}
      </Card>

      {/* 미리보기 */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {previews.map(p => (
          <div key={p.label} className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="text-3xl mb-3">{p.icon}</div>
            <p className="text-sm font-bold mb-1" style={{ color: p.color }}>{p.label}</p>
            <p className="text-sm font-semibold mb-1" style={{ color: C.textStrong }}>{p.desc}</p>
            <p className="text-xs" style={{ color: C.textSub }}>{p.sub}</p>
            <div className="mt-3 text-lg font-black" style={{ color: p.color }}>{p.val}%</div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl mb-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
        <p className="text-xs" style={{ color: C.textSub }}>
          💡 정책 변경은 다음 추천 요청부터 적용됩니다. 극단적인 가중치(예: 100%-0%-0%)는 추천 다양성을 낮출 수 있습니다.
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={() => setWeights({ stock: 40, margin: 30, value: 30 })}
          className="h-11 px-5 rounded-xl text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>기본값 복원</button>
        <button onClick={() => navigate("dev-hub")}
          className="h-11 px-5 rounded-xl text-sm font-semibold" style={{ background: C.bg, color: C.primary, border: `1px solid ${C.primary}` }}>DevHub 미리보기</button>
        <button onClick={() => valid && setSaved(true)} disabled={!valid}
          className="h-11 px-8 rounded-xl text-sm font-bold text-white"
          style={{ background: valid ? C.primary : "#ccc" }}>가중치 저장</button>
      </div>
      {saved && <div className="mt-3 p-3 rounded-lg text-sm text-center" style={{ background: "#e8f5e9", color: C.success }}>✓ 추천 가중치가 저장되었습니다.</div>}
    </AdminLayout>
  );
}

// ── adm-keywords — 인기 키워드 ─────────────────────────────────────────────
const kwData = [
  { keyword: "배틀그라운드상옵", count: 1842 },
  { keyword: "원컴방송용", count: 1203 },
  { keyword: "딥러닝코딩", count: 987 },
  { keyword: "화이트감성", count: 876 },
  { keyword: "RTX4070", count: 754 },
];

const kwTop10 = [
  { rank: 1, kw: "배틀그라운드 상옵", cnt: 1842, up: true },
  { rank: 2, kw: "원컴방송용", cnt: 1203, up: true },
  { rank: 3, kw: "딥러닝 코딩", cnt: 987, up: false },
  { rank: 4, kw: "화이트 감성", cnt: 876, up: true },
  { rank: 5, kw: "RTX 4070", cnt: 754, up: false },
  { rank: 6, kw: "가성비 사무용", cnt: 621, up: true },
  { rank: 7, kw: "4K 영상편집", cnt: 543, up: true },
  { rank: 8, kw: "리그오브레전드 최옵", cnt: 487, up: false },
  { rank: 9, kw: "마인크래프트 쉐이더", cnt: 412, up: false },
  { rank: 10, kw: "저소음 PC", cnt: 389, up: true },
];

function AdmKeywords({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <AdminLayout current="adm-keywords" navigate={navigate} breadcrumb="인기 키워드">
      <AdminPageHeader
        title="마케팅 분석"
        sub="유저가 직접 입력한 자연어 프롬프트에서 관심 키워드를 분석합니다."
      />
      <AnalyticsTabBar active="keywords" navigate={navigate} />

      {/* 필터 */}
      <div className="flex gap-2 mb-5">
        <input type="date" className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
        <span className="flex items-center text-sm" style={{ color: C.textSub }}>~</span>
        <input type="date" className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
        <select className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
          <option>전체 모드</option><option>초급자</option><option>고급자</option>
        </select>
        <button className="h-9 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>조회</button>
      </div>

      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* 막대 차트 */}
        <Card>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>인기 키워드 랭킹 차트</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kwData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="keyword" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar key="bar-count" dataKey="count" name="빈도" fill={C.primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        {/* TOP 10 리스트 */}
        <Card>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>TOP 10 키워드 리스트</h2>
          <div className="space-y-1.5">
            {kwTop10.map(k => (
              <div key={k.rank} className="flex items-center gap-3 py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: k.rank <= 3 ? C.primary : C.bg, color: k.rank <= 3 ? "#fff" : C.textSub }}>{k.rank}</span>
                <span className="text-sm flex-1" style={{ color: C.textBody }}>{k.kw}</span>
                <span className="text-xs" style={{ color: C.textSub }}>{k.cnt.toLocaleString()}회</span>
                <span className="text-xs font-bold" style={{ color: k.up ? C.success : C.error }}>{k.up ? "▲" : "▼"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 워드클라우드 대체 */}
      <Card>
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>프롬프트 워드클라우드</h2>
        <div className="flex flex-wrap gap-2 p-4 rounded-xl min-h-32" style={{ background: C.bg }}>
          {[
            { word: "배틀그라운드", size: 28, w: 700 }, { word: "원컴방송", size: 22, w: 600 },
            { word: "딥러닝", size: 20, w: 600 }, { word: "RTX4070", size: 18, w: 500 },
            { word: "화이트감성", size: 17, w: 500 }, { word: "가성비", size: 16, w: 500 },
            { word: "4K편집", size: 15, w: 400 }, { word: "저소음", size: 14, w: 400 },
            { word: "AMD", size: 14, w: 400 }, { word: "NVIDIA", size: 13, w: 400 },
            { word: "사무용", size: 13, w: 400 }, { word: "게임", size: 12, w: 400 },
            { word: "방송용", size: 12, w: 400 }, { word: "조용한PC", size: 11, w: 400 },
          ].map((w, i) => (
            <span key={i} style={{ fontSize: w.size, fontWeight: w.w, color: `hsl(${210 + i * 15}, 70%, 45%)`, lineHeight: 1.4 }}>
              {w.word}
            </span>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>개인정보 마스킹 후 명사 중심으로 집계합니다.</p>
      </Card>
    </AdminLayout>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// ADMIN V3.0 — BATCH 5 (분석·시스템·DevHub)
// ════════════════════════════════════════════════════════════════════════════

// ── adm-click-report — 클릭/스왑 리포트 ───────────────────────────────────
const promoCtrItems = [
  { rank: 1, name: "RTX 4060 WHITE 특가", expose: 12400, click: 1860, ctr: 15.0, delta: "+2.1%", up: true },
  { rank: 2, name: "라이젠 7500F 기획전", expose: 9800, click: 1120, ctr: 11.4, delta: "-0.8%", up: false },
  { rank: 3, name: "1TB NVMe SSD 특가", expose: 7200, click: 680, ctr: 9.4, delta: "+1.3%", up: true },
  { rank: 4, name: "파워 번들 이벤트", expose: 5400, click: 421, ctr: 7.8, delta: "+0.5%", up: true },
  { rank: 5, name: "케이스 화이트 기획", expose: 4100, click: 213, ctr: 5.2, delta: "-1.2%", up: false },
];

const swapItems = [
  { rank: 1, name: "RTX 3060 12GB", cat: "그래픽카드", rec: 380, excl: 92, rate: 24.2 },
  { rank: 2, name: "500GB SATA SSD", cat: "SSD", rec: 210, excl: 51, rate: 24.0 },
  { rank: 3, name: "600W 보급형 파워", cat: "파워", rec: 190, excl: 43, rate: 22.6 },
  { rank: 4, name: "DDR4 16GB 단채널", cat: "메모리", rec: 165, excl: 35, rate: 21.2 },
  { rank: 5, name: "구형 쿨러 기본형", cat: "쿨러", rec: 142, excl: 28, rate: 19.7 },
];

const swapBarData = swapItems.map(s => ({ name: s.name.split(" ").slice(0, 2).join(" "), rate: s.rate }));

function AdmClickReport({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <AdminLayout current="adm-click-report" navigate={navigate} breadcrumb="클릭/스왑 리포트">
      <AdminPageHeader
        title="마케팅 분석"
        sub="AI 추천 부품의 스왑 이탈과 특가상품 CTR을 함께 분석합니다."
      />
      <AnalyticsTabBar active="click" navigate={navigate} />

      {/* 필터 */}
      <div className="flex gap-2 mb-5">
        <input type="date" className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
        <span className="flex items-center text-sm" style={{ color: C.textSub }}>~</span>
        <input type="date" className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
        <select className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
          <option>전체 모드</option><option>초급자</option><option>고급자</option>
        </select>
        <select className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
          <option>카테고리 전체</option>
          {["CPU", "그래픽카드", "메모리", "SSD", "파워"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="h-9 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>조회</button>
      </div>

      {/* 특가 CTR */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>특가상품 클릭률 CTR</h2>
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={promoCtrItems.map(p => ({ name: p.name.split(" ").slice(0, 2).join(" "), ctr: p.ctr }))}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, "CTR"]} />
              <Bar key="bar-ctr" dataKey="ctr" name="CTR" fill={C.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                  {["순위", "상품명", "노출", "클릭", "CTR", "전주"].map(h => (
                    <th key={h} className="text-left py-2 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promoCtrItems.map(p => (
                  <tr key={p.rank} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td className="py-2 text-xs font-bold" style={{ color: C.textSub }}>{p.rank}</td>
                    <td className="py-2 text-xs" style={{ color: C.textBody }}>{p.name}</td>
                    <td className="py-2 text-xs" style={{ color: C.textSub }}>{p.expose.toLocaleString()}</td>
                    <td className="py-2 text-xs" style={{ color: C.textSub }}>{p.click.toLocaleString()}</td>
                    <td className="py-2 text-sm font-bold" style={{ color: C.primary }}>{p.ctr}%</td>
                    <td className="py-2 text-xs font-semibold" style={{ color: p.up ? C.success : C.error }}>{p.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* 탈락 부품 */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>최다 탈락 부품 TOP 10</h2>
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={swapBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: number) => [`${v}%`, "제외율"]} />
              <Bar key="bar-rate" dataKey="rate" name="제외율" fill="#ffb74d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                {["순위", "부품명", "카테고리", "추천", "제외", "제외율"].map(h => (
                  <th key={h} className="text-left py-2 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {swapItems.map(s => (
                <tr key={s.rank} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="py-2 text-xs font-bold" style={{ color: C.textSub }}>{s.rank}</td>
                  <td className="py-2 text-xs" style={{ color: C.textBody }}>{s.name}</td>
                  <td className="py-2 text-xs" style={{ color: C.textSub }}>{s.cat}</td>
                  <td className="py-2 text-xs" style={{ color: C.textSub }}>{s.rec}</td>
                  <td className="py-2 text-xs" style={{ color: C.textSub }}>{s.excl}</td>
                  <td className="py-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: s.rate > 22 ? "#fdecea" : "#fff8e1", color: s.rate > 22 ? C.error : C.warning }}>
                      {s.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>AI가 제안했으나 사용자가 제외한 부품과 특가 클릭률을 함께 분석해 추천 품질과 마케팅 효율을 개선합니다.</p>
      </Card>

      {/* 운영 액션 제안 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "🔥", title: "CTR 높고 스왑 제외율 높음", desc: "클릭 관심은 높으나 최종 구성 만족도가 낮습니다.", action: "정책 화면으로 이동", target: "adm-recommend-weights" as Screen, color: C.error },
          { icon: "📉", title: "노출 많고 CTR 낮은 특가", desc: "특가 문구, 가격, 배치 우선순위 점검이 필요합니다.", action: "대시보드로 이동", target: "adm-dashboard" as Screen, color: C.warning },
          { icon: "⚖️", title: "가중치 조정 검토 대상", desc: "반복적으로 스왑 제외되는 카테고리는 가중치 조정 대상입니다.", action: "추천 가중치 보기", target: "adm-recommend-weights" as Screen, color: C.primary },
        ].map(a => (
          <div key={a.title} className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="text-2xl mb-3">{a.icon}</div>
            <p className="text-sm font-bold mb-1" style={{ color: a.color }}>{a.title}</p>
            <p className="text-xs mb-4" style={{ color: C.textSub }}>{a.desc}</p>
            <button onClick={() => navigate(a.target)}
              className="h-8 px-4 rounded-lg text-xs font-semibold"
              style={{ background: `${a.color}15`, color: a.color }}>
              {a.action} →
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

// ── adm-funnel — 모드별 퍼널 이탈 관제 ────────────────────────────────────
const funnelSteps = [
  { step: "메인 진입", beg: 12400, exp: 3210, conv: 100, drop: 0, status: "정상" },
  { step: "모드 선택", beg: 8920, exp: 2540, conv: 78.4, drop: 21.6, status: "정상" },
  { step: "조건 입력 완료", beg: 5310, exp: 1420, conv: 58.7, drop: 41.3, status: "주의" },
  { step: "AI 추천 결과", beg: 4980, exp: 1310, conv: 93.4, drop: 6.6, status: "정상" },
  { step: "커스터마이징", beg: 3210, exp: 920, conv: 67.4, drop: 32.6, status: "정상" },
  { step: "장바구니", beg: 1120, exp: 410, conv: 24.3, drop: 75.7, status: "위험" },
  { step: "결제 성공", beg: 720, exp: 278, conv: 63.8, drop: 36.2, status: "정상" },
];

const funnelChartData = funnelSteps.map(s => ({ name: s.step, 초급자: s.beg, 고급자: s.exp }));

function AdmFunnel({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <AdminLayout current="adm-funnel" navigate={navigate} breadcrumb="전환 퍼널">
      <AdminPageHeader
        title="마케팅 분석"
        sub="메인 진입부터 결제 레일까지 초급자/고급자 모드별 이탈 구간을 추적합니다."
      />
      <AnalyticsTabBar active="funnel" navigate={navigate} />

      {/* 필터 */}
      <div className="flex gap-2 mb-5">
        <input type="date" className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
        <span className="flex items-center text-sm" style={{ color: C.textSub }}>~</span>
        <input type="date" className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
        <select className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
          <option>전체 모드</option><option>초급자</option><option>고급자</option>
        </select>
        <select className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
          <option>유입채널 전체</option><option>검색</option><option>광고</option><option>직접유입</option>
        </select>
        <button className="h-9 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>조회</button>
      </div>

      {/* 퍼널 차트 */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>사용자 전환 퍼널 — 초급자/고급자 비교</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={funnelChartData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => [v.toLocaleString() + "명"]} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Bar key="bar-beg" dataKey="초급자" name="초급자" fill={C.primary} radius={[4, 4, 0, 0]} />
            <Bar key="bar-exp" dataKey="고급자" name="고급자" fill="#8e24aa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 수치 표 */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>단계별 도달·이탈 수치</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              {["단계", "초급자", "고급자", "전환율", "이탈률", "상태"].map(h => (
                <th key={h} className="text-left py-2.5 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funnelSteps.map(s => {
              const statColor = s.status === "정상" ? C.success : s.status === "주의" ? C.warning : C.error;
              const statBg = s.status === "정상" ? "#e8f5e9" : s.status === "주의" ? "#fff8e1" : "#fdecea";
              return (
                <tr key={s.step} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="py-3 font-medium" style={{ color: C.textBody }}>{s.step}</td>
                  <td className="py-3 font-semibold" style={{ color: C.primary }}>{s.beg.toLocaleString()}</td>
                  <td className="py-3 font-semibold" style={{ color: "#8e24aa" }}>{s.exp.toLocaleString()}</td>
                  <td className="py-3 text-sm" style={{ color: C.textBody }}>{s.conv}%</td>
                  <td className="py-3">
                    <span className="font-bold" style={{ color: s.drop > 40 ? C.error : C.textBody }}>{s.drop}%</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statBg, color: statColor }}>{s.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* 이탈 취약 구간 */}
      <div className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>이탈 취약 구간 분석</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "장바구니 전환 구간", rate: "75.7%", cause: "가격 부담 또는 스왑 피로도", action: "업셀링 문구와 장바구니 CTA 개선 권장", color: C.error },
            { title: "조건 입력 완료 전", rate: "41.3%", cause: "입력 단계 피로도", action: "초급자 옵션 수 축소 검토", color: C.warning },
            { title: "결제 레일 진입 전", rate: "36.2%", cause: "로그인 유도 시점 부담", action: "게스트 보관 기능 개선 검토", color: C.warning },
          ].map(g => (
            <div key={g.title} className="rounded-2xl p-5" style={{ background: C.surface, border: `2px solid ${g.color}33` }}>
              <p className="text-xs font-bold mb-1" style={{ color: g.color }}>이탈률 {g.rate}</p>
              <p className="text-sm font-bold mb-2" style={{ color: C.textStrong }}>{g.title}</p>
              <p className="text-xs mb-1" style={{ color: C.textSub }}>추정 원인: {g.cause}</p>
              <p className="text-xs" style={{ color: C.primary }}>권장 조치: {g.action}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {[
          { label: "클릭/스왑 리포트", target: "adm-click-report" as Screen },
        ].map(b => (
          <button key={b.label} onClick={() => navigate(b.target)}
            className="h-9 px-5 rounded-lg text-sm font-semibold"
            style={{ background: C.primaryLight, color: C.primary }}>
            {b.label} →
          </button>
        ))}
      </div>
    </AdminLayout>
  );
}

// ── adm-system-limit — AI 비용 제어 및 트래픽 서킷 브레이커 ────────────────
const rateLimits = [
  { type: "회원등급", target: "일반", limit: 10, used: 7, on: true },
  { type: "회원등급", target: "우수", limit: 30, used: 12, on: true },
  { type: "회원등급", target: "딜러", limit: 50, used: 18, on: true },
  { type: "IP", target: "123.***.***.45", limit: 5, used: 5, on: true },
];

const blockLogs = [
  { time: "11:05", type: "Circuit Breaker", target: "전체 LLM", reason: "일일 70,000원 초과", result: "외부 호출 차단" },
  { time: "10:22", type: "Rate Limit", target: "일반회원", reason: "일일 10회 초과", result: "429 반환" },
  { time: "09:44", type: "Rate Limit", target: "123.***.***.45", reason: "IP 5회 초과", result: "429 반환" },
];

function AdmSystemLimit({ navigate }: { navigate: (s: Screen) => void }) {
  const [thresholds, setThresholds] = useState({ total: 70000, gemini: 28000, chatgpt: 28000, claude: 28000 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [cbActive, setCbActive] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <AdminLayout current="adm-system-limit" navigate={navigate} breadcrumb="시스템 제어">
      <AdminPageHeader
        title="시스템 제어"
        sub="Rate Limit, AI 비용 임계치, Circuit Breaker를 통합 관리합니다."
      >
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{ background: cbActive ? "#fdecea" : "#e8f5e9", color: cbActive ? C.error : C.success }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: cbActive ? C.error : C.success, display: "inline-block" }} />
          {cbActive ? "외부 AI 차단 중" : "정상 운영"}
        </span>
      </AdminPageHeader>

      {/* AI 비용 3사 */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { name: "Google Gemini", key: "gemini", cost: "17,500원", inTok: "1,240,000", outTok: "820,000", color: "#4285f4" },
          { name: "OpenAI ChatGPT", key: "chatgpt", cost: "25,480원", inTok: "1,580,000", outTok: "1,100,000", color: "#10a37f" },
          { name: "Anthropic Claude", key: "claude", cost: "30,940원", inTok: "1,820,000", outTok: "1,400,000", color: "#d97757" },
        ].map(ai => (
          <div key={ai.name} className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: ai.color }}>{ai.name[0]}</div>
                <p className="text-sm font-bold" style={{ color: C.textStrong }}>{ai.name.split(" ")[1]}</p>
              </div>
              <StatusBadge status="정상" />
            </div>
            <p className="text-2xl font-black mb-2" style={{ color: ai.color }}>{ai.cost}</p>
            <div className="space-y-1 text-xs" style={{ color: C.textSub }}>
              <div className="flex justify-between"><span>인바운드 토큰</span><span>{ai.inTok}</span></div>
              <div className="flex justify-between"><span>아웃바운드</span><span>{ai.outTok}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* 비용 추이 차트 */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold" style={{ color: C.textStrong }}>일별 비용 추이</h2>
          <div className="flex gap-2">
            <input type="date" className="h-8 px-3 rounded-lg text-xs" style={{ border: `1px solid ${C.line}` }} />
            <span className="flex items-center text-xs" style={{ color: C.textSub }}>~</span>
            <input type="date" className="h-8 px-3 rounded-lg text-xs" style={{ border: `1px solid ${C.line}` }} />
            <button className="h-8 px-3 rounded-lg text-xs font-semibold text-white" style={{ background: C.primary }}>조회</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={costLineData} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}천원`} />
            <Tooltip formatter={(v: number) => [`${(v * 1000).toLocaleString()}원`]} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            <Line key="sys-line-0" type="monotone" dataKey="Gemini" name="Gemini" stroke="#4285f4" strokeWidth={2} dot={false} />
            <Line key="sys-line-1" type="monotone" dataKey="ChatGPT" name="ChatGPT" stroke="#10a37f" strokeWidth={2} dot={false} />
            <Line key="sys-line-2" type="monotone" dataKey="Claude" name="Claude" stroke="#d97757" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs mt-2" style={{ color: C.textSub }}>토큰 사용량 기반 예상 원화 비용입니다.</p>
      </Card>

      {/* Circuit Breaker */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>비용 차단 임계치 (Circuit Breaker)</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {([
            { label: "일일 전체 한도", key: "total" as keyof typeof thresholds },
            { label: "Gemini 개별", key: "gemini" as keyof typeof thresholds },
            { label: "ChatGPT 개별", key: "chatgpt" as keyof typeof thresholds },
            { label: "Claude 개별", key: "claude" as keyof typeof thresholds },
          ]).map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSub }}>{f.label} (원)</label>
              <input type="number" value={thresholds[f.key]}
                onChange={e => setThresholds(p => ({ ...p, [f.key]: +e.target.value }))}
                className="w-full h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSaved(true)}
            className="h-10 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>임계치 저장</button>
          <button onClick={() => setShowConfirm(true)}
            className="h-10 px-5 rounded-lg text-sm font-bold text-white" style={{ background: C.error }}>🚨 즉시 외부 AI 차단</button>
          {cbActive && (
            <button onClick={() => setCbActive(false)}
              className="h-10 px-5 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.success, border: `1px solid ${C.success}` }}>차단 해제</button>
          )}
        </div>
        {saved && <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: "#e8f5e9", color: C.success }}>✓ 시스템 제어 정책이 저장되었습니다.</div>}
      </Card>

      {/* Rate Limit */}
      <Card className="mb-5">
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>이용 제한 정책 (Rate Limit)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.line}` }}>
              {["대상 유형", "대상 값", "일일 한도", "현재 사용량", "적용", "관리"].map(h => (
                <th key={h} className="text-left py-2.5 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rateLimits.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td className="py-3 text-xs" style={{ color: C.textSub }}>{r.type}</td>
                <td className="py-3 font-medium" style={{ color: C.textBody }}>{r.target}</td>
                <td className="py-3 font-semibold" style={{ color: C.primary }}>{r.limit}회</td>
                <td className="py-3">
                  <span className="font-semibold" style={{ color: r.used >= r.limit ? C.error : C.textBody }}>{r.used}회</span>
                </td>
                <td className="py-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#e8f5e9", color: C.success }}>적용</span>
                </td>
                <td className="py-3">
                  <button className="px-3 h-7 rounded text-xs font-semibold" style={{ background: C.primaryLight, color: C.primary }}>수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2 mt-4">
          <button className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: C.primaryLight, color: C.primary }}>+ 정책 추가</button>
          <button className="h-9 px-4 rounded-lg text-sm font-bold text-white" style={{ background: C.primary }}>저장</button>
        </div>
      </Card>

      {/* 차단 이벤트 로그 */}
      <Card>
        <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>차단 이벤트 로그</h2>
        <div className="space-y-2">
          {blockLogs.map((l, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl text-sm" style={{ background: C.bg }}>
              <span className="text-xs font-mono shrink-0" style={{ color: C.textSub }}>{l.time}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded shrink-0" style={{ background: "#fdecea", color: C.error }}>{l.type}</span>
              <span className="text-xs shrink-0" style={{ color: C.textBody }}>{l.target}</span>
              <span className="text-xs flex-1" style={{ color: C.textSub }}>{l.reason}</span>
              <span className="text-xs font-semibold shrink-0" style={{ color: C.error }}>{l.result}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: C.textSub }}>
          API Key는 서버 .env에서만 관리하며, 관리자 화면에는 절대 평문 노출하지 않습니다.
        </p>
      </Card>

      {/* 차단 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-6 w-84" style={{ background: C.surface, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxWidth: 360 }}>
            <div className="text-3xl mb-3 text-center">🚨</div>
            <h3 className="text-base font-bold mb-2 text-center" style={{ color: C.error }}>즉시 차단 확인</h3>
            <p className="text-sm mb-5 text-center" style={{ color: C.textBody }}>
              외부 LLM 호출이 즉시 차단됩니다. 진행 중인 추천 요청에 영향이 있을 수 있습니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold" style={{ border: `1px solid ${C.line}`, color: C.textBody }}>취소</button>
              <button onClick={() => { setShowConfirm(false); setCbActive(true); }}
                className="flex-1 h-10 rounded-lg text-sm font-bold text-white" style={{ background: C.error }}>즉시 차단</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ── dev-hub — 통합 개발 진척도 허브 ────────────────────────────────────────
const devScreens = [
  { id: "FR-LND-010", key: "landing", comp: "Landing", status: "배포완료" },
  { id: "FR-BEG-010", key: "beg-step1", comp: "BegStep1", status: "배포완료" },
  { id: "FR-EXP-010", key: "exp-step1", comp: "ExpStep1", status: "배포완료" },
  { id: "ADM-DSH-010", key: "adm-dashboard", comp: "AdmDashboard", status: "로컬검증" },
  { id: "ADM-PRD-010", key: "adm-product-master", comp: "AdmProductMaster", status: "코딩중" },
  { id: "ADM-CSV-010", key: "adm-csv-import", comp: "AdmCsvImport", status: "코딩중" },
  { id: "ADM-POL-010", key: "adm-price-policy", comp: "AdmPricePolicy", status: "코딩중" },
  { id: "ADM-POL-020", key: "adm-recommend-weights", comp: "AdmRecommendWeights", status: "코딩중" },
  { id: "ADM-ANA-010", key: "adm-keywords", comp: "AdmKeywords", status: "코딩중" },
  { id: "ADM-ANA-020", key: "adm-click-report", comp: "AdmClickReport", status: "대기" },
  { id: "ADM-ANA-030", key: "adm-funnel", comp: "AdmFunnel", status: "대기" },
  { id: "ADM-SYS-010", key: "adm-system-limit", comp: "AdmSystemLimit", status: "대기" },
];

const statusBadgeMap: Record<string, { label: string; bg: string; color: string }> = {
  "배포완료": { label: "● 배포완료", bg: "#e8f5e9", color: "#2e7d32" },
  "로컬검증": { label: "🔵 로컬검증", bg: "#e3f2fd", color: "#1565c0" },
  "코딩중": { label: "🟡 코딩중", bg: "#fffde7", color: "#f57f17" },
  "대기": { label: "⚪ 대기", bg: "#f5f5f5", color: "#757575" },
};

// ── adm-operators — 운영자 관리 ────────────────────────────────────────────

type OpRole = "슈퍼관리자" | "관리자" | "MD" | "분석담당" | "읽기전용";
type OpStatus = "활성" | "비활성" | "초대중";

interface Operator {
  id: number;
  name: string;
  email: string;
  role: OpRole;
  status: OpStatus;
  lastLogin: string;
  createdAt: string;
  memo: string;
}

const ROLE_PERMISSIONS: Record<OpRole, string[]> = {
  슈퍼관리자: ["대시보드", "상품/재고", "가격/정책", "마케팅분석", "시스템제어", "운영자관리"],
  관리자:     ["대시보드", "상품/재고", "가격/정책", "마케팅분석", "시스템제어"],
  MD:         ["대시보드", "상품/재고", "가격/정책"],
  분석담당:   ["대시보드", "마케팅분석"],
  읽기전용:   ["대시보드"],
};

const ROLE_COLORS: Record<OpRole, { bg: string; color: string }> = {
  슈퍼관리자: { bg: "#fdecea", color: "#c62828" },
  관리자:     { bg: C.primaryLight, color: C.primary },
  MD:         { bg: "#f3e5f5", color: "#7b1fa2" },
  분석담당:   { bg: "#e8f5e9", color: "#2e7d32" },
  읽기전용:   { bg: "#f5f5f5", color: "#757575" },
};

const STATUS_COLORS: Record<OpStatus, { bg: string; color: string }> = {
  활성:   { bg: "#e8f5e9", color: C.success },
  비활성: { bg: "#f5f5f5", color: "#757575" },
  초대중: { bg: "#fff8e1", color: C.warning },
};

const INITIAL_OPERATORS: Operator[] = [
  { id: 1, name: "김대표",    email: "ceo@popcornpc.com",      role: "슈퍼관리자", status: "활성",   lastLogin: "방금 전",   createdAt: "2024-01-15", memo: "시스템 총괄 관리자" },
  { id: 2, name: "이운영",    email: "ops@popcornpc.com",      role: "관리자",     status: "활성",   lastLogin: "1시간 전",  createdAt: "2024-03-20", memo: "" },
  { id: 3, name: "박상품MD",  email: "md@popcornpc.com",       role: "MD",         status: "활성",   lastLogin: "어제",      createdAt: "2024-05-10", memo: "GPU/CPU 카테고리 담당" },
  { id: 4, name: "최분석",    email: "analyst@popcornpc.com",  role: "분석담당",   status: "활성",   lastLogin: "3일 전",    createdAt: "2024-07-01", memo: "마케팅 리포트 담당" },
  { id: 5, name: "정인턴",    email: "intern@popcornpc.com",   role: "읽기전용",   status: "비활성", lastLogin: "2주 전",    createdAt: "2024-09-15", memo: "인턴 만료" },
  { id: 6, name: "(초대중)",  email: "newmd@popcornpc.com",    role: "MD",         status: "초대중", lastLogin: "-",         createdAt: "2026-06-19", memo: "" },
];

const OP_ACTIVITY_LOGS = [
  { time: "14:32", name: "이운영",   action: "상품 상태 변경",      detail: "RTX 4060 WHITE → 품절", ip: "192.168.***.21" },
  { time: "13:11", name: "박상품MD", action: "CSV 업서트 실행",      detail: "4,760건 처리 완료",      ip: "192.168.***.45" },
  { time: "11:58", name: "이운영",   action: "가격 정책 저장",       detail: "GPU 마진 15% → 17%",    ip: "192.168.***.21" },
  { time: "10:22", name: "김대표",   action: "운영자 초대",          detail: "newmd@popcornpc.com",   ip: "192.168.***.1"  },
  { time: "09:44", name: "최분석",   action: "키워드 리포트 조회",   detail: "2026-06 기간",           ip: "192.168.***.88" },
  { time: "09:10", name: "박상품MD", action: "상품 마스터 편집",     detail: "코드 204455 AI 필드 수정", ip: "192.168.***.45" },
  { time: "어제",  name: "이운영",   action: "권한 변경",            detail: "정인턴 → 비활성 처리",  ip: "192.168.***.21" },
];

function AdmOperators({ navigate }: { navigate: (s: Screen) => void }) {
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS);
  const [activeTab, setActiveTab] = useState<"list" | "log">("list");

  // 초대 모달
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OpRole>("MD");
  const [inviteMemo, setInviteMemo] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  // 편집 모달
  const [editOp, setEditOp] = useState<Operator | null>(null);
  const [editRole, setEditRole] = useState<OpRole>("MD");
  const [editMemo, setEditMemo] = useState("");
  const [editSaved, setEditSaved] = useState(false);

  // 상태 변경 확인 모달
  const [confirmOp, setConfirmOp] = useState<{ op: Operator; next: OpStatus } | null>(null);

  const openEdit = (op: Operator) => {
    setEditOp(op);
    setEditRole(op.role);
    setEditMemo(op.memo);
    setEditSaved(false);
  };

  const saveEdit = () => {
    if (!editOp) return;
    setOperators(p => p.map(o => o.id === editOp.id ? { ...o, role: editRole, memo: editMemo } : o));
    setEditSaved(true);
    setTimeout(() => setEditOp(null), 1200);
  };

  const applyStatusChange = () => {
    if (!confirmOp) return;
    setOperators(p => p.map(o => o.id === confirmOp.op.id ? { ...o, status: confirmOp.next } : o));
    setConfirmOp(null);
  };

  const sendInvite = () => {
    if (!inviteEmail) return;
    const newOp: Operator = {
      id: Date.now(), name: "(초대중)", email: inviteEmail,
      role: inviteRole, status: "초대중", lastLogin: "-",
      createdAt: new Date().toISOString().slice(0, 10), memo: inviteMemo,
    };
    setOperators(p => [...p, newOp]);
    setInviteSent(true);
    setTimeout(() => { setShowInvite(false); setInviteEmail(""); setInviteMemo(""); setInviteSent(false); }, 1500);
  };

  const activeCount  = operators.filter(o => o.status === "활성").length;
  const inviteCount  = operators.filter(o => o.status === "초대중").length;
  const inactiveCount = operators.filter(o => o.status === "비활성").length;

  return (
    <AdminLayout current="adm-operators" navigate={navigate}>
      {/* 헤더 */}
      <AdminPageHeader
        title="운영자 관리"
        sub="팝콘PC 관리자 시스템 접근 권한을 부여·회수하고 활동 내역을 추적합니다."
      >
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold text-white"
          style={{ background: C.primary, boxShadow: "0 4px 12px rgba(0,117,213,0.3)" }}>
          + 운영자 초대
        </button>
      </AdminPageHeader>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 운영자", val: operators.length, icon: "👥", color: C.primary },
          { label: "활성",        val: activeCount,       icon: "✅", color: C.success },
          { label: "초대 대기",   val: inviteCount,       icon: "📨", color: C.warning },
          { label: "비활성",      val: inactiveCount,     icon: "🚫", color: C.textSub },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs" style={{ color: C.textSub }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: C.bg, width: "fit-content" }}>
        {(["list", "log"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === t ? C.surface : "transparent",
              color: activeTab === t ? C.primary : C.textSub,
              boxShadow: activeTab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {t === "list" ? "👥 운영자 목록" : "📋 활동 로그"}
          </button>
        ))}
      </div>

      {/* ── 운영자 목록 탭 ── */}
      {activeTab === "list" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.bg, borderBottom: `2px solid ${C.line}` }}>
                {["운영자", "이메일", "역할", "접근 메뉴", "상태", "마지막 로그인", "관리"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.map((op, i) => {
                const rc = ROLE_COLORS[op.role];
                const sc = STATUS_COLORS[op.status];
                const perms = ROLE_PERMISSIONS[op.role];
                return (
                  <tr key={op.id} style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 === 0 ? C.surface : "#fafbfc" }}>
                    {/* 운영자 */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                          style={{ background: op.status === "비활성" ? "#ccc" : C.primary }}>
                          {op.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: C.textStrong }}>{op.name}</p>
                          {op.memo && <p className="text-xs" style={{ color: C.textSub }}>{op.memo}</p>}
                        </div>
                      </div>
                    </td>
                    {/* 이메일 */}
                    <td className="px-5 py-4 text-xs font-mono" style={{ color: C.textSub }}>{op.email}</td>
                    {/* 역할 */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: rc.bg, color: rc.color }}>{op.role}</span>
                    </td>
                    {/* 접근 메뉴 */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {perms.map(p => (
                          <span key={p} className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: C.bg, color: C.textSub, border: `1px solid ${C.line}` }}>{p}</span>
                        ))}
                      </div>
                    </td>
                    {/* 상태 */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.color }}>
                        {op.status === "활성" ? "● " : op.status === "초대중" ? "◌ " : "○ "}{op.status}
                      </span>
                    </td>
                    {/* 마지막 로그인 */}
                    <td className="px-5 py-4 text-xs" style={{ color: C.textSub }}>{op.lastLogin}</td>
                    {/* 관리 */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* 편집 (슈퍼관리자 본인 제외) */}
                        {op.role !== "슈퍼관리자" && (
                          <button onClick={() => openEdit(op)}
                            className="px-3 h-7 rounded-md text-xs font-semibold"
                            style={{ background: C.primaryLight, color: C.primary }}>
                            편집
                          </button>
                        )}
                        {/* 활성 ↔ 비활성 토글 */}
                        {op.status === "활성" && op.role !== "슈퍼관리자" && (
                          <button onClick={() => setConfirmOp({ op, next: "비활성" })}
                            className="px-3 h-7 rounded-md text-xs font-semibold"
                            style={{ background: "#fdecea", color: C.error }}>
                            비활성
                          </button>
                        )}
                        {op.status === "비활성" && (
                          <button onClick={() => setConfirmOp({ op, next: "활성" })}
                            className="px-3 h-7 rounded-md text-xs font-semibold"
                            style={{ background: "#e8f5e9", color: C.success }}>
                            활성화
                          </button>
                        )}
                        {op.status === "초대중" && (
                          <button
                            className="px-3 h-7 rounded-md text-xs font-semibold"
                            style={{ background: "#fff8e1", color: C.warning }}>
                            재발송
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 text-xs" style={{ background: C.bg, borderTop: `1px solid ${C.line}`, color: C.textSub }}>
            슈퍼관리자는 권한 변경·비활성 처리가 불가합니다. API Key·비밀번호는 관리자 화면에 평문 노출되지 않습니다.
          </div>
        </div>
      )}

      {/* ── 활동 로그 탭 ── */}
      {activeTab === "log" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
            <h2 className="text-sm font-bold" style={{ color: C.textStrong }}>운영자 활동 로그 (오늘)</h2>
            <span className="text-xs" style={{ color: C.textSub }}>개인정보 마스킹 적용 · IP 일부 비식별</span>
          </div>
          <div style={{ background: C.surface }}>
            {OP_ACTIVITY_LOGS.map((l, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom: i < OP_ACTIVITY_LOGS.length - 1 ? `1px solid ${C.line}` : "none" }}>
                {/* 시간 */}
                <span className="text-xs font-mono w-12 shrink-0" style={{ color: C.textSub }}>{l.time}</span>
                {/* 운영자 아바타 */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: C.primary }}>{l.name[0]}</div>
                {/* 운영자명 */}
                <span className="text-sm font-semibold w-20 shrink-0" style={{ color: C.textBody }}>{l.name}</span>
                {/* 액션 배지 */}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: C.primaryLight, color: C.primary }}>{l.action}</span>
                {/* 상세 */}
                <span className="text-sm flex-1 truncate" style={{ color: C.textBody }}>{l.detail}</span>
                {/* IP */}
                <span className="text-xs font-mono shrink-0" style={{ color: C.textSub }}>{l.ip}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
            <button className="text-xs font-semibold" style={{ color: C.primary }}>
              전체 로그 다운로드 (CSV) →
            </button>
          </div>
        </div>
      )}

      {/* ── 역할 정의 참고표 ── */}
      <div className="mt-6 rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
        <div className="px-5 py-4" style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
          <h3 className="text-sm font-bold" style={{ color: C.textStrong }}>역할별 접근 권한 참고표</h3>
        </div>
        <div className="overflow-auto" style={{ background: C.surface }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: C.textSub }}>역할</th>
                {["대시보드", "상품/재고", "가격/정책", "마케팅분석", "시스템제어", "운영자관리"].map(m => (
                  <th key={m} className="text-center px-3 py-3 text-xs font-semibold" style={{ color: C.textSub }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.entries(ROLE_PERMISSIONS) as [OpRole, string[]][]).map(([role, perms], i) => {
                const rc = ROLE_COLORS[role];
                return (
                  <tr key={role} style={{ borderBottom: `1px solid ${C.line}`, background: i % 2 === 0 ? C.surface : "#fafbfc" }}>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: rc.bg, color: rc.color }}>{role}</span>
                    </td>
                    {["대시보드", "상품/재고", "가격/정책", "마케팅분석", "시스템제어", "운영자관리"].map(m => (
                      <td key={m} className="px-3 py-3 text-center">
                        {perms.includes(m)
                          ? <span style={{ color: C.success, fontSize: 16 }}>✓</span>
                          : <span style={{ color: C.line, fontSize: 16 }}>—</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ 운영자 초대 모달 ══ */}
      {showInvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-2xl overflow-hidden w-full max-w-md" style={{ background: C.surface, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.line}` }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: C.textStrong }}>운영자 초대</h2>
                <p className="text-xs mt-0.5" style={{ color: C.textSub }}>초대 이메일이 발송되며 링크 클릭 시 계정이 활성화됩니다.</p>
              </div>
              <button onClick={() => setShowInvite(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ background: C.bg, color: C.textSub }}>✕</button>
            </div>
            {/* 모달 바디 */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSub }}>이메일 주소 *</label>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="example@popcornpc.com"
                  className="w-full h-10 px-3 rounded-lg text-sm"
                  style={{ border: `1px solid ${inviteEmail ? C.primary : C.line}` }} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSub }}>역할 *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ROLE_PERMISSIONS) as OpRole[]).filter(r => r !== "슈퍼관리자").map(r => {
                    const rc = ROLE_COLORS[r];
                    const sel = inviteRole === r;
                    return (
                      <button key={r} onClick={() => setInviteRole(r)}
                        className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                        style={{
                          border: `2px solid ${sel ? rc.color : C.line}`,
                          background: sel ? rc.bg : C.bg,
                        }}>
                        <span className="text-xs font-bold" style={{ color: sel ? rc.color : C.textSub }}>{r}</span>
                        <span className="text-xs ml-auto" style={{ color: C.textSub }}>
                          {ROLE_PERMISSIONS[r].length}개 메뉴
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* 선택한 역할 권한 미리보기 */}
              <div className="p-3 rounded-xl" style={{ background: C.bg }}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: C.textSub }}>
                  {inviteRole} 접근 가능 메뉴
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PERMISSIONS[inviteRole].map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded"
                      style={{ background: ROLE_COLORS[inviteRole].bg, color: ROLE_COLORS[inviteRole].color }}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSub }}>메모 (선택)</label>
                <input value={inviteMemo} onChange={e => setInviteMemo(e.target.value)}
                  placeholder="담당 업무, 부서 등"
                  className="w-full h-10 px-3 rounded-lg text-sm"
                  style={{ border: `1px solid ${C.line}` }} />
              </div>
            </div>
            {/* 모달 푸터 */}
            <div className="px-6 py-4 flex gap-2" style={{ borderTop: `1px solid ${C.line}`, background: C.bg }}>
              <button onClick={() => setShowInvite(false)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold"
                style={{ border: `1px solid ${C.line}`, color: C.textBody }}>취소</button>
              <button onClick={sendInvite} disabled={!inviteEmail}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-white"
                style={{ background: inviteEmail ? C.primary : "#ccc" }}>
                {inviteSent ? "✓ 초대 발송 완료!" : "초대 이메일 발송"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 권한·메모 편집 모달 ══ */}
      {editOp && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-2xl overflow-hidden w-full max-w-md" style={{ background: C.surface, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.line}` }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: C.textStrong }}>운영자 편집</h2>
                <p className="text-xs mt-0.5" style={{ color: C.textSub }}>{editOp.email}</p>
              </div>
              <button onClick={() => setEditOp(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ background: C.bg, color: C.textSub }}>✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* 운영자 정보 */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.bg }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-black text-white"
                  style={{ background: C.primary }}>{editOp.name[0]}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.textStrong }}>{editOp.name}</p>
                  <p className="text-xs" style={{ color: C.textSub }}>가입일: {editOp.createdAt}</p>
                </div>
              </div>
              {/* 역할 변경 */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSub }}>역할 변경</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ROLE_PERMISSIONS) as OpRole[]).filter(r => r !== "슈퍼관리자").map(r => {
                    const rc = ROLE_COLORS[r];
                    const sel = editRole === r;
                    return (
                      <button key={r} onClick={() => setEditRole(r)}
                        className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                        style={{ border: `2px solid ${sel ? rc.color : C.line}`, background: sel ? rc.bg : C.bg }}>
                        <span className="text-xs font-bold" style={{ color: sel ? rc.color : C.textSub }}>{r}</span>
                        <span className="text-xs ml-auto" style={{ color: C.textSub }}>
                          {ROLE_PERMISSIONS[r].length}개 메뉴
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* 변경 권한 미리보기 */}
              {editRole !== editOp.role && (
                <div className="p-3 rounded-xl" style={{ background: "#fff8e1", border: `1px solid ${C.warning}33` }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: C.warning }}>⚠ 권한 변경 예정</p>
                  <p className="text-xs" style={{ color: C.textBody }}>
                    <span className="font-semibold">{editOp.role}</span>
                    {" → "}
                    <span className="font-semibold" style={{ color: ROLE_COLORS[editRole].color }}>{editRole}</span>
                    {" 로 변경됩니다. 다음 로그인 시 반영됩니다."}
                  </p>
                </div>
              )}
              {/* 메모 */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textSub }}>메모</label>
                <input value={editMemo} onChange={e => setEditMemo(e.target.value)}
                  placeholder="담당 업무, 부서 등"
                  className="w-full h-10 px-3 rounded-lg text-sm"
                  style={{ border: `1px solid ${C.line}` }} />
              </div>
            </div>
            <div className="px-6 py-4 flex gap-2" style={{ borderTop: `1px solid ${C.line}`, background: C.bg }}>
              <button onClick={() => setEditOp(null)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold"
                style={{ border: `1px solid ${C.line}`, color: C.textBody }}>취소</button>
              <button onClick={saveEdit}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-white"
                style={{ background: editSaved ? C.success : C.primary }}>
                {editSaved ? "✓ 저장 완료!" : "변경 저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 상태 변경 확인 모달 ══ */}
      {confirmOp && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm text-center"
            style={{ background: C.surface, boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <div className="text-4xl mb-3">{confirmOp.next === "비활성" ? "🚫" : "✅"}</div>
            <h3 className="text-base font-bold mb-2" style={{ color: confirmOp.next === "비활성" ? C.error : C.success }}>
              {confirmOp.next === "비활성" ? "계정 비활성 처리" : "계정 활성화"}
            </h3>
            <p className="text-sm mb-2" style={{ color: C.textBody }}>
              <strong>{confirmOp.op.name}</strong> ({confirmOp.op.email})
            </p>
            <p className="text-sm mb-6" style={{ color: C.textSub }}>
              {confirmOp.next === "비활성"
                ? "비활성 처리 시 즉시 로그인이 차단됩니다."
                : "활성화 시 해당 운영자가 다시 로그인할 수 있습니다."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmOp(null)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold"
                style={{ border: `1px solid ${C.line}`, color: C.textBody }}>취소</button>
              <button onClick={applyStatusChange}
                className="flex-1 h-10 rounded-xl text-sm font-bold text-white"
                style={{ background: confirmOp.next === "비활성" ? C.error : C.success }}>
                {confirmOp.next === "비활성" ? "비활성 처리" : "활성화"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function DevHub({ navigate }: { navigate: (s: Screen) => void }) {
  const [mockMode, setMockMode] = useState<"mock" | "real">("mock");
  const [weights, setWeights] = useState({ stock: 40, margin: 30, value: 30 });
  const [copied, setCopied] = useState(false);
  const [sessionToast, setSessionToast] = useState(false);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleSession = () => { setSessionToast(true); setTimeout(() => setSessionToast(false), 2000); };
  const wTotal = weights.stock + weights.margin + weights.value;
  const wValid = wTotal === 100;

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {/* Title bar */}
      <div style={{ background: "#080e1c", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">팝콘PC AI — 통합 개발·운영 마스터 제어 허브</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              기획·개발·고객 검수를 위한 화면 진척도, 세션, Mock API, 운영 정책 테스트 게이트입니다.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("landing")}
              className="h-9 px-4 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
              랜딩으로 이동
            </button>
            <button onClick={() => navigate("adm-dashboard")}
              className="h-9 px-4 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>
              관리자 대시보드
            </button>
          </div>
        </div>
      </div>

      {/* 인프라 상태 바 */}
      <div style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-6 flex-wrap">
          {[
            { label: "로컬 DB", ok: true }, { label: "개발서버 DB", ok: true },
            { label: "Nginx", ok: true }, { label: "Mock API", ok: mockMode === "mock" },
            { label: "Circuit Breaker", ok: true },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 text-sm">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.ok ? "#22c55e" : C.error, display: "inline-block" }} />
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}:</span>
              <span className="font-semibold" style={{ color: s.ok ? "#86efac" : "#fca5a5" }}>{s.ok ? "ONLINE" : "OFFLINE"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* ① 진척도 매트릭스 */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
            <h2 className="text-base font-bold" style={{ color: C.textStrong }}>① 화면 구현 진척도 매트릭스</h2>
            <p className="text-xs" style={{ color: C.textSub }}>Screen 키 기준 정적 미리보기 · 동작 테스트 추적</p>
          </div>
          <div style={{ background: C.surface }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: C.bg, borderBottom: `2px solid ${C.line}` }}>
                  {["화면 ID", "Screen 키", "컴포넌트", "구현 상태", "이동 링크"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {devScreens.map(s => {
                  const badge = statusBadgeMap[s.status];
                  return (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: C.textSub }}>{s.id}</td>
                      <td className="px-4 py-2.5 text-xs font-medium" style={{ color: C.textBody }}>{s.key}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: C.textSub }}>{s.comp}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button className="px-2 h-6 rounded text-xs" style={{ background: C.primaryLight, color: C.primary }}>정적 미리보기</button>
                          <button className="px-2 h-6 rounded text-xs" style={{ background: "#e8f5e9", color: C.success }}>동작 테스트</button>
                          <button onClick={handleCopy} className="px-2 h-6 rounded text-xs" style={{ background: "#fffde7", color: "#f57f17" }}>수정 프롬프트</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
              <p className="text-xs" style={{ color: C.textSub }}>상태: ⚪대기 → 🟡코딩중 → 🔵로컬검증 → ●배포완료</p>
            </div>
          </div>
        </div>

        {/* ② 개발 테스트 도구 */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>② 개발 테스트 도구</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-bold mb-1" style={{ color: C.textStrong }}>가상 세션 강제 주입</h3>
              <p className="text-xs mb-4" style={{ color: C.textSub }}>SSO 연동 없이 개발 테스트용 세션을 주입합니다.</p>
              <div className="flex flex-wrap gap-2">
                {["일반 회원", "우수 회원", "딜러", "게스트 유입"].map(g => (
                  <button key={g} onClick={handleSession}
                    className="px-4 h-9 rounded-lg text-sm font-semibold"
                    style={{ background: C.primaryLight, color: C.primary }}>
                    {g}
                  </button>
                ))}
              </div>
              {sessionToast && <div className="mt-3 p-2.5 rounded-lg text-xs" style={{ background: "#e8f5e9", color: C.success }}>✓ 가상 세션이 주입되었습니다.</div>}
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-1" style={{ color: C.textStrong }}>외부 LLM API Mock 스위치</h3>
              <p className="text-xs mb-4" style={{ color: C.textSub }}>개발·테스트 중 외부 LLM 비용 발생을 차단합니다.</p>
              <div className="flex gap-2">
                {(["mock", "real"] as const).map(m => (
                  <button key={m} onClick={() => setMockMode(m)}
                    className="flex-1 h-9 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: mockMode === m ? C.primary : C.bg, color: mockMode === m ? "#fff" : C.textBody, border: `1.5px solid ${mockMode === m ? C.primary : C.line}` }}>
                    {m === "mock" ? "가상 JSON 응답" : "실제 API 호출"}
                  </button>
                ))}
              </div>
              {mockMode === "real" && (
                <p className="mt-2 text-xs" style={{ color: C.error }}>⚠ 실제 API 호출 전 비용 임계치와 API Key 설정을 확인하세요.</p>
              )}
            </Card>
          </div>
        </div>

        {/* ③ 운영 정책 미리보기 */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>③ 운영 정책 미리보기</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textStrong }}>추천 로직 실시간 가중치</h3>
              {[
                { label: "재고소진", key: "stock" as const, color: C.primary },
                { label: "마진극대", key: "margin" as const, color: "#10a37f" },
                { label: "가성비", key: "value" as const, color: "#f59e0b" },
              ].map(w => (
                <div key={w.key} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: C.textBody }}>{w.label}</span>
                    <span className="font-bold" style={{ color: w.color }}>{weights[w.key]}%</span>
                  </div>
                  <div className="relative">
                    <div className="h-3 rounded-full" style={{ background: C.line }}>
                      <div className="h-3 rounded-full" style={{ width: `${weights[w.key]}%`, background: w.color }} />
                    </div>
                    <input type="range" min={0} max={100} value={weights[w.key]}
                      onChange={e => setWeights(p => ({ ...p, [w.key]: +e.target.value }))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-3" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold" style={{ color: wValid ? C.success : C.error }}>총합 {wTotal}%</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 h-8 rounded-lg text-xs font-semibold text-white" style={{ background: wValid ? C.primary : "#ccc" }} disabled={!wValid}>가중치 저장</button>
                <button onClick={() => navigate("adm-recommend-weights")} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: C.primaryLight, color: C.primary }}>정책 화면 이동</button>
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-bold mb-4" style={{ color: C.textStrong }}>AI 비용·서킷 브레이커</h3>
              <div className="space-y-2 mb-4">
                {[
                  { name: "Gemini", val: "17,500원", color: "#4285f4" },
                  { name: "ChatGPT", val: "25,480원", color: "#10a37f" },
                  { name: "Claude", val: "30,940원", color: "#d97757" },
                ].map(ai => (
                  <div key={ai.name} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${C.line}` }}>
                    <span className="text-sm" style={{ color: C.textBody }}>{ai.name}</span>
                    <span className="text-sm font-bold" style={{ color: ai.color }}>{ai.val}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg" style={{ background: "#e8f5e9" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.success, display: "inline-block" }} />
                <span className="text-xs font-semibold" style={{ color: C.success }}>Circuit Breaker: 정상</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate("adm-system-limit")} className="flex-1 h-8 rounded-lg text-xs font-semibold" style={{ background: C.primaryLight, color: C.primary }}>비용 차단 임계 설정</button>
                <button onClick={() => setMockMode("mock")} className="h-8 px-3 rounded-lg text-xs font-semibold" style={{ background: "#fdecea", color: C.error }}>Mock 강제 ON</button>
              </div>
            </Card>
          </div>
        </div>

        {/* ④ 관리자 V3.0 빠른 이동 */}
        <div>
          <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>④ 관리자 V3.0 빠른 이동</h2>
          <div className="grid grid-cols-5 gap-3">
            {[
              { title: "비즈니스 대시보드", key: "adm-dashboard" as Screen, icon: "📊", desc: "견적 피드·CTR·가격동향" },
              { title: "상품 마스터 및 재고", key: "adm-product-master" as Screen, icon: "📦", desc: "상품 검색·AI 필드·품절" },
              { title: "CSV 업서트", key: "adm-csv-import" as Screen, icon: "📤", desc: "대량 상품 Insert/Update" },
              { title: "가격/추천 정책", key: "adm-price-policy" as Screen, icon: "💰", desc: "마진율·추천 가중치" },
              { title: "시스템 제어", key: "adm-system-limit" as Screen, icon: "⚙️", desc: "비용·Rate Limit·차단" },
            ].map(m => (
              <div key={m.key} className="rounded-2xl p-4 text-center cursor-pointer transition-all"
                style={{ background: C.surface, border: `1px solid ${C.line}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.primary; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.line; }}>
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="text-xs font-bold mb-1" style={{ color: C.textStrong }}>{m.title}</p>
                <p className="text-xs mb-3" style={{ color: C.textSub }}>{m.desc}</p>
                <button onClick={() => navigate(m.key)}
                  className="w-full h-7 rounded-lg text-xs font-semibold text-white" style={{ background: C.primary }}>
                  이동
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: C.textSub }}>V3.0 기준 운영 우선순위에 맞춘 이동 경로입니다.</p>
        </div>
      </div>

      {/* 토스트 알림 */}
      {copied && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-semibold text-white z-50"
          style={{ background: "#1e293b", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          ✓ 수정 프롬프트가 클립보드에 복사되었습니다.
        </div>
      )}
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
    // Admin V3.0
    "adm-dashboard": <AdmDashboard navigate={navigate} />,
    "adm-product-master": <AdmProductMaster navigate={navigate} />,
    "adm-csv-import": <AdmCsvImport navigate={navigate} />,
    "adm-price-policy": <AdmPricePolicy navigate={navigate} />,
    "adm-recommend-weights": <AdmRecommendWeights navigate={navigate} />,
    "adm-keywords": <AdmKeywords navigate={navigate} />,
    "adm-click-report": <AdmClickReport navigate={navigate} />,
    "adm-funnel": <AdmFunnel navigate={navigate} />,
    "adm-system-limit": <AdmSystemLimit navigate={navigate} />,
    "adm-operators": <AdmOperators navigate={navigate} />,
    "dev-hub": <DevHub navigate={navigate} />,
  };

  return (
    <div style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {screenMap[screen]}
    </div>
  );
}
