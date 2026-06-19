코딩을 잘 모르셔도 따라 하실 수 있도록 명령어와 그 의미를 함께 적었습니다. 다만 서버 작업은 실수 시 영향이 크므로, 실제 실행은 개발자(또는 Codex의 안내)와 함께 진행하시길 권합니다.

---

# 10. 인프라 & 서버 설정 + 배포 절차서

**파일 경로:** `_docs/10_infra-deploy.md`
**설정 파일 위치:** `deploy/`
**인프라:** Ubuntu 24.04 LTS · Nginx · PostgreSQL · Node.js · PM2
**선행 문서:** `02_file-list.md`, `06_db-erd.md`, `08_architecture.md`

## 1. 전체 배포 그림

작업 흐름은 "로컬 PC에서 개발·검증 → Git에 올림 → 개발 서버에서 받아 실행"이다. 로컬에서 Codex로 코드를 만들고 Mock 모드로 검증한 뒤, GitHub에 push하면, Ubuntu 개발 서버에서 pull 받아 Nginx + PM2로 구동하는 구조다. Nginx는 정적 화면을 직접 서빙하고 `/api` 요청만 Node.js로 넘긴다.

```
[로컬 PC] 개발·Mock검증 ──git push──> [GitHub]
                                         │ git pull
                                         ▼
[Ubuntu 개발서버] Nginx(정적+프록시) → Node.js(PM2) → PostgreSQL
```

## 2. 서버 사전 준비 (최초 1회)

개발 서버에 접속한 뒤 필요한 소프트웨어를 설치한다. 각 명령은 패키지 설치를 의미한다.

```bash
sudo apt update && sudo apt upgrade -y          # 시스템 최신화
sudo apt install -y nginx postgresql git        # 웹서버·DB·Git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs                       # Node.js 20
sudo npm install -g pm2                           # 프로세스 관리자
```

설치 확인은 `node -v`, `nginx -v`, `psql --version`, `pm2 -v`로 버전이 출력되면 정상이다.

## 3. PostgreSQL 설정

DB와 사용자를 만든다. 명세서의 DB명은 `popcorn_pc`다.

```bash
sudo -u postgres psql
```
psql 안에서:
```sql
CREATE DATABASE popcorn_pc;
CREATE USER popcorn_app WITH PASSWORD '여기에_강력한_비밀번호';
GRANT ALL PRIVILEGES ON DATABASE popcorn_pc TO popcorn_app;
\c popcorn_pc
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- 키워드 검색 인덱스용
\q
```

이후 `app/db/migrations/`의 SQL을 순서대로 실행해 테이블을 만들고, `_mock/products-seed.csv`로 초기 상품을 적재한다. dev_index 명세에 나온 "Show all databases" 가이드는 DB 연결 예외 시 안내용이며, 위처럼 DB가 정상 생성되면 인디케이터가 청색(ONLINE)으로 표시된다.

## 4. 환경 변수(.env) 보안 설정

API Key 등 민감 정보는 `app/.env`에만 두고 절대 Git에 올리지 않는다(`.gitignore`에 포함). `app/.env.example`을 복사해 실제 값을 채운다.

```bash
# app/.env.example  (키 값은 비워서 커밋, 실제 .env는 서버에서만 채움)
NODE_ENV=production
PORT=3000
PGHOST=127.0.0.1
PGPORT=5433
PGDATABASE=popcorn_pc
PGUSER=postgres
PGPASSWORD=
GEMINI_API_KEY=
OPENAI_API_KEY=
CLAUDE_API_KEY=
USE_MOCK=true                 # 운영 안정화 전까지 Mock 유지 권장
DAILY_COST_LIMIT_USD=50       # Circuit Breaker 임계치
DEV_TOOLS_ENABLED=false       # 운영에선 개발 전용 API 비활성화
```

`USE_MOCK=true`를 유지하면 실제 키 없이도 전체가 동작하므로, 키 발급 전이나 비용 점검 중에도 안전하게 시연할 수 있다.

## 5. Nginx 설정 (deploy/nginx.conf)

Nginx는 개발본에서 빌드된 React SPA 정적 산출물을 직접 서빙하고 `/api`만 Node.js(3000포트)로 프록시한다. 아래 예시는 빌드 산출물을 `app/dist/`에 두는 기준이다.

```nginx
server {
    listen 80;
    server_name dev.popcorn-pc.example;     # 실제 도메인/IP로 교체

    root /var/www/popcorn-ai-sales/app/dist;
    index index.html;

    # React SPA 정적 화면 서빙
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API는 Node.js로 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 15s;             # LLM 7초+여유
    }

    # 개발 게이트(dev-hub)는 SPA 내부 화면이므로 운영 시 앱/서버 레벨 접근 제한 권장
}
```
설정 후 `sudo nginx -t`(문법 검사) → `sudo systemctl reload nginx`로 적용한다.

## 6. 백엔드 실행 (PM2)

PM2로 Node.js를 상시 구동하고, 서버 재부팅 시 자동 시작되게 한다. `deploy/ecosystem.config.js`에 설정을 둔다.

```js
module.exports = {
  apps: [{
    name: "popcorn-api",
    script: "app/server/server.js",
    instances: 1,                 // 트래픽 증가 시 "max"로 다중화
    env: { NODE_ENV: "production" },
    max_memory_restart: "500M"
  }]
};
```
```bash
pm2 start deploy/ecosystem.config.js   # 시작
pm2 save && pm2 startup                 # 재부팅 자동 시작 등록
pm2 logs popcorn-api                    # 로그 확인
```

## 7. 배포 스크립트 (deploy/deploy.sh)

코드 갱신을 한 번에 반영하는 스크립트다. 기획자도 개발자가 만들어둔 이 스크립트만 실행하면 배포된다.

```bash
#!/bin/bash
set -e
cd /var/www/popcorn-ai-system
echo "1) 최신 코드 받기"; git pull origin main
echo "2) 의존성 설치";   cd app && npm install
echo "3) 프론트 빌드";   npm run build
echo "4) DB 마이그레이션"; npm run migrate   # 신규 테이블 반영
echo "5) 백엔드 재시작"; pm2 reload popcorn-api
echo "6) Nginx 재적용";  sudo nginx -t && sudo systemctl reload nginx
echo "배포 완료. dev_index에서 상태를 확인하세요."
```
실행은 `bash deploy/deploy.sh` 한 줄이다.

## 8. 단방향 이관과 배포의 연결

정적 원본(`_publish/`)은 디자인/와이어프레임 원본 보존용이므로 운영 서버에서 직접 수정하지 않는다. 서버가 서빙하는 것은 `_publish` React 앱을 기준으로 `app`에 편입하고 로직 결합까지 끝낸 빌드 산출물이다. 따라서 배포 전 반드시 `_publish` React 앱 → `app` 개발본 이관이 완료되고, 화면 ID/Screen 키/컴포넌트 매핑에 상태가 기록돼야 한다. `dev-hub`의 진척도 매트릭스에서 각 화면이 "개발 서버 배포 완료(Nginx)" 상태가 되면 배포가 확인된다.

## 9. 보안 체크 (배포 전 필수)

다음을 반드시 확인한다. `.env`가 Git에 올라가지 않았는가(`git status`로 확인), API Key가 소스·프론트에 평문으로 없는가, `DEV_TOOLS_ENABLED=false`로 개발 전용 API가 막혔는가, dev_index 게이트가 외부에 무방비 노출되지 않았는가(IP 제한 권장), HTTPS 적용 계획이 있는가(운영 전 Let's Encrypt 등으로 인증서 적용 권장). 운영 단계에서는 방화벽(ufw)으로 필요한 포트(80/443)만 열고 3000포트는 외부 차단한다.

## 10. 장애 시 빠른 점검

화면이 안 뜨면 `sudo systemctl status nginx`로 Nginx, `pm2 status`로 백엔드 상태를 본다. SPA 새로고침 시 404가 나면 Nginx의 `try_files $uri $uri/ /index.html;` 설정을 확인한다. API가 500을 내면 `pm2 logs popcorn-api`로 에러를 확인한다. DB 연결 실패는 서버 프로세스의 `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`와 PostgreSQL 구동 상태(`sudo systemctl status postgresql`)를 점검한다. `dev-hub`의 인프라 상태 바(로컬 DB·서버 DB·Nginx)가 이 상태들을 시각화하므로 1차 점검에 활용한다. 비용이 갑자기 늘면 `USE_MOCK=true`로 전환하거나 Circuit Breaker 임계치를 낮춘다.

---

15단계 산출물이 완성되었습니다. 서버 준비부터 PostgreSQL·환경변수 보안·Nginx 프록시·PM2 구동·원클릭 배포 스크립트·보안 체크·장애 점검까지, 명령어와 의미를 함께 담아 정리했습니다. 특히 `USE_MOCK=true` 기본 유지로 키 없이도 안전하게 배포·시연할 수 있게 했고, 단방향 이관이 배포와 어떻게 연결되는지 명확히 했습니다.
