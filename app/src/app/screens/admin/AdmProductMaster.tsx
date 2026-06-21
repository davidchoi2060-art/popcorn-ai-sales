import { useEffect, useState } from "react";
import {
  fetchAdminProductCategories,
  fetchAdminProductDetail,
  fetchAdminProductMakers,
  fetchAdminProducts,
  updateAdminProduct,
  updateAdminProductStatus,
  type AdminProductCategoryOption,
  type AdminProductMakerOption,
  type AdminProductRow,
  type AdminProductSpec,
  type AdminProductUpdatePayload,
} from "../../api/admin";
import { C } from "../../constants/design";
import { AdminLayout } from "../../layouts/AppLayouts";
import type { Screen } from "../../types";

const PRODUCT_PAGE_SIZE = 50;
const STATUS_OPTIONS = ["판매중", "품절", "단종", "노출대기"];
const GROUP_OPTIONS = [
  { value: "core_part", label: "핵심부품" },
  { value: "peripheral", label: "주변기기" },
  { value: "cable_accessory", label: "케이블/액세서리" },
  { value: "service", label: "서비스" },
  { value: "prebuilt_pc", label: "완제품" },
  { value: "software", label: "소프트웨어" },
  { value: "internal", label: "내부관리" },
  { value: "unknown", label: "식별불가" },
];

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

function specText(spec: AdminProductSpec, key: keyof AdminProductSpec) {
  const value = spec[key];
  return typeof value === "boolean" ? "" : String(value ?? "");
}

export function AdmProductMaster({ navigate }: { navigate: (s: Screen) => void }) {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [maker, setMaker] = useState("");
  const [keyword, setKeyword] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<AdminProductCategoryOption[]>([]);
  const [makerOptions, setMakerOptions] = useState<AdminProductMakerOption[]>([]);
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editCode, setEditCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AdminProductUpdatePayload | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmCode, setConfirmCode] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE));
  const pageStart = Math.max(1, Math.min(page - 2, Math.max(1, totalPages - 4)));
  const pageButtons = Array.from({ length: Math.min(5, totalPages) }, (_, index) => pageStart + index);
  const editTarget = products.find(p => p.code === editCode);

  const statusColors: Record<string, { bg: string; color: string }> = {
    "판매중": { bg: "#e8f5e9", color: C.success },
    "품절": { bg: "#f5f5f5", color: C.textSub },
    "단종": { bg: "#fdecea", color: C.error },
    "노출대기": { bg: "#fff8e1", color: C.warning },
  };
  const aiFieldColors: Record<string, { bg: string; color: string }> = {
    "완료": { bg: "#e8f5e9", color: C.success },
    "일부누락": { bg: "#fff8e1", color: C.warning },
    "검수필요": { bg: "#fdecea", color: C.error },
  };

  useEffect(() => {
    let ignore = false;

    async function loadFilters() {
      const [categoryResult, makerResult] = await Promise.all([
        fetchAdminProductCategories(),
        fetchAdminProductMakers(),
      ]);

      if (ignore) {
        return;
      }

      if (categoryResult.success) {
        setCategoryOptions(categoryResult.data.items);
      }

      if (makerResult.success) {
        setMakerOptions(makerResult.data.items);
      }
    }

    loadFilters();

    return () => {
      ignore = true;
    };
  }, []);

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
  }, [category, status, maker, keyword, page, reloadKey]);

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      if (!editCode) {
        setEditForm(null);
        setEditError("");
        return;
      }

      setEditLoading(true);
      setEditError("");
      setSaved(false);

      const result = await fetchAdminProductDetail(editCode);

      if (ignore) {
        return;
      }

      if (result.success) {
        const { code: _code, ...form } = result.data;
        setEditForm(form);
      } else {
        setEditForm(null);
        setEditError(result.error.message);
      }

      setEditLoading(false);
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [editCode]);

  const setFormField = <K extends keyof AdminProductUpdatePayload>(key: K, value: AdminProductUpdatePayload[K]) => {
    setEditForm(prev => (prev ? { ...prev, [key]: value } : prev));
  };

  const setSpecField = <K extends keyof AdminProductSpec>(key: K, value: AdminProductSpec[K]) => {
    setEditForm(prev => (prev ? { ...prev, spec: { ...prev.spec, [key]: value } } : prev));
  };

  async function saveProduct() {
    if (!editCode || !editForm) {
      return;
    }

    setSaving(true);
    setEditError("");
    setSaved(false);

    const result = await updateAdminProduct(editCode, editForm);

    if (result.success) {
      const { code: _code, ...form } = result.data;
      setEditForm(form);
      setSaved(true);
      setReloadKey(prev => prev + 1);
      window.setTimeout(() => setSaved(false), 2000);
    } else {
      setEditError(result.error.message);
    }

    setSaving(false);
  }

  async function markOutOfStock() {
    if (!confirmCode) {
      return;
    }

    const result = await updateAdminProductStatus(confirmCode, "품절");

    if (result.success) {
      setReloadKey(prev => prev + 1);
      if (editCode === confirmCode) {
        const { code: _code, ...form } = result.data;
        setEditForm(form);
      }
    } else {
      setError(result.error.message);
    }

    setConfirmCode(null);
  }

  return (
    <AdminLayout current="adm-product-master" navigate={navigate} breadcrumb="상품 마스터">
      <AdminPageHeader
        title="상품 마스터 및 재고 제어"
        sub="상품 검색, AI 호환성 필드 수정, 품절/단종 차단을 처리합니다."
      >
        <button
          onClick={() => navigate("adm-csv-import")}
          className="px-4 h-9 rounded-lg text-sm font-semibold"
          style={{ background: C.primary, color: "#fff" }}
        >
          CSV 업서트
        </button>
      </AdminPageHeader>

      <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="flex gap-2 flex-wrap">
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 150 }}>
            <option value="">카테고리 전체</option>
            {categoryOptions.map(c => (
              <option key={`${c.group}-${c.value}`} value={c.value}>
                {c.label} ({c.count.toLocaleString("ko-KR")})
              </option>
            ))}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 110 }}>
            <option value="">상태 전체</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={maker} onChange={e => { setMaker(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 130 }}>
            <option value="">제조사 전체</option>
            {makerOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} placeholder="상품명, 모델명, RTX, Ryzen..."
            className="flex-1 h-10 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, minWidth: 200 }} />
          <button onClick={() => { setKeyword(keyword.trim()); setPage(1); }}
            className="h-10 px-5 rounded-lg text-sm font-semibold text-white" style={{ background: C.primary }}>검색</button>
          <button onClick={() => { setCategory(""); setStatus(""); setMaker(""); setKeyword(""); setPage(1); }}
            className="h-10 px-4 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>초기화</button>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: editCode ? "1fr 380px" : "1fr" }}>
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
                  <td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: C.error }}>{error}</td>
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
              <button disabled={page <= 1 || loading} onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="h-8 px-3 rounded text-xs disabled:opacity-40"
                style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.textBody }}>이전</button>
              {pageButtons.map(pageNumber => (
                <button key={pageNumber} disabled={loading} onClick={() => setPage(pageNumber)}
                  className="w-8 h-8 rounded text-sm disabled:opacity-40"
                  style={{ border: `1px solid ${C.line}`, background: pageNumber === page ? C.primary : C.surface, color: pageNumber === page ? "#fff" : C.textBody }}>
                  {pageNumber}
                </button>
              ))}
              <button disabled={page >= totalPages || loading} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 px-3 rounded text-xs disabled:opacity-40"
                style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.textBody }}>다음</button>
            </div>
          </div>
        </div>

        {editCode && editTarget && (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${C.primary}`, boxShadow: `0 4px 20px rgba(0,117,213,0.12)` }}>
            <div className="px-5 py-4" style={{ background: C.primary }}>
              <h2 className="text-sm font-bold text-white">상품 및 AI 필드 편집</h2>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.65)" }}>{editTarget.name}</p>
            </div>
            <div className="p-5 space-y-3 max-h-[68vh] overflow-y-auto" style={{ background: C.surface }}>
              {editLoading && <p className="text-sm" style={{ color: C.textSub }}>상세 정보를 불러오는 중입니다.</p>}
              {editError && <p className="text-sm" style={{ color: C.error }}>{editError}</p>}
              {!editLoading && editForm && (
                <>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>상품코드</label>
                    <input readOnly value={editCode} className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}`, background: C.bg }} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>상품명</label>
                    <input value={editForm.product_name} onChange={e => setFormField("product_name", e.target.value)}
                      className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <TextInput label="제조사" value={editForm.maker} onChange={v => setFormField("maker", v)} />
                    <TextInput label="브랜드" value={editForm.brand} onChange={v => setFormField("brand", v)} />
                  </div>
                  <TextInput label="모델명" value={editForm.model_name} onChange={v => setFormField("model_name", v)} />
                  <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>카테고리</label>
                      <select value={editForm.part_type} onChange={e => setFormField("part_type", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
                        {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>그룹</label>
                      <select value={editForm.category_group} onChange={e => setFormField("category_group", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
                        {GROUP_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>상태</label>
                      <select value={editForm.status} onChange={e => setFormField("status", e.target.value)}
                        className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <TextInput label="판매가" value={String(editForm.sale_price ?? "")} onChange={v => setFormField("sale_price", v)} />
                  </div>
                  {([
                    ["socket", "소켓"],
                    ["chipset", "칩셋"],
                    ["mem_type", "메모리 타입"],
                    ["tdp_watt", "TDP(W)"],
                    ["rated_watt", "정격출력(W)"],
                    ["required_power_watt", "권장파워(W)"],
                    ["length_mm", "길이(mm)"],
                    ["gpu_max_mm", "GPU 장착(mm)"],
                    ["cooler_height_mm", "쿨러 높이(mm)"],
                    ["pcie_gen", "PCIe"],
                    ["form_factor", "폼팩터"],
                    ["interface", "인터페이스"],
                  ] as Array<[keyof AdminProductSpec, string]>).map(([key, label]) => (
                    <TextInput key={key} label={label} value={specText(editForm.spec, key)} onChange={v => setSpecField(key, v)} />
                  ))}
                  <div>
                    <label className="text-xs font-semibold block mb-2" style={{ color: C.textSub }}>태그</label>
                    <div className="flex gap-2">
                      {[
                        ["tag_white", "화이트"],
                        ["tag_rgb", "RGB"],
                        ["tag_silent", "저소음"],
                      ].map(([key, label]) => (
                        <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editForm.spec[key as keyof AdminProductSpec])}
                            onChange={e => setSpecField(key as keyof AdminProductSpec, e.target.checked)}
                            style={{ accentColor: C.primary }}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={editForm.ai_candidate_yn} onChange={e => setFormField("ai_candidate_yn", e.target.checked)} style={{ accentColor: C.primary }} />
                    <span style={{ color: C.textBody }}>AI 추천 후보에 포함</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={editForm.review_required_yn} onChange={e => setFormField("review_required_yn", e.target.checked)} style={{ accentColor: C.primary }} />
                    <span style={{ color: C.textBody }}>운영자 검수 필요</span>
                  </label>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>검수 사유</label>
                    <textarea value={editForm.review_reason} onChange={e => setFormField("review_reason", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm min-h-20" style={{ border: `1px solid ${C.line}` }} />
                  </div>
                </>
              )}
            </div>
            <div className="px-5 py-4 flex gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
              <button onClick={saveProduct} disabled={!editForm || saving}
                className="flex-1 h-9 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: C.primary }}>
                {saving ? "저장 중" : "저장"}
              </button>
              <button onClick={() => setEditCode(null)}
                className="h-9 px-4 rounded-lg text-sm font-semibold" style={{ background: C.bg, color: C.textBody, border: `1px solid ${C.line}` }}>닫기</button>
            </div>
            {saved && <div className="mx-5 mb-4 p-3 rounded-lg text-xs text-center" style={{ background: "#e8f5e9", color: C.success }}>저장 완료</div>}
          </div>
        )}
      </div>

      {confirmCode && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-80" style={{ background: C.surface, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 className="text-base font-bold mb-2" style={{ color: C.textStrong }}>품절 처리 확인</h3>
            <p className="text-sm mb-5" style={{ color: C.textBody }}>
              해당 상품을 품절로 변경하고 추천 후보 및 스왑 목록에서 제외합니다. 계속하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmCode(null)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold" style={{ border: `1px solid ${C.line}`, color: C.textBody }}>취소</button>
              <button onClick={markOutOfStock}
                className="flex-1 h-10 rounded-lg text-sm font-bold text-white" style={{ background: C.error }}>품절 처리</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: C.textSub }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg text-sm" style={{ border: `1px solid ${C.line}` }} />
    </div>
  );
}
