"""
SQLAlchemy ORM 모델 정의
각 부품 카테고리별 데이터 모델 및 추천 이력 모델
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class CPUModel(Base):
    """CPU 부품"""
    __tablename__ = "parts_cpu"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)  # Intel, AMD
    model = Column(String, unique=True)
    socket = Column(String, index=True)  # LGA1700, AM5
    cores = Column(Integer)
    threads = Column(Integer)
    base_clock = Column(Float)  # GHz
    boost_clock = Column(Float)  # GHz
    tdp = Column(Integer)  # Watts
    price = Column(Integer)  # 원
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MainboardModel(Base):
    """메인보드 부품"""
    __tablename__ = "parts_mainboard"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, unique=True)
    socket = Column(String, index=True)  # LGA1700, AM5
    chipset = Column(String)  # Z790, X870-E
    ddr_type = Column(String)  # DDR4, DDR5
    form_factor = Column(String)  # ATX, Micro-ATX
    ram_slots = Column(Integer)
    max_ram_gb = Column(Integer)
    price = Column(Integer)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RAMModel(Base):
    """메모리 부품"""
    __tablename__ = "parts_ram"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, unique=True)
    capacity_gb = Column(Integer)
    ddr_type = Column(String)  # DDR4, DDR5
    speed_mhz = Column(Integer)
    latency = Column(Float)  # CAS Latency
    modules = Column(Integer)  # 모듈 수 (1x16, 2x8 등)
    price = Column(Integer)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class GPUModel(Base):
    """그래픽카드 부품"""
    __tablename__ = "parts_gpu"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)  # NVIDIA, AMD
    model = Column(String, unique=True)
    memory_gb = Column(Integer)
    memory_type = Column(String)  # GDDR6X, GDDR6
    power_requirement = Column(Integer)  # Watts (권장)
    length_mm = Column(Integer)
    price = Column(Integer)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PSUModel(Base):
    """파워서플라이 부품"""
    __tablename__ = "parts_psu"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, unique=True)
    wattage = Column(Integer)  # 정격 출력
    efficiency_rating = Column(String)  # 80+, 80+ Gold
    modular = Column(Boolean, default=False)  # 모듈식 여부
    fanless = Column(Boolean, default=False)
    price = Column(Integer)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CaseModel(Base):
    """케이스 부품"""
    __tablename__ = "parts_case"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, unique=True)
    form_factor = Column(String)  # ATX, Micro-ATX, Mini-ITX
    gpu_max_length_mm = Column(Integer)
    cooler_max_height_mm = Column(Integer)
    color = Column(String)
    price = Column(Integer)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CoolerModel(Base):
    """CPU 쿨러 부품"""
    __tablename__ = "parts_cooler"
    
    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, unique=True)
    type = Column(String)  # Air, Liquid
    sockets = Column(JSON)  # JSON 배열로 저장
    max_height_mm = Column(Integer)
    price = Column(Integer)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RecommendationModel(Base):
    """추천 결과 이력"""
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)  # 로그인 사용자면 기록
    usage_types = Column(JSON)  # JSON 배열로 저장
    budget_min = Column(Integer)
    budget_max = Column(Integer)
    cpu_brand = Column(String)
    gpu_brand = Column(String)
    resolution = Column(String)
    target_ram_gb = Column(Integer, nullable=True)
    target_ssd_gb = Column(Integer, nullable=True)
    request_prompt = Column(Text)  # 생성된 AI 프롬프트
    recommendation_type = Column(String)  # value, recommended, performance
    total_price = Column(Integer)
    ai_summary = Column(Text)
    user_action = Column(String, nullable=True)  # clicked, added_to_cart, purchased, etc
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계
    components = relationship("RecommendationComponentModel", back_populates="recommendation")


class RecommendationComponentModel(Base):
    """추천 구성의 부품 (레코드)"""
    __tablename__ = "recommendation_components"
    
    id = Column(String, primary_key=True, index=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), index=True)
    component_type = Column(String)  # cpu, mainboard, ram, gpu, psu, case, cooler
    component_id = Column(String)  # 부품 테이블의 ID
    component_name = Column(String)
    component_price = Column(Integer)
    
    # 관계
    recommendation = relationship("RecommendationModel", back_populates="components")
