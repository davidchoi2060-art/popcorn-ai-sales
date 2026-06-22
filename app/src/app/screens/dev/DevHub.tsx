import { useEffect, useMemo, useState } from "react";
import { fetchDevHealth, type DevHealthResponse } from "../../api/admin";
import { C } from "../../constants/design";
import type { Screen } from "../../types";

const quickLinks: Array<{ label: string; screen: Screen; desc: string; tone: string }> = [
  { label: "초급자 플로우", screen: "beg-step1", desc: "용도부터 추천 결과까지 점검", tone: "#7b1fa2" },
  { label: "상품 마스터", screen: "adm-product-master", desc: "DB 상품/카테고리/편집 저장", tone: C.primary },
  { label: "가격 정책", screen: "adm-price-policy", desc: "마진 정책과 가격 품질", tone: "#10a37f" },
  { label: "추천 가중치", screen: "adm-recommend-weights", desc: "재고·마진·가성비 비율", tone: "#f59e0b" },
  { label: "시스템 제한", screen: "adm-system-limit", desc: "비용·Rate Limit 제어", tone: "#d32f2f" },
  { label: "관리자 대시보드", screen: "adm-dashboard", desc: "운영 지표 진입점", tone: "#455a64" },
];

const matrix: Array<{ id: string; screen: Screen; comp: string; status: "완료" | "검증" | "진행" }> = [
  { id: "FR-BEG", screen: "beg-step1", comp: "BeginnerScreens", status: "검증" },
  { id: "ADM-PRD", screen: "adm-product-master", comp: "AdmProductMaster", status: "완료" },
  { id: "ADM-POL", screen: "adm-price-policy", comp: "AdmPricePolicy", status: "완료" },
  { id: "ADM-WGT", screen: "adm-recommend-weights", comp: "AdmRecommendWeights", status: "진행" },
  { id: "ADM-SYS", screen: "adm-system-limit", comp: "AdmSystemLimit", status: "진행" },
  { id: "DEV-HUB", screen: "dev-hub", comp: "DevHub", status: "검증" },
];

const checklist = [
  "API 서버 3000 포트와 Vite 5173 포트 분리 확인",
  "DB 환경변수 PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD 확인",
  "상품 카테고리 목록에 식별불가 포함 확인",
  "상품 편집 저장 후 목록 갱신 확인",
  "가격 정책 저장 후 권장 판매가 미리보기 확인",
  "초급자 모니터 제외와 이전 단계 이동 확인",
];

function statusColor(ok: boolean) {
  return ok
    ? { dot: "#22c55e", text: "#86efac", label: "ONLINE" }
    : { dot: C.error, text: "#fca5a5", label: "OFFLINE" };
}

function badge(status: string) {
  if (status === "완료") return { bg: "#e8f5e9", color: C.success };
  if (status === "검증") return { bg: C.primaryLight, color: C.primary };
  return { bg: "#fff8e1", color: C.warning };
}

function numberText(value?: number) {
  return typeof value === "number" ? value.toLocaleString("ko-KR") : "-";
}

export function DevHub({ navigate }: { navigate: (s: Screen) => void }) {
  const [health, setHealth] = useState<DevHealthResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadHealth() {
    const result = await fetchDevHealth();
    if (result.success) {
      setHealth(result.data);
      setError("");
    } else {
      setHealth(null);
      setError(result.error.message);
    }
  }

  useEffect(() => {
    loadHealth();
    const timer = window.setInterval(loadHealth, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const infra = useMemo(() => {
    const apiOk = Boolean(health?.api?.ok);
    const dbOk = Boolean(health?.db?.ok);
    const productOk = Boolean(health?.products?.ok);
    const policyOk = Boolean(health?.policies?.ok);
    return [
      { label: "API", ok: apiOk, sub: health ? `:${health.api.port}` : "대기" },
      { label: "DB", ok: dbOk, sub: health ? `${health.db.host}:${health.db.port}` : "대기" },
      { label: "상품 DB", ok: productOk, sub: health?.products?.latencyMs ? `${health.products.latencyMs}ms` : "대기" },
      { label: "가격정책", ok: policyOk, sub: health?.policies?.latencyMs ? `${health.policies.latencyMs}ms` : "대기" },
      { label: "Mock", ok: health?.api?.mockMode !== "real", sub: health?.api?.mockMode ?? "대기" },
    ];
  }, [health]);

  const copyEnv = async () => {
    const text = [
      'export PGHOST="100.123.164.85"',
      'export PGPORT="5433"',
      'export PGDATABASE="popcorn_pc"',
      'export PGUSER="postgres"',
      'export PGPASSWORD="DB비밀번호"',
      "npm run server",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      <div style={{ background: "#080e1c", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">팝콘PC AI 개발 허브</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              로컬 개발 서버, DB 연결, 상품 마스터, 가격정책, 초급자 플로우를 한 곳에서 점검합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("landing")} className="h-9 px-4 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.12)" }}>
              랜딩
            </button>
            <button onClick={() => navigate("adm-dashboard")} className="h-9 px-4 rounded-lg text-sm font-semibold text-white"
              style={{ background: C.primary }}>
              관리자
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-6 flex-wrap">
          {infra.map(item => {
            const color = statusColor(item.ok);
            return (
              <div key={item.label} className="flex items-center gap-1.5 text-sm">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color.dot, display: "inline-block" }} />
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{item.label}</span>
                <span className="font-semibold" style={{ color: color.text }}>{color.label}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{item.sub}</span>
              </div>
            );
          })}
          <button onClick={loadHealth} className="ml-auto h-8 px-3 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
            새로고침
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {error && (
          <div className="rounded-xl p-4" style={{ background: "#fdecea", color: C.error, border: `1px solid ${C.error}33` }}>
            API 상태를 읽지 못했습니다. API 서버가 실행 중인지 확인하세요. {error}
          </div>
        )}

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          {[
            ["상품 수", numberText(health?.products?.data?.total), "products"],
            ["카테고리", numberText(health?.products?.data?.categories), "part_type"],
            ["식별불가", numberText(health?.products?.data?.unknown), "UNKNOWN"],
            ["검수필요", numberText(health?.products?.data?.review_required), "review_required"],
          ].map(([label, value, sub]) => (
            <div key={label} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <p className="text-xs mb-1" style={{ color: C.textSub }}>{label}</p>
              <p className="text-2xl font-black" style={{ color: C.textStrong }}>{value}</p>
              <p className="text-xs mt-1 font-mono" style={{ color: C.textSub }}>{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 360px" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
              <h2 className="text-base font-bold" style={{ color: C.textStrong }}>빠른 이동</h2>
              <p className="text-xs mt-1" style={{ color: C.textSub }}>최근 작업한 화면과 검수 포인트로 바로 이동합니다.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 p-5">
              {quickLinks.map(link => (
                <button key={link.screen} onClick={() => navigate(link.screen)}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{ background: `${link.tone}10`, border: `1.5px solid ${link.tone}33` }}>
                  <p className="text-sm font-bold" style={{ color: link.tone }}>{link.label}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: C.textSub }}>{link.desc}</p>
                  <p className="text-xs mt-3 font-mono" style={{ color: C.textSub }}>{link.screen}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <h2 className="text-base font-bold mb-3" style={{ color: C.textStrong }}>DB 실행 메모</h2>
            <div className="space-y-2 text-xs font-mono" style={{ color: C.textBody }}>
              <p>cd /srv/projects/popcorn-ai-sales/app</p>
              <p>export PGHOST=100.123.164.85</p>
              <p>export PGPORT=5433</p>
              <p>npm run server</p>
            </div>
            <button onClick={copyEnv} className="w-full h-9 rounded-lg text-xs font-semibold mt-4"
              style={{ background: C.primaryLight, color: C.primary }}>
              {copied ? "복사됨" : "실행 메모 복사"}
            </button>
            {!health?.db?.ok && (
              <div className="mt-4 rounded-lg p-3 text-xs" style={{ background: "#fdecea", color: C.error }}>
                DB 연결 실패 시 PGPASSWORD와 PostgreSQL 포트, 기존 3000번 프로세스를 확인하세요.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
              <h2 className="text-base font-bold" style={{ color: C.textStrong }}>화면 진척도</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
                  {["ID", "Screen", "Component", "상태"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: C.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(row => {
                  const b = badge(row.status);
                  return (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: C.textSub }}>{row.id}</td>
                      <td className="px-4 py-2.5 font-mono text-xs" style={{ color: C.textBody }}>{row.screen}</td>
                      <td className="px-4 py-2.5 text-xs" style={{ color: C.textSub }}>{row.comp}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.color }}>{row.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <h2 className="text-base font-bold mb-4" style={{ color: C.textStrong }}>오늘 검수 체크리스트</h2>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" style={{ accentColor: C.primary }} />
                  <span style={{ color: C.textBody }}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
