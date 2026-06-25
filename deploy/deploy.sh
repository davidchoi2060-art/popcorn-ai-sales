#!/usr/bin/env bash
# popcorn-ai-sales 배포 스크립트
# 우분투 서버에서 실행: git pull → 프론트 빌드(dist) → API(pm2) 재시작 → 검증.
# nginx default 사이트가 app/dist 를 서빙하고 /api 를 pm2 popcorn-api(:3000)로 프록시한다.
set -euo pipefail

REPO="${POPCORN_REPO:-/srv/projects/popcorn-ai-sales}"
PM2_APP="${POPCORN_PM2_APP:-popcorn-api}"
BRANCH="${POPCORN_BRANCH:-main}"

cd "$REPO"
echo "[deploy] 1/5 git pull ($BRANCH)..."
git pull origin "$BRANCH"

cd "$REPO/app"
echo "[deploy] 2/5 npm install..."
npm install --no-audit --no-fund

echo "[deploy] 3/5 build (vite -> dist)..."
npm run build

echo "[deploy] 4/5 restart API (pm2: $PM2_APP)..."
pm2 restart "$PM2_APP" --update-env

echo "[deploy] 5/5 verify (via nginx :80)..."
sleep 2
health=$(curl -s -m 8 http://127.0.0.1/api/dev/health | grep -o '"ok":[a-z]*' | head -1 || true)
code=$(curl -s -m 8 -o /dev/null -w '%{http_code}' -X PUT http://127.0.0.1/api/admin/operators/0/invite/resend || true)
bundle=$(curl -s -m 8 http://127.0.0.1/ | grep -o 'index-[A-Za-z0-9]*\.js' | head -1 || true)
echo "[deploy]   health        : ${health:-unknown}   (ok:true 면 DB 연결 정상)"
echo "[deploy]   resend route  : HTTP ${code:-?}   (401=정상 배포, 404=구버전)"
echo "[deploy]   served bundle : ${bundle:-unknown}"
echo "[deploy] DONE -> http://100.123.164.85/ (LAN: http://192.168.0.20/)"
