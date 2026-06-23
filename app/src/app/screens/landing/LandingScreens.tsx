import { useState, useRef } from "react";
import type { Screen } from "../../types";
import { C, btn } from "../../constants/design";
import { GNB, Footer } from "../../components/common/Navigation";
import { UserLayout } from "../../layouts/AppLayouts";

const POPULAR_QUOTES = [
  { rank: 1, purpose: "인기 게임", detail: "배틀그라운드 QHD", name: "RTX 4070 + R5 7600X 조합", averagePrice: "1,250,000원", views: 284, carts: 63 },
  { rank: 2, purpose: "문서·인터넷", detail: "문서·엑셀 위주", name: "내장그래픽 R5 8600G 미니PC", averagePrice: "620,000원", views: 197, carts: 42 },
  { rank: 3, purpose: "유튜브 영상 편집", detail: "4K 영상 편집", name: "RTX 4080 + R9 7950X 워크스테이션", averagePrice: "3,180,000원", views: 156, carts: 31 },
  { rank: 4, purpose: "방송·녹화·스트리밍", detail: "원컴 방송", name: "RTX 4070 Ti + i9-14900K 원컴방송", averagePrice: "2,450,000원", views: 143, carts: 27 },
  { rank: 5, purpose: "온라인 수업·화상회의", detail: "인터넷 강의", name: "RTX 4060 + R5 7500F 가성비", averagePrice: "890,000원", views: 128, carts: 24 },
];

const POPULAR_PRODUCTS = [
  { rank: 1, category: "GPU", name: "NVIDIA RTX 4070 SUPER 12GB", price: "789,000원", rise: 4, updatedAt: "2분 전" },
  { rank: 2, category: "CPU", name: "AMD 라이젠 5 7500F", price: "198,000원", rise: 2, updatedAt: "4분 전" },
  { rank: 3, category: "RAM", name: "삼성 DDR5 32GB 듀얼킷", price: "118,000원", rise: 6, updatedAt: "7분 전" },
  { rank: 4, category: "SSD", name: "SK하이닉스 Platinum P41 1TB", price: "109,000원", rise: 1, updatedAt: "9분 전" },
  { rank: 5, category: "POWER", name: "시소닉 FOCUS 850W Gold", price: "139,000원", rise: 3, updatedAt: "12분 전" },
];

function RealtimePanel() {
  const [activeTab, setActiveTab] = useState<"quotes" | "products">("quotes");

  return (
    <section style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto px-8 py-0">
        <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.line}` }}>
          <button
            type="button"
            onClick={() => setActiveTab("quotes")}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 -mb-px"
            style={{
              borderColor: activeTab === "quotes" ? C.primary : "transparent",
              color: activeTab === "quotes" ? C.primary : C.textSub,
              background: activeTab === "quotes" ? "#f8fbff" : C.surface,
            }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            실시간 인기 견적
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 -mb-px"
            style={{
              borderColor: activeTab === "products" ? C.primary : "transparent",
              color: activeTab === "products" ? C.primary : C.textSub,
              background: activeTab === "products" ? "#f8fbff" : C.surface,
            }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            실시간 인기 상품
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 pr-2 text-xs" style={{ color: C.textSub }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준 업데이트
          </div>
        </div>

        <div className="py-4" style={{ minHeight: 200 }}>
          {activeTab === "quotes" ? (
            <div className="space-y-2">
              {POPULAR_QUOTES.map((q, i) => (
                <div key={q.rank}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                  style={{ background: i === 0 ? C.primaryLight : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.primaryLight)}
                  onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? C.primaryLight : "transparent")}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: i === 0 ? C.primary : i <= 2 ? C.primaryLight : C.bg, color: i === 0 ? "#fff" : i <= 2 ? C.primary : C.textSub }}>
                    {q.rank}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: C.bg, color: C.textBody }}>주용도 {q.purpose}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: "#f8fbff", color: C.primary, border: `1px solid ${C.primaryLight}` }}>세부용도 {q.detail}</span>
                  <span className="text-sm flex-1 truncate font-medium" style={{ color: C.textBody }}>{q.name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: C.textSub }}>견적조회 {q.views}건</span>
                  <span className="text-xs flex-shrink-0" style={{ color: C.textSub }}>장바구니 {q.carts}건</span>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: C.primary }}>평균금액 {q.averagePrice}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {POPULAR_PRODUCTS.map((p, i) => (
                <div key={p.rank}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                  style={{ background: i === 0 ? C.primaryLight : "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.primaryLight)}
                  onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? C.primaryLight : "transparent")}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: i === 0 ? C.primary : i <= 2 ? C.primaryLight : C.bg, color: i === 0 ? "#fff" : i <= 2 ? C.primary : C.textSub }}>
                    {p.rank}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{ background: C.bg, color: C.textBody }}>카테고리 {p.category}</span>
                  <span className="text-sm flex-1 truncate font-medium" style={{ color: C.textBody }}>{p.name}</span>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: C.primary }}>{p.price}</span>
                  <span className="text-xs font-semibold flex-shrink-0 px-1.5 py-0.5 rounded"
                    style={{ color: C.success, background: "#e8f5e9" }}>순위 +{p.rise}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: C.textSub }}>업데이트 {p.updatedAt}</span>
                </div>
              ))}
            </div>
          )}
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
export function Landing({ navigate }: { navigate: (s: Screen) => void }) {
  const [hovered, setHovered] = useState<"beg" | "exp" | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { icon: "💬", title: "용도·예산 입력", desc: "게임용, 사무용, 영상편집 등 목적과 예산만 알려주세요. 부품 지식은 전혀 필요 없습니다." },
    { icon: "🖥️", title: "모니터 취향 선택", desc: "FHD·QHD·4K와 평면·커브드 중 고르면 그래픽카드 성능 여유까지 함께 맞춥니다." },
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
                    "5단계 쉬운 입력 → 즉시 결과",
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
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.primary }}>간단한 5단계</p>
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
export function AuthModal({ navigate }: { navigate: (s: Screen) => void }) {
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
