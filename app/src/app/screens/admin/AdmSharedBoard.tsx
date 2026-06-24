import { useEffect, useMemo, useState } from "react";
import type { Screen } from "../../types";
import { C, btn } from "../../constants/design";
import { AdminLayout } from "../../layouts/AppLayouts";
import {
  createAdminChangeRequest,
  fetchAdminChangeRequests,
  updateAdminChangeRequestStatus,
  type AdminChangeRequest,
  type AdminChangeRequestStatus,
} from "../../api/admin";

const STATUSES: AdminChangeRequestStatus[] = ["등록", "접수", "처리중", "완료", "보류", "폐기"];

const STATUS_STYLE: Record<AdminChangeRequestStatus, { bg: string; color: string }> = {
  등록: { bg: "#eef4ff", color: C.primary },
  접수: { bg: "#fff8e1", color: C.warning },
  처리중: { bg: "#e6f2fc", color: C.primary },
  완료: { bg: "#e8f5e9", color: C.success },
  보류: { bg: "#f5f5f5", color: C.textSub },
  폐기: { bg: "#fdecea", color: C.error },
};

export function AdmSharedBoard({ navigate }: { navigate: (s: Screen) => void }) {
  const [items, setItems] = useState<AdminChangeRequest[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => ({
    total: items.length,
    open: items.filter(item => ["등록", "접수", "처리중"].includes(item.status)).length,
    done: items.filter(item => item.status === "완료").length,
    held: items.filter(item => ["보류", "폐기"].includes(item.status)).length,
  }), [items]);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    const response = await fetchAdminChangeRequests();
    if (response.success) {
      setItems(response.data.items);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const submitRequest = async () => {
    setSaving(true);
    setError("");
    const response = await createAdminChangeRequest(content);
    setSaving(false);
    if (!response.success) {
      setError(response.error.message);
      return;
    }
    setItems(prev => [response.data, ...prev]);
    setContent("");
  };

  const changeStatus = async (id: number, status: AdminChangeRequestStatus) => {
    setError("");
    const response = await updateAdminChangeRequestStatus(id, status);
    if (!response.success) {
      setError(response.error.message);
      return;
    }
    setItems(prev => prev.map(item => item.id === id ? response.data : item));
  };

  return (
    <AdminLayout current="adm-board" navigate={navigate} breadcrumb="공유게시판">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: C.textStrong }}>공유게시판</h1>
          <p className="text-sm mt-1" style={{ color: C.textSub }}>
            시스템 변경요청사항을 등록하고 처리상태를 함께 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={loadItems}
          className="h-10 px-4 rounded-md text-sm font-semibold"
          style={{ border: `1px solid ${C.line}`, background: C.surface, color: C.textBody }}
        >
          새로고침
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md px-4 py-3 text-sm" style={{ background: "#fdecea", color: C.error, border: `1px solid ${C.error}33` }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "전체 요청", value: summary.total, color: C.primary },
          { label: "진행 대상", value: summary.open, color: C.warning },
          { label: "완료", value: summary.done, color: C.success },
          { label: "보류/폐기", value: summary.held, color: C.textSub },
        ].map(card => (
          <div key={card.label} className="rounded-lg p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <p className="text-xs font-semibold" style={{ color: C.textSub }}>{card.label}</p>
            <p className="text-2xl font-black mt-1" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-lg p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <h2 className="text-base font-bold mb-3" style={{ color: C.textStrong }}>변경요청사항 등록</h2>
        <textarea
          value={content}
          onChange={event => setContent(event.target.value)}
          className="w-full min-h-28 rounded-md p-3 text-sm resize-y"
          style={{ border: `1px solid ${C.line}`, outline: "none", color: C.textBody }}
          placeholder="예: 관리자 상품 마스터에 제조사별 필터를 추가해주세요."
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: C.textSub }}>{content.trim().length}/2000</span>
          <button
            type="button"
            disabled={saving || content.trim().length < 5}
            onClick={submitRequest}
            className={btn.primary}
            style={{ background: saving || content.trim().length < 5 ? "#b9c8d6" : C.primary }}
          >
            {saving ? "등록 중" : "요청 등록"}
          </button>
        </div>
      </section>

      <section className="rounded-lg overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.line}` }}>
          <h2 className="text-base font-bold" style={{ color: C.textStrong }}>요청 목록</h2>
          {loading && <span className="text-xs" style={{ color: C.textSub }}>불러오는 중</span>}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
              {["등록일", "등록자", "요청사항", "처리상태", "변경일자"].map(header => (
                <th key={header} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: C.textSub }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: C.textSub }}>
                  등록된 변경요청사항이 없습니다.
                </td>
              </tr>
            )}
            {items.map(item => {
              const tone = STATUS_STYLE[item.status];
              return (
                <tr key={item.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td className="px-5 py-4 whitespace-nowrap text-xs" style={{ color: C.textSub }}>{item.createdAt}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-semibold" style={{ color: C.textStrong }}>{item.registrantName}</p>
                    <p className="text-xs" style={{ color: C.textSub }}>{item.registrantEmail}</p>
                  </td>
                  <td className="px-5 py-4" style={{ color: C.textBody }}>
                    <div className="max-w-2xl whitespace-pre-wrap leading-relaxed">{item.content}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: tone.bg, color: tone.color }}>
                        {item.status}
                      </span>
                      <select
                        value={item.status}
                        onChange={event => changeStatus(item.id, event.target.value as AdminChangeRequestStatus)}
                        className="h-8 rounded-md px-2 text-xs"
                        style={{ border: `1px solid ${C.line}`, color: C.textBody, background: C.surface }}
                      >
                        {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs" style={{ color: C.textSub }}>{item.updatedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
