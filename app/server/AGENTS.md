# AGENTS.md (backend)

규칙 정본은 **리포 루트 `/AGENTS.md`** 다. 작업 전 그 파일을 읽는다(여기 중복 복사하지 않는다 — 토큰 절약).

백엔드 빠른 참조:
- 진입점 `server.js` — `url.pathname.match(...)`로 라우팅. 새 엔드포인트는 여기 match + dispatch 추가.
- `routes/` = 핸들러(`success`/`failure` 래퍼, `requireAdmin`), `services/` = DB·로직(`pool.query`).
- 라우트↔서비스 매핑, recommend 흐름 순서, 응답 형식, DB 마이그레이션은 루트 `/AGENTS.md` 참고.
- 검증: `node --check <file>` + API 띄워 `curl /api/dev/health`(`db.ok:true`). DB 비번은 `PGPASSWORD` env로만.
