"""
API 라우터 - 추천 엔드포인트
POST /api/recommend - AI 추천 결과 반환
"""

from fastapi import APIRouter, HTTPException, status
from typing import List

from app.schemas import (
    RecommendationRequest, RecommendationResponse, RecommendedConfiguration
)
from app.services.recommendation_engine import RecommendationEngine
from app.services.prompt_builder import PromptBuilder
from app.services.sample_database import PartsDataLoader

# 라우터 생성
router = APIRouter(prefix="/recommend", tags=["recommendation"])


@router.post("/", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest) -> RecommendationResponse:
    """
    AI 기반 PC 추천 API
    
    사용자의 조건값(용도, 예산, CPU/GPU 선호, 해상도)을 입력받아
    호환성 검증을 통과한 3가지 추천 구성을 반환합니다.
    
    **요청 예시:**
    ```json
    {
        "usage_types": ["game"],
        "budget_min": 1200000,
        "budget_max": 2000000,
        "cpu_brand": "any",
        "gpu_brand": "nvidia",
        "resolution": "qhd"
    }
    ```
    
    **응답:**
    - request_summary: 요청 조건 요약 (헤더용)
    - ai_prompt_summary: AI 요청 프롬프트 (요약)
    - ai_prompt_full: AI 요청 프롬프트 (전체)
    - recommendations: 3가지 추천 구성 [가성비형, 권장형, 고성능형]
      - type: 추천 유형
      - total_price: 총 가격
      - components: 부품 리스트
      - performance_metrics: 성능 지표
      - compatibility_checks: 호환성 검증 결과
      - stock_status: 재고 상태
      - recommendation_reason: 추천 이유
    """
    
    # 1. 입력값 검증
    if not request.usage_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="사용 목적(usage_types)은 필수입니다."
        )
    
    if request.budget_min <= 0 or request.budget_max <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="예산은 0보다 커야 합니다."
        )
    
    if request.budget_min > request.budget_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="최소 예산이 최대 예산보다 클 수 없습니다."
        )
    
    # 2. 부품 데이터 로드 (CSV 또는 샘플 데이터베이스 사용)
    cpus, mainboards, rams, gpus, psus, cases, coolers = PartsDataLoader.load_all_parts()
    
    # 부품이 없으면 임시 메시지
    if not (cpus and mainboards and rams and gpus and psus and cases and coolers):
        return RecommendationResponse(
            request_summary=PromptBuilder.summarize_request(request),
            ai_prompt_summary=PromptBuilder.build_prompt(request)[:100] + "...",
            ai_prompt_full=PromptBuilder.build_prompt(request),
            recommendations=[],
            success=False,
            message="부품 데이터를 로드할 수 없습니다."
        )
    
    # 3. 추천 엔진 실행
    engine = RecommendationEngine(
        cpus=cpus,
        mainboards=mainboards,
        rams=rams,
        gpus=gpus,
        psus=psus,
        cases=cases,
        coolers=coolers
    )
    
    recommendations = engine.recommend(request)
    
    # 4. 결과 구성
    if not recommendations:
        return RecommendationResponse(
            request_summary=PromptBuilder.summarize_request(request),
            ai_prompt_summary=PromptBuilder.build_prompt(request)[:100] + "...",
            ai_prompt_full=PromptBuilder.build_prompt(request),
            recommendations=[],
            success=False,
            message=f"해당 조건에 맞는 추천 구성을 찾을 수 없습니다. "
                   f"예산을 조정하거나 조건을 완화해주세요."
        )
    
    # 5. 성공 응답
    prompt_full = PromptBuilder.build_prompt(request)
    
    return RecommendationResponse(
        request_summary=PromptBuilder.summarize_request(request),
        ai_prompt_summary=prompt_full[:150] + "..." if len(prompt_full) > 150 else prompt_full,
        ai_prompt_full=prompt_full,
        recommendations=recommendations,
        success=True,
        message="추천 구성 조회 성공"
    )


@router.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "recommendation"}
 
