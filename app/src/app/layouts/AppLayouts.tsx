import { useState } from 'react';
import type React from 'react';
import type { Screen } from '../types';
import { C } from '../constants/design';
import { GNB, Footer } from '../components/common/Navigation';

const adminMenus: { label: string; screens: Screen[]; target: Screen }[] = [
  { label: "메인 대시보드", screens: ["adm-dashboard"], target: "adm-dashboard" },
  { label: "상품/재고", screens: ["adm-product-master", "adm-csv-import"], target: "adm-product-master" },
  { label: "제품 소싱", screens: ["adm-sourcing"], target: "adm-sourcing" },
  { label: "가격/정책", screens: ["adm-price-policy", "adm-recommend-weights"], target: "adm-price-policy" },
  { label: "마케팅 분석", screens: ["adm-keywords", "adm-click-report", "adm-funnel"], target: "adm-keywords" },
  { label: "운영자 관리", screens: ["adm-operators"], target: "adm-operators" },
  { label: "시스템 제어", screens: ["adm-system-limit", "dev-hub"], target: "adm-system-limit" },
];

export function AdminLayout({
  current,
  navigate,
  children,
  breadcrumb,
}: {
  current: Screen;
  navigate: (s: Screen) => void;
  children: React.ReactNode;
  breadcrumb?: string;
}) {
  const activeMenu = adminMenus.find(m => m.screens.includes(current));
  const [isLnbOpen, setIsLnbOpen] = useState(true);
  const lnbWidth = isLnbOpen ? 220 : 64;

  return (
    <div className="flex min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <aside
        style={{ width: lnbWidth, background: "#1e293b", color: "#e2e8f0", flexShrink: 0, position: "sticky", top: 0, height: "100vh", transition: "width 160ms ease", overflow: "visible" }}
        className="flex flex-col relative"
      >
        <button
          type="button"
          onClick={() => setIsLnbOpen(prev => !prev)}
          aria-label={isLnbOpen ? "LNB 접기" : "LNB 펼치기"}
          title={isLnbOpen ? "LNB 접기" : "LNB 펼치기"}
          className="absolute top-1/2 -right-3 z-20 h-10 w-6 -translate-y-1/2 rounded-full text-xs font-bold shadow"
          style={{ background: C.surface, color: C.primary, border: `1px solid ${C.line}` }}
        >
          {isLnbOpen ? "<" : ">"}
        </button>
        <button
          onClick={() => navigate("adm-dashboard")}
          className="px-5 py-5 font-bold text-base text-left border-b border-slate-700 truncate"
          title="팝콘PC 관리자"
        >
          {isLnbOpen ? "팝콘PC 관리자" : "PC"}
        </button>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {adminMenus.map(m => (
            <button
              key={m.label}
              onClick={() => navigate(m.target)}
              className="text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all truncate"
              title={m.label}
              style={{
                background: m.screens.includes(current) ? C.primary : "transparent",
                color: m.screens.includes(current) ? "#fff" : "#94a3b8",
                textAlign: isLnbOpen ? "left" : "center",
              }}
            >
              {isLnbOpen ? m.label : m.label.slice(0, 1)}
            </button>
          ))}
        </nav>
        <button
          onClick={() => navigate("dev-hub")}
          className="mx-3 mb-3 px-4 py-2.5 rounded-md text-left text-sm font-semibold truncate"
          title="DEV 허브"
          style={{ background: "rgba(255,255,255,0.08)", color: "#cbd5e1", textAlign: isLnbOpen ? "left" : "center" }}
        >
          {isLnbOpen ? "DEV 허브" : "D"}
        </button>
        <div className="px-5 py-4 text-sm border-t border-slate-700 text-slate-400 truncate" title="관리자 모드">
          {isLnbOpen ? "관리자 모드" : "ADM"}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex items-center px-6 gap-2 text-xs"
          style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.line}`, color: C.textSub }}
        >
          <span>팝콘PC 관리자</span>
          <span>/</span>
          <span style={{ color: C.textBody }}>{breadcrumb || activeMenu?.label}</span>
          <div className="flex-1" />
          <span style={{ color: C.textBody, fontWeight: 600 }}>admin@popcornpc.com</span>
        </div>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function UserLayout({ current, navigate, children }: { current: Screen; navigate: (s: Screen) => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <GNB current={current} navigate={navigate} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
