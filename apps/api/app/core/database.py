"""
데이터베이스 설정 및 연결
PostgreSQL 데이터베이스 초기화 및 세션 관리
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 데이터베이스 연결 문자열
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://popcorn:popcorn123@localhost/popcorn_ai_sales"
)

# SQLAlchemy 엔진 생성
# SQLite의 경우 connect_args 추가
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    echo=False,  # SQL 쿼리 로깅 활성화/비활성화
    pool_pre_ping=True if "postgresql" in DATABASE_URL else False,
    connect_args=connect_args,
)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 기본 모델 클래스
Base = declarative_base()


def get_db() -> Session:
    """의존성 주입용 DB 세션 제공"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """데이터베이스 초기화 (모든 테이블 생성)"""
    from app.models import (
        CPUModel, MainboardModel, RAMModel, GPUModel,
        PSUModel, CaseModel, CoolerModel,
        RecommendationModel, RecommendationComponentModel
    )
    Base.metadata.create_all(bind=engine)
    print("✅ 데이터베이스 테이블 생성 완료")
