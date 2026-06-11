"""
팝콘PC AI 조립PC 추천 API 서버
FastAPI 애플리케이션 진입점
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import recommend

# FastAPI 앱 생성
app = FastAPI(
    title="팝콘PC AI 추천 API",
    description="AI 기반 맞춤형 조립PC 추천 시스템",
    version="0.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(recommend.router, prefix="/api")

# 루트 엔드포인트
@app.get("/")
async def root():
    """API 루트 엔드포인트"""
    return {
        "message": "팝콘PC AI 추천 API",
        "version": "0.1.0",
        "endpoints": {
            "recommend": "POST /api/recommend",
            "health": "GET /api/recommend/health",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
 
