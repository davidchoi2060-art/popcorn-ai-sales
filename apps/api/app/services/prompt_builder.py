"""
AI 요청 프롬프트 자동 생성
사용자가 선택한 조건값을 자연어 프롬프트로 변환
"""

from app.schemas import RecommendationRequest, UsageType, CPUBrand, GPUBrand, Resolution


class PromptBuilder:
    """사용자 조건을 AI 요청 프롬프트로 변환"""
    
    BASE_PROMPT = "안녕하세요! 사용 목적과 예산에 맞는 조립PC 구성을 찾고 있습니다."
    
    @staticmethod
    def build_prompt(request: RecommendationRequest) -> str:
        """요청 조건으로부터 AI 요청 프롬프트 생성"""
        parts = [PromptBuilder.BASE_PROMPT]
        
        # 1. 사용 목적
        usage_part = PromptBuilder._build_usage_part(request.usage_types)
        if usage_part:
            parts.append(usage_part)
        
        # 2. 예산
        budget_part = PromptBuilder._build_budget_part(request.budget_min, request.budget_max)
        if budget_part:
            parts.append(budget_part)
        
        # 3. CPU/GPU 선호
        preference_part = PromptBuilder._build_preference_part(
            request.cpu_brand, request.gpu_brand, request.resolution
        )
        if preference_part:
            parts.append(preference_part)
        
        # 4. 메모리/저장장치 선호
        component_part = PromptBuilder._build_component_part(
            request.target_ram_gb, request.target_ssd_gb
        )
        if component_part:
            parts.append(component_part)
        
        # 5. 마무리 문구
        parts.append("해당 조건에 맞는 최적의 조립PC 구성을 추천해 주세요.")
        
        return "\n".join(parts)
    
    @staticmethod
    def _build_usage_part(usage_types: list) -> str:
        """사용 목적 부분 생성"""
        if not usage_types:
            return ""
        
        usage_descriptions = {
            UsageType.GAME: "게임",
            UsageType.OFFICE: "업무용",
            UsageType.INTERNET: "인터넷/강의",
            UsageType.VIDEO_EDITING: "영상편집",
            UsageType.GRAPHIC_DESIGN: "그래픽디자인",
            UsageType.WORK_3D: "3D작업",
            UsageType.BROADCAST: "방송",
            UsageType.DEVELOPMENT: "개발",
            UsageType.AI_BEGINNER: "AI입문",
            UsageType.MULTI_MONITOR: "주식/멀티모니터"
        }
        
        usages = [usage_descriptions.get(u, u.value) for u in usage_types]
        
        if len(usages) == 1:
            return f"주 용도는 {usages[0]}입니다."
        else:
            primary = usages[0]
            others = ", ".join(usages[1:])
            return f"주 용도는 {primary}이고, 추가로 {others}도 고려하고 있습니다."
    
    @staticmethod
    def _build_budget_part(budget_min: int, budget_max: int) -> str:
        """예산 부분 생성"""
        def format_price(price: int) -> str:
            if price >= 1000000:
                return f"{price // 1000000}백만원"
            else:
                return f"{price // 10000}만원"
        
        min_str = format_price(budget_min)
        max_str = format_price(budget_max)
        
        if budget_min == budget_max:
            return f"예산은 {max_str} 정도입니다."
        else:
            return f"예산은 {min_str}에서 {max_str} 사이입니다."
    
    @staticmethod
    def _build_preference_part(cpu_brand: CPUBrand, gpu_brand: GPUBrand, resolution: Resolution) -> str:
        """CPU/GPU 선호 부분 생성"""
        parts = []
        
        # CPU 브랜드
        if cpu_brand != CPUBrand.ANY:
            brand_name = "Intel" if cpu_brand == CPUBrand.INTEL else "AMD"
            parts.append(f"CPU는 {brand_name} 제품을 선호합니다.")
        
        # GPU 브랜드
        if gpu_brand != GPUBrand.ANY:
            if gpu_brand == GPUBrand.NVIDIA:
                parts.append("그래픽카드는 NVIDIA 제품을 우선 고려해 주세요.")
            elif gpu_brand == GPUBrand.AMD:
                parts.append("그래픽카드는 AMD 제품을 우선 고려해 주세요.")
            elif gpu_brand == GPUBrand.INTEGRATED:
                parts.append("내장그래픽으로 충분합니다.")
        
        # 해상도
        if resolution != Resolution.FHD:
            resolution_names = {
                Resolution.QHD: "QHD (2560x1440)",
                Resolution.UHD: "4K (3840x2160)",
                Resolution.MULTI_MONITOR: "멀티 모니터 (2개 이상)"
            }
            if resolution in resolution_names:
                parts.append(f"주로 {resolution_names[resolution]} 환경에서 사용할 예정입니다.")
        
        return " ".join(parts)
    
    @staticmethod
    def _build_component_part(target_ram_gb: int, target_ssd_gb: int) -> str:
        """메모리/저장장치 부분 생성"""
        parts = []
        
        if target_ram_gb:
            parts.append(f"메모리는 {target_ram_gb}GB를 원합니다.")
        
        if target_ssd_gb:
            parts.append(f"저장장치는 SSD {target_ssd_gb}GB 이상을 원합니다.")
        
        return " ".join(parts)
    
    @staticmethod
    def summarize_request(request: RecommendationRequest) -> str:
        """요청을 짧게 요약 (헤더용)
        예: "게임용 · 영상편집 · 120~200만원 · NVIDIA · QHD"
        """
        parts = []
        
        # 사용 목적
        if request.usage_types:
            usage_map = {
                UsageType.GAME: "게임",
                UsageType.OFFICE: "업무",
                UsageType.INTERNET: "인터넷",
                UsageType.VIDEO_EDITING: "편집",
                UsageType.GRAPHIC_DESIGN: "디자인",
                UsageType.WORK_3D: "3D",
                UsageType.BROADCAST: "방송",
                UsageType.DEVELOPMENT: "개발",
                UsageType.AI_BEGINNER: "AI",
                UsageType.MULTI_MONITOR: "멀티"
            }
            usages = [usage_map.get(u, u.value) for u in request.usage_types[:2]]
            parts.append(" · ".join(usages))
        
        # 예산
        min_budget = request.budget_min // 100000
        max_budget = request.budget_max // 100000
        parts.append(f"{min_budget}~{max_budget}만원")
        
        # GPU 브랜드
        if request.gpu_brand != GPUBrand.ANY:
            gpu_name = "NVIDIA" if request.gpu_brand == GPUBrand.NVIDIA else \
                      "AMD" if request.gpu_brand == GPUBrand.AMD else "내장"
            parts.append(gpu_name)
        
        # 해상도
        if request.resolution != Resolution.FHD:
            res_name = "QHD" if request.resolution == Resolution.QHD else \
                      "4K" if request.resolution == Resolution.UHD else "멀티"
            parts.append(res_name)
        
        return " · ".join(parts) 
