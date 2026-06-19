import type React from "react";
import { useEffect, useState, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { Screen } from "../../types";
import { fetchAdminProducts, type AdminProductRow } from "../../api/admin";
import { C, btn } from "../../constants/design";
import { AdminLayout } from "../../layouts/AppLayouts";
import { Card } from "../../components/common/Primitives";
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

export function AdmDashboard({ navigate }: { navigate: (s: Screen) => void }) {
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
const PRODUCTS_DUMMY: AdminProductRow[] = [
  { code: "101268", name: "AMD 라이젠 R5 7600X", cat: "CPU", maker: "AMD", status: "판매중", price: "248,000원", aiField: "완료" },
  { code: "204455", name: "RTX 4060 WHITE 8GB", cat: "그래픽카드", maker: "NVIDIA", status: "판매중", price: "438,000원", aiField: "일부누락" },
  { code: "300112", name: "시소닉 850W 80+ Gold", cat: "파워", maker: "Seasonic", status: "품절", price: "119,000원", aiField: "완료" },
  { code: "401233", name: "삼성 DDR5 32GB 듀얼", cat: "메모리", maker: "Samsung", status: "판매중", price: "118,000원", aiField: "완료" },
  { code: "502881", name: "리안리 O11 Dynamic EVO", cat: "케이스", maker: "Lian Li", status: "판매중", price: "178,000원", aiField: "검증필요" },
  { code: "603014", name: "ASUS ROG B650-A WiFi", cat: "메인보드", maker: "ASUS", status: "단종", price: "178,000원", aiField: "완료" },
];

const PRODUCT_PAGE_SIZE = 50;

export function AdmProductMaster({ navigate }: { navigate: (s: Screen) => void }) {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [maker, setMaker] = useState("");
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState<AdminProductRow[]>(PRODUCTS_DUMMY);
  const [total, setTotal] = useState(PRODUCTS_DUMMY.length);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
  const totalPages = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  const pageStart = Math.max(1, Math.min(page - 2, Math.max(1, totalPages - 4)));
  const pageButtons = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => pageStart + index,
  );

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      const result = await fetchAdminProducts({
        category,
        status,
        maker,
        keyword,
        page: String(page),
        limit: String(PRODUCT_PAGE_SIZE),
      });

      if (ignore) {
        return;
      }

      if (result.success) {
        setProducts(result.data.items);
        setTotal(result.data.total);
      } else {
        setProducts([]);
        setTotal(0);
        setError(result.error.message);
      }

      setLoading(false);
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [category, status, maker, keyword, page]);

  const editTarget = products.find(p => p.code === editCode);

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
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 120 }}>
            <option value="">카테고리 전체</option>
            {["CPU", "그래픽카드", "메모리", "SSD", "메인보드", "파워", "케이스", "쿨러"].map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 100 }}>
            <option value="">상태 전체</option>
            {["판매중", "품절", "단종", "삭제대기"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={maker} onChange={e => { setMaker(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 120 }}>
            <option value="">제조사 전체</option>
            {["AMD", "NVIDIA", "Intel", "Samsung", "ASUS", "Seasonic"].map(m => <option key={m}>{m}</option>)}
          </select>
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} placeholder="상품명, 모델명, RTX, Ryzen..."
            className="flex-1 h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 200 }} />
          <button onClick={() => { setKeyword(keyword.trim()); setPage(1); }} className="h-10 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>검색</button>
          <button onClick={() => { setCategory(""); setStatus(""); setMaker(""); setKeyword(""); setPage(1); }} className="h-10 px-4 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>초기화</button>
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
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: C.textSub }}>
                    상품 데이터를 불러오는 중입니다.
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: C.error }}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: C.textSub }}>
                    조회된 상품이 없습니다.
                  </td>
                </tr>
              )}
              {!loading && !error && products.map((p) => {
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
            <p className="text-xs" style={{ color: C.textSub }}>
              총 {total.toLocaleString("ko-KR")}개 · {page.toLocaleString("ko-KR")} / {totalPages.toLocaleString("ko-KR")} 페이지
            </p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded text-sm disabled:opacity-40"
                style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.textBody }}>
                ◂
              </button>
              {pageButtons.map(pageNumber => (
                <button
                  key={pageNumber}
                  disabled={loading}
                  onClick={() => setPage(pageNumber)}
                  className="w-8 h-8 rounded text-sm disabled:opacity-40"
                  style={{ border: `1px solid ${C.line}`, background: pageNumber === page ? C.primary : C.surface, color: pageNumber === page ? "#fff" : C.textBody }}>
                  {pageNumber}
                </button>
              ))}
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="w-8 h-8 rounded text-sm disabled:opacity-40"
                style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.textBody }}>
                ▸
              </button>
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
export function AdmCsvImport({ navigate }: { navigate: (s: Screen) => void }) {
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

export function AdmPricePolicy({ navigate }: { navigate: (s: Screen) => void }) {
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
export function AdmRecommendWeights({ navigate }: { navigate: (s: Screen) => void }) {
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

export function AdmKeywords({ navigate }: { navigate: (s: Screen) => void }) {
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

export function AdmClickReport({ navigate }: { navigate: (s: Screen) => void }) {
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

export function AdmFunnel({ navigate }: { navigate: (s: Screen) => void }) {
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

const costLineData = [
  { time: "09:00", Gemini: 2.9, ChatGPT: 4.8, Claude: 5.9 },
  { time: "10:00", Gemini: 4.9, ChatGPT: 7.3, Claude: 9.5 },
  { time: "11:00", Gemini: 8.1, ChatGPT: 11.3, Claude: 13.0 },
  { time: "12:00", Gemini: 11.5, ChatGPT: 16.0, Claude: 18.3 },
  { time: "13:00", Gemini: 14.1, ChatGPT: 20.6, Claude: 24.4 },
  { time: "14:00", Gemini: 17.5, ChatGPT: 25.5, Claude: 30.9 },
];

export function AdmSystemLimit({ navigate }: { navigate: (s: Screen) => void }) {
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

export function AdmOperators({ navigate }: { navigate: (s: Screen) => void }) {
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


export function DevHub({ navigate }: { navigate: (s: Screen) => void }) {
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
