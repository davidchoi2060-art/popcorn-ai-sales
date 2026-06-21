import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  fetchAdminMarginPolicies,
  updateAdminMarginPolicies,
  type AdminMarginPolicyRow,
} from "../../api/admin";
import { C } from "../../constants/design";
import { AdminLayout } from "../../layouts/AppLayouts";
import type { Screen } from "../../types";

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

function money(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function rate(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return `${value > 0 ? "+" : ""}${value}%`;
}

function qualityColor(quality: string) {
  if (quality === "원가기준") {
    return { bg: "#e8f5e9", color: C.success };
  }

  if (quality === "판매가기준") {
    return { bg: "#fff8e1", color: C.warning };
  }

  return { bg: "#fdecea", color: C.error };
}

function suggestedPrice(item: AdminMarginPolicyRow) {
  if (!item.avgPurchasePrice) {
    return null;
  }

  return Math.round((item.avgPurchasePrice * (1 + (item.baseMarginRate + item.extraMarginRate) / 100)) / 100) * 100;
}

function previewDelta(item: AdminMarginPolicyRow) {
  const suggested = suggestedPrice(item);
  if (!suggested || !item.avgSalePrice) {
    return null;
  }

  return Number((((suggested - item.avgSalePrice) / item.avgSalePrice) * 100).toFixed(1));
}

export function AdmPricePolicy({ navigate }: { navigate: (s: Screen) => void }) {
  const [items, setItems] = useState<AdminMarginPolicyRow[]>([]);
  const [summary, setSummary] = useState({
    productCount: 0,
    purchaseCount: 0,
    saleCount: 0,
    warningCount: 0,
    purchaseCoverageRate: 0,
    saleCoverageRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let ignore = false;

    async function loadPolicies() {
      setLoading(true);
      setError("");

      const result = await fetchAdminMarginPolicies();

      if (ignore) {
        return;
      }

      if (result.success) {
        setItems(result.data.items);
        setSummary(result.data.summary);
      } else {
        setError(result.error.message);
      }

      setLoading(false);
    }

    loadPolicies();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === "warning") {
      return items.filter(item => item.quality !== "원가기준" && item.quality !== "판매가기준");
    }

    if (filter === "active") {
      return items.filter(item => item.active);
    }

    return items;
  }, [filter, items]);

  const setPolicy = (category: string, patch: Partial<AdminMarginPolicyRow>) => {
    setItems(prev => prev.map(item => item.category === category ? { ...item, ...patch } : item));
    setSaved(false);
  };

  async function savePolicies() {
    setSaving(true);
    setError("");
    setSaved(false);

    const result = await updateAdminMarginPolicies(items.map(item => ({
      category: item.category,
      baseMarginRate: item.baseMarginRate,
      extraMarginRate: item.extraMarginRate,
      active: item.active,
    })));

    if (result.success) {
      setItems(result.data.items);
      setSummary(result.data.summary);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } else {
      setError(result.error.message);
    }

    setSaving(false);
  }

  return (
    <AdminLayout current="adm-price-policy" navigate={navigate} breadcrumb="가격 정책">
      <AdminPageHeader
        title="가격 정책 및 카테고리 마진"
        sub="상품 마스터의 최신 가격을 기준으로 카테고리별 목표 마진과 적용 대상을 관리합니다."
      >
        <button
          onClick={() => navigate("adm-product-master")}
          className="px-4 h-9 rounded-lg text-sm font-semibold"
          style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}
        >
          상품 마스터
        </button>
      </AdminPageHeader>

      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {[
          ["전체 상품", `${summary.productCount.toLocaleString("ko-KR")}개`],
          ["원가 채움률", `${summary.purchaseCoverageRate}%`],
          ["판매가 채움률", `${summary.saleCoverageRate}%`],
          ["검수 카테고리", `${summary.warningCount.toLocaleString("ko-KR")}개`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <p className="text-xs mb-1" style={{ color: C.textSub }}>{label}</p>
            <p className="text-2xl font-black" style={{ color: C.textStrong }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: C.textStrong }}>정책 기준</h2>
            <p className="text-xs mt-1" style={{ color: C.textSub }}>
              권장 판매가는 평균 매입가에 목표 마진율을 더한 미리보기입니다. 실제 상품 가격은 이 화면에서 변경하지 않습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
              <option value="all">전체</option>
              <option value="active">적용 카테고리</option>
              <option value="warning">검수 필요</option>
            </select>
            <button onClick={savePolicies} disabled={saving || loading}
              className="h-9 px-5 rounded-lg text-sm font-bold text-white disabled:opacity-50"
              style={{ background: C.primary }}>
              {saving ? "저장 중" : "정책 저장"}
            </button>
          </div>
        </div>
        {error && <p className="text-sm mt-3" style={{ color: C.error }}>{error}</p>}
        {saved && <p className="text-sm mt-3" style={{ color: C.success }}>가격 정책이 저장되었습니다.</p>}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}`, background: C.surface }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg, borderBottom: `2px solid ${C.line}` }}>
              {["카테고리", "상품수", "가격 품질", "평균 매입가", "평균 판매가", "현재 마크업", "기본", "추가", "권장 판매가", "변동", "적용"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-xs" style={{ color: C.textSub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center" style={{ color: C.textSub }}>
                  가격 정책 데이터를 불러오는 중입니다.
                </td>
              </tr>
            )}
            {!loading && filteredItems.map(item => {
              const qc = qualityColor(item.quality);
              const currentSuggestedPrice = suggestedPrice(item);
              const currentPreviewDelta = previewDelta(item);
              return (
                <tr key={item.category} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="px-4 py-3">
                    <p className="font-semibold" style={{ color: C.textBody }}>{item.categoryLabel}</p>
                    <p className="text-xs font-mono" style={{ color: C.textSub }}>{item.category}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: C.textBody }}>
                    {item.productCount.toLocaleString("ko-KR")}
                    <p className="text-xs" style={{ color: C.textSub }}>판매가 {item.saleCount.toLocaleString("ko-KR")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: qc.bg, color: qc.color }}>
                      {item.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: C.textBody }}>{money(item.avgPurchasePrice)}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: C.primary }}>{money(item.avgSalePrice)}</td>
                  <td className="px-4 py-3" style={{ color: C.textBody }}>{rate(item.avgMarkupRate)}</td>
                  <td className="px-4 py-3">
                    <input type="number" min={0} max={80} value={item.baseMarginRate}
                      onChange={e => setPolicy(item.category, { baseMarginRate: Number(e.target.value), targetMarginRate: Number(e.target.value) + item.extraMarginRate })}
                      className="w-16 h-8 px-2 rounded text-sm" style={{ border: `1px solid ${C.line}` }} />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min={0} max={30} value={item.extraMarginRate}
                      onChange={e => setPolicy(item.category, { extraMarginRate: Number(e.target.value), targetMarginRate: item.baseMarginRate + Number(e.target.value) })}
                      className="w-16 h-8 px-2 rounded text-sm" style={{ border: `1px solid ${C.line}` }} />
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: C.textBody }}>{money(currentSuggestedPrice)}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: (currentPreviewDelta ?? 0) > 0 ? C.error : C.success }}>
                    {rate(currentPreviewDelta)}
                  </td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={item.active} onChange={e => setPolicy(item.category, { active: e.target.checked })}
                      style={{ accentColor: C.primary }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
