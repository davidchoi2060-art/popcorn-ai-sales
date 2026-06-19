import type React from "react";
import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Screen } from "../../types";
import { C } from "../../constants/design";
import { UserLayout } from "../../layouts/AppLayouts";
import { requestRecommendation } from "../../api/recommend";

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

  const handleRecommend = async () => {
    setLoading(true);
    setProgress(0);
    setTimeout(() => setAiStatus(p => ({ ...p, gemini: "???" })), 300);
    setTimeout(() => setAiStatus(p => ({ ...p, chatgpt: "???" })), 700);
    setTimeout(() => setAiStatus(p => ({ ...p, claude: "???" })), 1000);
    const iv = window.setInterval(() => setProgress(p => Math.min(p + 4, 90)), 60);

    const response = await requestRecommendation({
      mode: "expert",
      raw_text: text,
      constraints: {
        cpu_maker: "AMD",
        gpu_maker: "NVIDIA",
        mem_type: "DDR5",
        power_margin: 0.3,
        cooler: "360mm AIO",
      },
      use_mock: true,
    });

    window.clearInterval(iv);
    setProgress(100);
    setAiStatus({
      gemini: "??",
      chatgpt: response.success && response.data.meta?.dropped_models.includes("chatgpt") ? "??" : "??",
      claude: "??",
    });
    window.setTimeout(() => navigate("exp-result"), 300);
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

export { ExpStep1, ExpStep2, ExpStep3, ExpStep4, ExpStep5, ExpResult, ExpDetail };
