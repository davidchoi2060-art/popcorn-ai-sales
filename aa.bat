@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: 기본 베이스 경로 설정
set "BASE_DIR=E:\GDRIVE\GIT\popcorn-ai-sales\apps\web\prototype-html"
set "PAGES_DIR=%BASE_DIR%\pages"
set "ASSETS_DIR=%BASE_DIR%\assets"

echo ===================================================
echo  [AI 조립 PC 추천 서비스] 프로토타입 디렉토리 및 파일 생성 시작
echo ===================================================

:: 1. 디렉토리 구조 생성
echo [1/3] 폴더 구조 생성 중...
mkdir "%PAGES_DIR%"
mkdir "%ASSETS_DIR%\css"
mkdir "%ASSETS_DIR%\js"
mkdir "%ASSETS_DIR%\images"

:: 2. 에셋 및 메인 인덱스 파일 생성
echo [2/3] 공통 에셋 및 메인 인덱스 파일 생성 중...
type nul > "%BASE_DIR%\index.html"
type nul > "%ASSETS_DIR%\css\common.css"
type nul > "%ASSETS_DIR%\js\prompt.js"

:: 3. pages 폴더 내 상세 화면 파일 생성
echo [3/3] 화면 일람에 따른 HTML 파일 생성 중...

:: User / Rec: Common / Checkout 도메인 화면들
type nul > "%PAGES_DIR%\index.html"
type nul > "%PAGES_DIR%\auth-modal.html"
type nul > "%PAGES_DIR%\loading-ai.html"
type nul > "%PAGES_DIR%\loading-search.html"
type nul > "%PAGES_DIR%\compare.html"
type nul > "%PAGES_DIR%\failure.html"
type nul > "%PAGES_DIR%\my-page.html"
type nul > "%PAGES_DIR%\cart-gateway.html"
type nul > "%PAGES_DIR%\loading-transfer.html"
type nul > "%PAGES_DIR%\step1-form.html"
type nul > "%PAGES_DIR%\step2-payment.html"
type nul > "%PAGES_DIR%\step3-complete.html"

:: Rec: Beginner (초보자 모드 화면)
type nul > "%PAGES_DIR%\beginner-step1-purpose.html"
type nul > "%PAGES_DIR%\beginner-step2-budget.html"
type nul > "%PAGES_DIR%\beginner-step3-option.html"
type nul > "%PAGES_DIR%\beginner-step4-summary.html"
type nul > "%PAGES_DIR%\beginner-result.html"
type nul > "%PAGES_DIR%\beginner-estimate-detail.html"

:: Rec: Expert (고급자 모드 화면)
type nul > "%PAGES_DIR%\expert-step1-priority.html"
type nul > "%PAGES_DIR%\expert-step2-budget.html"
type nul > "%PAGES_DIR%\expert-step3-parts.html"
type nul > "%PAGES_DIR%\expert-step4-extra.html"
type nul > "%PAGES_DIR%\expert-step5-confirm.html"
type nul > "%PAGES_DIR%\expert-result.html"
type nul > "%PAGES_DIR%\expert-custom-detail.html"

:: Admin 도메인 화면들 (관리자 페이지)
type nul > "%PAGES_DIR%\admin-core-login.html"
type nul > "%PAGES_DIR%\admin-core-dashboard.html"
type nul > "%PAGES_DIR%\admin-parts-master.html"
type nul > "%PAGES_DIR%\admin-parts-inventory.html"
type nul > "%PAGES_DIR%\admin-parts-pricing.html"
type nul > "%PAGES_DIR%\admin-parts-compatibility.html"
type nul > "%PAGES_DIR%\admin-ai-logs.html"
type nul > "%PAGES_DIR%\admin-ai-prompts.html"
type nul > "%PAGES_DIR%\admin-ai-monitoring.html"
type nul > "%PAGES_DIR%\admin-ai-ab-test.html"
type nul > "%PAGES_DIR%\admin-orders-order-list.html"
type nul > "%PAGES_DIR%\admin-orders-fulfillment.html"
type nul > "%PAGES_DIR%\admin-orders-refunds.html"
type nul > "%PAGES_DIR%\admin-users-member-list.html"
type nul > "%PAGES_DIR%\admin-users-inactive.html"
type nul > "%PAGES_DIR%\admin-users-support.html"
type nul > "%PAGES_DIR%\admin-stats-biz-stats.html"
type nul > "%PAGES_DIR%\admin-stats-funnel.html"
type nul > "%PAGES_DIR%\admin-stats-reports.html"
type nul > "%PAGES_DIR%\admin-config-policies.html"
type nul > "%PAGES_DIR%\admin-config-accounts.html"
type nul > "%PAGES_DIR%\admin-config-logs-system.html"

echo ===================================================
echo  모든 디렉토리와 파일 생성이 완료되었습니다.
echo ===================================================
pause