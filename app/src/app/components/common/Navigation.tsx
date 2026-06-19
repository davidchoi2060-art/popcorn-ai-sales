import type { Screen } from '../../types';
import { C } from '../../constants/design';

// ── GNB ───────────────────────────────────────────────────────────────────
export function GNB({ current, navigate }: { current: Screen; navigate: (s: Screen) => void }) {
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
export function Footer() {
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

