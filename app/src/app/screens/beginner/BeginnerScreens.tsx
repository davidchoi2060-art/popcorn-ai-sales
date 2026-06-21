import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Screen } from "../../types";
import { C, btn } from "../../constants/design";
import { UserLayout } from "../../layouts/AppLayouts";
import { requestRecommendation } from "../../api/recommend";

type BeginnerDraft = {
  purpose: string;
  games: string[];
  customGame: string;
  details: string[];
  budget: number;
  budgetGrade: string;
  styles: string[];
  monitorResolution: string;
  monitorShape: string;
  monitorUse: string;
  monitorExcluded: boolean;
};

const BEGINNER_DRAFT_KEY = "popcorn-beginner-draft";
const DEFAULT_BEGINNER_DRAFT: BeginnerDraft = {
  purpose: "",
  games: [],
  customGame: "",
  details: [],
  budget: 100,
  budgetGrade: "",
  styles: [],
  monitorResolution: "",
  monitorShape: "",
  monitorUse: "",
  monitorExcluded: false,
};

function readBeginnerDraft(): BeginnerDraft {
  if (typeof window === "undefined") return DEFAULT_BEGINNER_DRAFT;
  try {
    const raw = window.sessionStorage.getItem(BEGINNER_DRAFT_KEY);
    return raw ? { ...DEFAULT_BEGINNER_DRAFT, ...JSON.parse(raw) } : DEFAULT_BEGINNER_DRAFT;
  } catch {
    return DEFAULT_BEGINNER_DRAFT;
  }
}

function useBeginnerDraft() {
  const [draft, setDraft] = useState<BeginnerDraft>(() => readBeginnerDraft());
  const updateDraft = (patch: Partial<BeginnerDraft>) => {
    setDraft(prev => {
      const next = { ...prev, ...patch };
      window.sessionStorage.setItem(BEGINNER_DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  };
  return { draft, updateDraft };
}

function getPurposeDetailText(draft: BeginnerDraft) {
  if (draft.purpose === "게임용") {
    return [...draft.games, draft.customGame.trim()].filter(Boolean).join(", ");
  }
  return draft.details.join(", ");
}

const BEG_STEPS = [
  { num: 1, label: "용도 선택" },
  { num: 2, label: "예산 설정" },
  { num: 3, label: "스타일 옵션" },
  { num: 4, label: "모니터 선택" },
  { num: 5, label: "AI 요청" },
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
          <span className="text-xs" style={{ color: C.textSub }}>초급자 모드 · {step}/5 단계</span>
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

const PURPOSE_DETAIL_OPTIONS: Record<string, { key: string; icon: string; desc: string }[]> = {
  사무용: [
    { key: "문서·엑셀 위주", icon: "📄", desc: "오피스, 세금계산서, 업무 문서" },
    { key: "화상회의 많음", icon: "🎥", desc: "줌, 팀즈, 웹캠 회의" },
    { key: "여러 창 동시 사용", icon: "🧩", desc: "브라우저 탭과 업무 프로그램 병행" },
    { key: "조용한 PC 선호", icon: "🔇", desc: "소음 적은 사무 환경" },
  ],
  영상편집용: [
    { key: "유튜브 영상 편집", icon: "▶️", desc: "일반 영상 컷편집과 자막" },
    { key: "4K 영상 편집", icon: "🎞️", desc: "고해상도 원본과 프리뷰" },
    { key: "숏폼·간단 편집", icon: "📱", desc: "릴스, 쇼츠, 틱톡 영상" },
    { key: "사진·디자인 병행", icon: "🎨", desc: "포토샵, 일러스트 작업" },
  ],
  인터넷방송용: [
    { key: "게임 방송", icon: "🎮", desc: "게임 플레이와 송출 동시 진행" },
    { key: "얼굴캠·토크 방송", icon: "🎙️", desc: "캠, 마이크, 채팅 중심" },
    { key: "녹화 후 편집까지", icon: "✂️", desc: "방송 저장본 편집 포함" },
    { key: "원컴 방송", icon: "🖥️", desc: "PC 한 대로 게임과 송출 처리" },
  ],
};

function BegStep1({ navigate }: { navigate: (s: Screen) => void }) {
  const { draft, updateDraft } = useBeginnerDraft();
  const [purpose, setPurpose] = useState(draft.purpose);
  const [games, setGames] = useState<string[]>(draft.games);
  const [customGame, setCustomGame] = useState(draft.customGame);
  const [details, setDetails] = useState<string[]>(draft.details);
  const selectedPurpose = PURPOSE_OPTIONS.find(p => p.key === purpose);
  const detailOptions = purpose === "게임용" ? GAME_OPTIONS : PURPOSE_DETAIL_OPTIONS[purpose] ?? [];

  const selectPurpose = (p: string) => {
    setPurpose(p);
    setDetails([]);
    if (p !== "게임용") {
      setGames([]);
      setCustomGame("");
    }
  };

  const toggleGame = (g: string) => setGames(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  const toggleDetail = (d: string) => setDetails(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const selectedDetailText = purpose === "게임용"
    ? [...games, customGame.trim()].filter(Boolean).join(", ")
    : details.join(", ");

  useEffect(() => {
    updateDraft({ purpose, games, customGame, details });
  }, [purpose, games, customGame, details]);

  return (
    <BegShell
      step={1} navigate={navigate}
      title="어떤 용도로 쓰실 PC인가요?"
      subtitle="주 목적 하나를 선택해 주세요. AI가 맞춤 사양을 자동으로 설계합니다."
      promptText="주 용도는 [purpose]이며, 세부 사용은 [detail]입니다. 팝콘PC의 최적 부품으로 견적을 조립해 주세요."
      promptKeys={{ purpose: purpose || "?", detail: selectedDetailText || "?" }}
      nextScreen="beg-step2"
    >
      {/* Purpose big cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {PURPOSE_OPTIONS.map(p => (
          <div key={p.key}
            onClick={() => selectPurpose(p.key)}
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

      {/* Purpose sub-selection */}
      {purpose && selectedPurpose && (
        <div className="rounded-2xl p-6" style={{ background: selectedPurpose.bg, border: `1.5px solid ${selectedPurpose.color}55` }}>
          <p className="text-sm font-bold mb-1" style={{ color: selectedPurpose.color }}>
            {selectedPurpose.icon} {purpose === "게임용" ? "주로 즐기는 게임을 골라주세요" : "세부 사용 목적을 골라주세요"} (다중 선택)
          </p>
          <p className="text-xs mb-4" style={{ color: selectedPurpose.color }}>
            {purpose === "게임용"
              ? "AI가 게임별 권장 사양과 직접 입력한 게임명을 함께 참고합니다."
              : "AI가 선택한 사용 패턴에 맞춰 CPU, 메모리, 저장공간, 소음 기준을 조정합니다."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {detailOptions.map(o => {
              const isSelected = purpose === "게임용" ? games.includes(o.key) : details.includes(o.key);
              return (
              <div key={o.key} onClick={() => purpose === "게임용" ? toggleGame(o.key) : toggleDetail(o.key)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? `${selectedPurpose.color}22` : C.surface,
                  border: `1.5px solid ${isSelected ? selectedPurpose.color : C.line}`,
                }}>
                <span className="text-xl">{o.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: isSelected ? selectedPurpose.color : C.textBody }}>{o.key}</p>
                  <p className="text-xs" style={{ color: C.textSub }}>{o.desc}</p>
                </div>
                {isSelected && <span className="ml-auto text-xs font-bold" style={{ color: selectedPurpose.color }}>✓</span>}
              </div>
              );
            })}
          </div>

          {purpose === "게임용" && (
            <div className="mt-4 rounded-xl p-4" style={{ background: C.surface, border: `1.5px dashed ${selectedPurpose.color}88` }}>
              <label className="text-sm font-semibold block mb-2" style={{ color: C.textBody }}>목록에 없는 게임 직접 입력</label>
              <input
                value={customGame}
                onChange={e => setCustomGame(e.target.value)}
                placeholder="예: 발로란트, 로스트아크, 마인크래프트"
                className="w-full h-11 rounded-lg px-4 text-sm outline-none"
                style={{ border: `1.5px solid ${C.line}`, color: C.textBody, background: C.bg }}
              />
              <p className="text-xs mt-2" style={{ color: C.textSub }}>여러 게임은 쉼표로 구분해서 입력해도 됩니다.</p>
            </div>
          )}

          {selectedDetailText && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: C.surface, border: `1px solid ${selectedPurpose.color}33` }}>
              <span className="text-sm">✓</span>
              <p className="text-sm" style={{ color: selectedPurpose.color }}>
                <span className="font-bold">선택된 세부 조건:</span> {selectedDetailText}
              </p>
            </div>
          )}
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
  const { draft, updateDraft } = useBeginnerDraft();
  const [budget, setBudget] = useState(draft.budget);
  const [preset, setPreset] = useState("");

  const getBudgetDesc = (v: number) => {
    if (v <= 70) return { label: "보급형", text: "기본적인 인터넷·문서 작업에 최적", color: "#43a047" };
    if (v <= 120) return { label: "중급형", text: "게임과 영상편집을 균형있게", color: "#1e88e5" };
    if (v <= 180) return { label: "고급형", text: "고사양 게임과 4K 편집 가능", color: "#8e24aa" };
    return { label: "프리미엄", text: "타협없는 최상급 성능", color: "#e53935" };
  };
  const desc = getBudgetDesc(budget);
  const pct = ((budget - 30) / (300 - 30)) * 100;
  const purposeDetail = getPurposeDetailText(draft);

  useEffect(() => {
    updateDraft({ budget, budgetGrade: desc.label });
  }, [budget, desc.label]);

  return (
    <BegShell
      step={2} navigate={navigate}
      title="예산은 어느 정도 생각하세요?"
      subtitle="슬라이더를 움직이거나 아래 프리셋을 클릭하세요."
      promptText="주 용도는 [purpose], 세부 사용은 [detail]입니다. 예산은 약 [budget] 정도로, [grade] 구성을 원합니다."
      promptKeys={{ purpose: draft.purpose || "?", detail: purposeDetail || "?", budget: `${budget}만원`, grade: desc.label }}
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
  const { draft, updateDraft } = useBeginnerDraft();
  const [styles, setStyles] = useState<string[]>(draft.styles);
  const toggle = (s: string) => setStyles(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const purposeDetail = getPurposeDetailText(draft);

  useEffect(() => {
    updateDraft({ styles });
  }, [styles]);

  return (
    <BegShell
      step={3} navigate={navigate}
      title="원하는 스타일이 있나요?"
      subtitle="여러 개 선택 가능합니다. AI가 해당 스타일에 맞는 부품과 케이스를 우선 추천합니다."
      promptText="주 용도는 [purpose], 세부 사용은 [detail]이고 예산은 [budget]입니다. 외관·스타일은 [style] 조건에 맞게 구성해 주세요."
      promptKeys={{
        purpose: draft.purpose || "?",
        detail: purposeDetail || "?",
        budget: draft.budget ? `${draft.budget}만원` : "?",
        style: styles.length ? styles.join(", ") : "?",
      }}
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

// ── Beg Step 4 ─────────────────────────────────────────────────────────────
const MONITOR_RESOLUTION_OPTIONS = [
  { key: "FHD", label: "FHD", desc: "가성비와 호환성이 좋은 기본 선택", size: "24형 추천", color: "#1e88e5" },
  { key: "QHD", label: "QHD", desc: "게임과 작업 모두 선명한 균형형", size: "27형 추천", color: "#7b1fa2" },
  { key: "4K", label: "4K", desc: "영상·사진 작업에 유리한 초고해상도", size: "32형 추천", color: "#bf360c" },
];

const MONITOR_SHAPE_OPTIONS = [
  { key: "평면", icon: "▭", desc: "문서·영상·일반 게임에 무난합니다.", color: "#1565c0" },
  { key: "커브드", icon: "◜◝", desc: "몰입감 있는 게임과 넓은 화면에 좋아요.", color: "#2e7d32" },
];

const MONITOR_USE_OPTIONS = [
  { key: "눈 편한 화면", icon: "👀", desc: "장시간 사무·학습" },
  { key: "부드러운 게임", icon: "🎯", desc: "144Hz 이상 우선" },
  { key: "색감 중요", icon: "🎨", desc: "영상·디자인 작업" },
];

function BegStep4({ navigate }: { navigate: (s: Screen) => void }) {
  const { draft, updateDraft } = useBeginnerDraft();
  const [resolution, setResolution] = useState(draft.monitorResolution || "QHD");
  const [shape, setShape] = useState(draft.monitorShape || "평면");
  const [use, setUse] = useState(draft.monitorUse || "부드러운 게임");
  const [monitorExcluded, setMonitorExcluded] = useState(draft.monitorExcluded);
  const selectedResolution = MONITOR_RESOLUTION_OPTIONS.find(o => o.key === resolution) ?? MONITOR_RESOLUTION_OPTIONS[1];
  const purposeDetail = getPurposeDetailText(draft);

  useEffect(() => {
    updateDraft({ monitorResolution: resolution, monitorShape: shape, monitorUse: use, monitorExcluded });
  }, [resolution, shape, use, monitorExcluded]);

  const includeMonitor = () => {
    setMonitorExcluded(false);
  };

  const skipMonitor = () => {
    updateDraft({ monitorResolution: "", monitorShape: "", monitorUse: "", monitorExcluded: true });
    navigate("beg-step5");
  };

  return (
    <BegShell
      step={4} navigate={navigate}
      title="모니터는 어떻게 쓰실 예정인가요?"
      subtitle="해상도와 화면 형태만 골라도 AI가 그래픽카드 성능과 모니터 조합을 함께 맞춥니다."
      promptText="주 용도는 [purpose], 세부 사용은 [detail], 예산은 [budget], 스타일은 [style]입니다. 모니터는 [resolution] 해상도, [shape] 화면, [use] 용도에 맞춰 추천해 주세요."
      promptKeys={{
        purpose: draft.purpose || "?",
        detail: purposeDetail || "?",
        budget: draft.budget ? `${draft.budget}만원` : "?",
        style: draft.styles.length ? draft.styles.join(", ") : "?",
        resolution,
        shape,
        use,
      }}
      onPrev={() => navigate("beg-step3")}
      nextScreen="beg-step5"
    >
      <div className="rounded-2xl p-5 mb-5 flex items-center justify-between gap-4" style={{ background: C.primaryLight, border: `1px solid ${C.primary}33` }}>
        <div>
          <p className="text-sm font-bold" style={{ color: C.primary }}>모니터가 이미 있거나 본체만 견적받고 싶으신가요?</p>
          <p className="text-xs mt-1" style={{ color: C.textSub }}>건너뛰면 AI 요청서에 모니터 제외 조건이 들어가고, 본체 부품 예산에 더 집중합니다.</p>
        </div>
        <button
          onClick={skipMonitor}
          className="h-10 px-5 rounded-xl text-sm font-bold shrink-0"
          style={{ background: C.surface, color: C.primary, border: `1.5px solid ${C.primary}` }}
        >
          견적에서 빼기
        </button>
      </div>
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 0.8fr" }}>
        <div className="space-y-5">
          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p className="text-sm font-bold mb-3" style={{ color: C.textBody }}>해상도 선택</p>
            <div className="grid grid-cols-3 gap-3">
              {MONITOR_RESOLUTION_OPTIONS.map(o => (
                <button key={o.key} onClick={() => { includeMonitor(); setResolution(o.key); }}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{
                    background: resolution === o.key ? `${o.color}10` : C.bg,
                    border: `2px solid ${resolution === o.key ? o.color : C.line}`,
                    boxShadow: resolution === o.key ? `0 4px 14px ${o.color}22` : "none",
                  }}>
                  <span className="text-2xl font-black block mb-2" style={{ color: resolution === o.key ? o.color : C.textStrong }}>{o.label}</span>
                  <span className="text-xs font-semibold block mb-1" style={{ color: C.textBody }}>{o.size}</span>
                  <span className="text-xs leading-relaxed" style={{ color: C.textSub }}>{o.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <p className="text-sm font-bold mb-3" style={{ color: C.textBody }}>평면 / 커브드</p>
            <div className="grid grid-cols-2 gap-3">
              {MONITOR_SHAPE_OPTIONS.map(o => (
                <button key={o.key} onClick={() => { includeMonitor(); setShape(o.key); }}
                  className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: shape === o.key ? `${o.color}10` : C.bg,
                    border: `2px solid ${shape === o.key ? o.color : C.line}`,
                  }}>
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
                    style={{ background: `${o.color}18`, color: o.color }}>{o.icon}</span>
                  <span>
                    <span className="text-sm font-bold block" style={{ color: shape === o.key ? o.color : C.textStrong }}>{o.key}</span>
                    <span className="text-xs" style={{ color: C.textSub }}>{o.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <p className="text-sm font-bold mb-3" style={{ color: C.textBody }}>가장 중요한 느낌</p>
            <div className="flex gap-3">
              {MONITOR_USE_OPTIONS.map(o => (
                <button key={o.key} onClick={() => { includeMonitor(); setUse(o.key); }}
                  className="flex-1 rounded-xl p-4 text-center transition-all"
                  style={{
                    background: use === o.key ? C.primaryLight : C.bg,
                    border: `2px solid ${use === o.key ? C.primary : C.line}`,
                    color: use === o.key ? C.primary : C.textBody,
                  }}>
                  <span className="text-2xl block mb-2">{o.icon}</span>
                  <span className="text-sm font-bold block">{o.key}</span>
                  <span className="text-xs" style={{ color: C.textSub }}>{o.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 flex flex-col justify-between" style={{ background: "linear-gradient(180deg, #08111f 0%, #10233b 100%)", color: "#fff", minHeight: 420, boxShadow: "0 8px 28px rgba(8,17,31,0.18)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#60a5fa" }}>Monitor Preview</p>
            <div className="mx-auto mb-6" style={{ width: 240 }}>
              <div style={{
                height: 140,
                border: "10px solid #1f2937",
                borderRadius: shape === "커브드" ? "28px 28px 18px 18px" : 14,
                background: `linear-gradient(135deg, ${selectedResolution.color}, #34d399)`,
                boxShadow: shape === "커브드" ? "inset 24px 0 30px rgba(0,0,0,0.24), inset -24px 0 30px rgba(0,0,0,0.24)" : "none",
              }} />
              <div className="mx-auto" style={{ width: 42, height: 36, background: "#1f2937" }} />
              <div className="mx-auto rounded-full" style={{ width: 120, height: 10, background: "#334155" }} />
            </div>
            <h2 className="text-2xl font-black mb-2">{resolution} · {shape}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.68)" }}>
              {selectedResolution.size} 기준으로 {use}에 맞춰 그래픽카드 성능 여유와 모니터 가격대를 함께 계산합니다.
            </p>
          </div>
          <div className="rounded-xl p-4 mt-6" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>초보자용 해석</p>
            <p className="text-sm font-semibold">
              {resolution === "4K" ? "선명함 우선이라 그래픽카드 예산을 넉넉히 잡습니다." : resolution === "QHD" ? "선명함과 가격 균형이 좋아 게임용으로 가장 무난합니다." : "예산을 아끼면서도 대부분의 작업을 편하게 할 수 있습니다."}
            </p>
          </div>
        </div>
      </div>
    </BegShell>
  );
}

// ── Beg Step 5 (Summary) ───────────────────────────────────────────────────
function BegStep5({ navigate }: { navigate: (s: Screen) => void }) {
  const { draft } = useBeginnerDraft();
  const purposeDetail = getPurposeDetailText(draft);
  const monitorText = draft.monitorExcluded
    ? "모니터는 견적에서 제외하고 본체만 최적의 견적으로 조립해 주세요."
    : `모니터는 [${draft.monitorResolution || "QHD"} 해상도 / ${draft.monitorShape || "평면"} / ${draft.monitorUse || "부드러운 게임"}] 기준으로 최적의 견적을 조립해 주세요.`;
  const defaultText = `안녕하세요! 저는 PC를 잘 모르는 초급자입니다.\n주 용도는 [${draft.purpose || "미선택"}]이며, 세부 사용은 [${purposeDetail || "미선택"}]입니다.\n예산은 [${draft.budget ? `${draft.budget}만 원` : "미선택"}] 정도이고, 외관은 [${draft.styles.length ? draft.styles.join(", ") : "미선택"}] 스타일입니다.\n${monitorText}\n호환성과 팝콘PC 재고를 반드시 확인해 주세요.`;
  const [text, setText] = useState(defaultText);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState<{ gemini: string; chatgpt: string; claude: string }>({ gemini: "대기", chatgpt: "대기", claude: "대기" });

  const handleRecommend = async () => {
    setLoading(true);
    setProgress(0);
    setTimeout(() => setAiStatus(p => ({ ...p, gemini: "???" })), 300);
    setTimeout(() => setAiStatus(p => ({ ...p, chatgpt: "???" })), 600);
    setTimeout(() => setAiStatus(p => ({ ...p, claude: "???" })), 900);
    const iv = window.setInterval(() => setProgress(p => Math.min(p + 3, 90)), 60);

    const response = await requestRecommendation({
      mode: "beginner",
      raw_text: text,
      budget: { min: 1000000, max: 1300000 },
      use_mock: true,
    });

    window.clearInterval(iv);
    setProgress(100);
    setAiStatus({
      gemini: "??",
      chatgpt: response.success && response.data.meta?.dropped_models.includes("chatgpt") ? "??" : "??",
      claude: "??",
    });
    window.setTimeout(() => { navigate("beg-result"); }, 300);
  };

  const aiColor: Record<string, string> = { "대기": C.textSub, "분석중": C.warning, "완료": C.success };
  const aiIcon: Record<string, string> = { "대기": "○", "분석중": "◐", "완료": "●" };

  return (
    <UserLayout current="beg-step5" navigate={navigate}>
      {/* Step header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <BegStepBar current={5} />
          <span className="text-xs" style={{ color: C.textSub }}>초급자 모드 · 5/5 단계</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.primary }}>STEP 5 — 마지막 단계</p>
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
          <button onClick={() => navigate("beg-step4")}
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
              <button onClick={() => navigate("beg-step5")}
                className="w-full h-11 rounded-xl text-sm font-semibold transition-all"
                style={{ background: C.bg, color: C.textBody, border: `1.5px solid ${C.line}` }}>
                ← 이전 단계로 돌아가기
              </button>
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

export { BegStep1, BegStep2, BegStep3, BegStep4, BegStep5, BegResult, BegDetail };
