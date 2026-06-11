"""
데이터 스키마 정의
- 추천 요청 입력값
- 부품 정보
- 추천 결과
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


# ============================================================================
# Enum 정의
# ============================================================================

class UsageType(str, Enum):
    """사용 목적"""
    GAME = "game"
    OFFICE = "office"
    INTERNET = "internet"
    VIDEO_EDITING = "video_editing"
    GRAPHIC_DESIGN = "graphic_design"
    WORK_3D = "3d_work"
    BROADCAST = "broadcast"
    DEVELOPMENT = "development"
    AI_BEGINNER = "ai_beginner"
    MULTI_MONITOR = "multi_monitor"


class CPUBrand(str, Enum):
    """CPU 브랜드 선호"""
    INTEL = "intel"
    AMD = "amd"
    ANY = "any"


class GPUBrand(str, Enum):
    """GPU 브랜드 선호"""
    NVIDIA = "nvidia"
    AMD = "amd"
    INTEGRATED = "integrated"
    ANY = "any"


class Resolution(str, Enum):
    """해상도"""
    FHD = "fhd"  # 1920x1080
    QHD = "qhd"  # 2560x1440
    UHD = "uhd"  # 3840x2160 (4K)
    MULTI_MONITOR = "multi_monitor"


class RecommendationType(str, Enum):
    """추천 유형"""
    VALUE = "value"        # 가성비형
    RECOMMENDED = "recommended"  # 권장형
    PERFORMANCE = "performance"  # 고성능형


# ============================================================================
# 부품 정보 Schema
# ============================================================================

class ComponentInfo(BaseModel):
    """부품 기본 정보"""
    id: str
    name: str
    category: str  # cpu, gpu, ram, ssd, mainboard, psu, case, cooler
    price: int
    manufacturer: str
    model: str
    stock: int = 0  # 재고 수량


class CPUInfo(ComponentInfo):
    """CPU 정보"""
    socket: str  # LGA1700, AM4, AM5 등
    brand: str  # intel, amd
    cores: int
    threads: int
    base_clock: float  # GHz
    boost_clock: float  # GHz
    tdp: int  # W
    gen: int  # 세대
    performance_score: float = 50.0  # 성능 점수 (0-100)


class MainboardInfo(ComponentInfo):
    """메인보드 정보"""
    socket: str  # CPU 소켓
    chipset: str  # Z790, X870 등
    ddr_type: str  # DDR4, DDR5
    form_factor: str  # ATX, Micro-ATX, Mini-ITX
    max_memory: int  # GB
    rating: float = 4.5  # 평가 점수 (0-5)


class RAMInfo(ComponentInfo):
    """메모리 정보"""
    capacity: int  # GB
    ddr_type: str  # DDR4, DDR5
    speed: int  # MHz
    modules: int  # 개수 (8GBx2 = 2개)


class SSDInfo(ComponentInfo):
    """SSD 정보"""
    capacity: int  # GB
    speed_seq_read: int  # MB/s
    form_factor: str  # M.2, 2.5"


class GPUInfo(ComponentInfo):
    """그래픽카드 정보"""
    brand: str  # nvidia, amd
    memory: int  # GB
    length: int  # mm (케이스 호환성)
    power_requirement: int  # W (필요 파워)
    tdp: int  # W
    performance_score: float = 50.0  # 성능 점수 (0-100)


class PSUInfo(ComponentInfo):
    """파워서플라이 정보"""
    wattage: int  # W (정격출력)
    efficiency: str  # 80+, 80+ Gold 등
    modular: str  # full, semi, non


class CaseInfo(ComponentInfo):
    """케이스 정보"""
    form_factor: str  # ATX, Micro-ATX, Mini-ITX, Mini-Tower, Mid-Tower
    gpu_clearance: int  # mm (그래픽카드 최대 길이)
    cpu_cooler_clearance: int  # mm (CPU 쿨러 최대 높이)
    power_support: str  # ATX, Micro-ATX 지원
    rating: float = 4.5  # 평가 점수 (0-5)


class CoolerInfo(ComponentInfo):
    """CPU 쿨러 정보"""
    socket_support: List[str]  # ['LGA1700', 'AM5'] 등
    max_height: int  # mm


# ============================================================================
# 추천 요청 Schema
# ============================================================================

class RecommendationRequest(BaseModel):
    """AI 추천 요청"""
    # 필수 조건
    usage_types: List[UsageType]  # [game, video_editing]
    budget_min: int  # 최소 예산 (원)
    budget_max: int  # 최대 예산 (원)
    
    # 선택 조건
    cpu_brand: CPUBrand = CPUBrand.ANY
    gpu_brand: GPUBrand = GPUBrand.ANY
    resolution: Resolution = Resolution.FHD
    target_ram_gb: Optional[int] = None  # None이면 추천
    target_ssd_gb: Optional[int] = None  # None이면 추천
    
    # AI 프롬프트 (선택사항)
    prompt: Optional[str] = None


# ============================================================================
# 추천 결과 Schema
# ============================================================================

class ConfigurationComponent(BaseModel):
    """추천 구성의 부품 정보"""
    id: str
    name: str
    price: int
    category: str


class PerformanceMetric(BaseModel):
    """성능 지표"""
    name: str  # "game_fps", "work_score" 등
    score: float  # 0-100
    description: str


class CompatibilityCheck(BaseModel):
    """호환성 검증 결과"""
    check_item: str  # "cpu_socket", "gpu_power" 등
    is_compatible: bool
    message: str


class RecommendedConfiguration(BaseModel):
    """추천 구성 상세"""
    type: RecommendationType
    total_price: int
    
    # 주요 부품 (간략 정보)
    components: List[ConfigurationComponent]
    
    # 성능 메트릭
    performance_metrics: List[PerformanceMetric]
    
    # 호환성 검증
    compatibility_checks: List[CompatibilityCheck]
    is_fully_compatible: bool
    
    # 추가 정보
    stock_status: str  # "충분", "소량 남음", "입고예정"
    estimated_lead_time_days: int  # 배송+조립 예상 일수
    upgrade_potential: str  # "높음", "중간", "낮음"
    
    # 추천 이유
    recommendation_reason: str


class RecommendationResponse(BaseModel):
    """AI 추천 결과"""
    request_summary: str  # "게임용 · 영상편집 · 120~200만원 · NVIDIA · QHD"
    
    # 추천 프롬프트 (일부)
    ai_prompt_summary: str
    ai_prompt_full: Optional[str]  # 전체 프롬프트
    
    # 3가지 추천 구성
    recommendations: List[RecommendedConfiguration]  # [가성비형, 권장형, 고성능형]
    
    # 추천 성공 여부
    success: bool
    message: str  # 실패 시 이유
