"""
추천 엔진
사용자 조건에 맞는 3가지 PC 구성을 추천하는 엔진
"""

from typing import List, Dict, Any, Tuple, Optional
from itertools import combinations
import statistics
from app.schemas import (
    RecommendationRequest, RecommendedConfiguration, RecommendationType,
    CPUInfo, MainboardInfo, RAMInfo, GPUInfo, PSUInfo, CaseInfo, CoolerInfo,
    ConfigurationComponent, PerformanceMetric, UsageType, Resolution
)
from app.core.compatibility import CompatibilityValidator
from app.services.prompt_builder import PromptBuilder


class RecommendationEngine:
    """PC 추천 엔진"""
    
    def __init__(
        self,
        cpus: List[CPUInfo],
        mainboards: List[MainboardInfo],
        rams: List[RAMInfo],
        gpus: List[GPUInfo],
        psus: List[PSUInfo],
        cases: List[CaseInfo],
        coolers: List[CoolerInfo]
    ):
        """엔진 초기화 (부품 리스트 주입)"""
        self.cpus = cpus
        self.mainboards = mainboards
        self.rams = rams
        self.gpus = gpus
        self.psus = psus
        self.cases = cases
        self.coolers = coolers
    
    def recommend(self, request: RecommendationRequest) -> List[RecommendedConfiguration]:
        """사용자 요청에 맞는 3가지 PC 구성을 추천
        
        Args:
            request: 추천 요청 (조건값)
        
        Returns:
            [가성비형, 권장형, 고성능형] 구성 리스트
        """
        # 1단계: 조건에 맞는 부품 필터링
        filtered_cpus = self._filter_cpus(request)
        filtered_mainboards = self._filter_mainboards(request, filtered_cpus)
        filtered_rams = self._filter_rams(request, filtered_mainboards)
        filtered_gpus = self._filter_gpus(request)
        filtered_psus = self._filter_psus(request, filtered_gpus)
        filtered_cases = self._filter_cases(request)
        filtered_coolers = self._filter_coolers(request, filtered_cpus)
        
        # 2단계: 호환 가능한 조합 생성
        valid_configs = self._generate_compatible_combinations(
            filtered_cpus, filtered_mainboards, filtered_rams,
            filtered_gpus, filtered_psus, filtered_cases, filtered_coolers,
            request
        )
        
        if not valid_configs:
            # 호환 구성이 없으면 재고 조건을 완화
            valid_configs = self._generate_compatible_combinations(
                filtered_cpus, filtered_mainboards, filtered_rams,
                filtered_gpus, filtered_psus, filtered_cases, filtered_coolers,
                request, allow_low_stock=True
            )
        
        if not valid_configs:
            # 추천 결과가 없으면 빈 리스트 반환
            return []
        
        # 3단계: 3가지 유형별 추천 선정
        recommendations = self._select_three_recommendations(valid_configs, request)
        
        return recommendations
    
    def _filter_cpus(self, request: RecommendationRequest) -> List[CPUInfo]:
        """조건에 맞는 CPU 필터링"""
        filtered = self.cpus
        
        # 브랜드 필터링
        if request.cpu_brand.value != "any":
            filtered = [c for c in filtered if c.brand == request.cpu_brand.value]
        
        # 가격 필터링 (예산의 20-30% 정도)
        cpu_budget_min = request.budget_min * 0.15
        cpu_budget_max = request.budget_max * 0.35
        filtered = [c for c in filtered if cpu_budget_min <= c.price <= cpu_budget_max]
        
        # 재고 필터링
        filtered = [c for c in filtered if c.stock > 0]
        
        # 성능 우선 정렬
        filtered.sort(key=lambda x: (-x.performance_score, x.price))
        
        return filtered
    
    def _filter_mainboards(self, request: RecommendationRequest, cpus: List[CPUInfo]) -> List[MainboardInfo]:
        """CPU 소켓에 맞는 메인보드 필터링"""
        if not cpus:
            return []
        
        # CPU 소켓 목록
        sockets = {cpu.socket for cpu in cpus}
        
        filtered = [m for m in self.mainboards if m.socket in sockets and m.stock > 0]
        
        # 가격 필터링 (예산의 10-20% 정도)
        mainboard_budget = request.budget_max * 0.20
        filtered = [m for m in filtered if m.price <= mainboard_budget]
        
        # 안정성 우선 정렬
        filtered.sort(key=lambda x: (-x.rating if hasattr(x, 'rating') else 0, x.price))
        
        return filtered
    
    def _filter_rams(self, request: RecommendationRequest, mainboards: List[MainboardInfo]) -> List[RAMInfo]:
        """메인보드에 호환되는 메모리 필터링"""
        if not mainboards:
            return []
        
        # 메인보드 DDR 타입 목록
        ddr_types = {m.ddr_type for m in mainboards}
        
        # 용량 결정
        if request.target_ram_gb:
            target_ram_gbs = [request.target_ram_gb]
        else:
            # 용도별 추천 메모리 용량
            if UsageType.VIDEO_EDITING in request.usage_types or \
               UsageType.GRAPHIC_DESIGN in request.usage_types or \
               UsageType.WORK_3D in request.usage_types:
                target_ram_gbs = [32, 16]
            else:
                target_ram_gbs = [16, 8]
        
        filtered = [
            r for r in self.rams
            if r.ddr_type in ddr_types and r.capacity in target_ram_gbs and r.stock > 0
        ]
        
        # 가격 필터링
        ram_budget = request.budget_max * 0.15
        filtered = [r for r in filtered if r.price <= ram_budget]
        
        # 속도 기준 정렬
        filtered.sort(key=lambda x: (-x.speed, x.price))
        
        return filtered
    
    def _filter_gpus(self, request: RecommendationRequest) -> List[GPUInfo]:
        """조건에 맞는 그래픽카드 필터링"""
        filtered = self.gpus
        
        # 브랜드 필터링
        if request.gpu_brand.value != "any" and request.gpu_brand.value != "integrated":
            filtered = [g for g in filtered if g.brand == request.gpu_brand.value]
        
        # 해상도별 권장 성능 기준
        performance_threshold = self._get_gpu_performance_threshold(request.resolution)
        filtered = [g for g in filtered if g.memory >= performance_threshold]
        
        # 재고 필터링
        filtered = [g for g in filtered if g.stock > 0]
        
        # 가격 필터링 (예산의 30-50% 정도)
        gpu_budget_min = request.budget_min * 0.20
        gpu_budget_max = request.budget_max * 0.55
        filtered = [g for g in filtered if gpu_budget_min <= g.price <= gpu_budget_max]
        
        # 성능 우선 정렬
        filtered.sort(key=lambda x: (-x.memory, -x.performance_score if hasattr(x, 'performance_score') else 0))
        
        return filtered
    
    def _filter_psus(self, request: RecommendationRequest, gpus: List[GPUInfo]) -> List[PSUInfo]:
        """그래픽카드에 필요한 파워서플라이 필터링"""
        if not gpus:
            # GPU 없으면 저사양 PSU
            filtered = [p for p in self.psus if p.wattage >= 500 and p.stock > 0]
        else:
            # 최대 GPU 파워 요구사항 기반 PSU 선택
            max_gpu_power = max(g.power_requirement for g in gpus)
            required_wattage = max_gpu_power * 1.5  # 안전 마진
            
            filtered = [p for p in self.psus if p.wattage >= required_wattage and p.stock > 0]
        
        # 가격 필터링
        psu_budget = request.budget_max * 0.10
        filtered = [p for p in filtered if p.price <= psu_budget]
        
        # 효율성 + 가격 정렬
        filtered.sort(key=lambda x: (
            -self._psu_efficiency_score(x.efficiency),
            x.price
        ))
        
        return filtered
    
    def _filter_cases(self, request: RecommendationRequest) -> List[CaseInfo]:
        """조건에 맞는 케이스 필터링"""
        filtered = [c for c in self.cases if c.stock > 0]
        
        # 디자인 선호 반영 가능 (현재는 스킵)
        
        # 가격 필터링
        case_budget = request.budget_max * 0.08
        filtered = [c for c in filtered if c.price <= case_budget]
        
        # 평가 기준 정렬
        filtered.sort(key=lambda x: (-x.rating if hasattr(x, 'rating') else 0, x.price))
        
        return filtered
    
    def _filter_coolers(self, request: RecommendationRequest, cpus: List[CPUInfo]) -> List[CoolerInfo]:
        """CPU 소켓에 맞는 쿨러 필터링"""
        if not cpus:
            return []
        
        sockets = {cpu.socket for cpu in cpus}
        filtered = [
            c for c in self.coolers
            if any(s in c.socket_support for s in sockets) and c.stock > 0
        ]
        
        # 가격 필터링
        cooler_budget = request.budget_max * 0.05
        filtered = [c for c in filtered if c.price <= cooler_budget]
        
        # 성능 + 가격 정렬
        filtered.sort(key=lambda x: (x.price, -x.max_height))
        
        return filtered
    
    def _generate_compatible_combinations(
        self,
        cpus: List[CPUInfo],
        mainboards: List[MainboardInfo],
        rams: List[RAMInfo],
        gpus: List[GPUInfo],
        psus: List[PSUInfo],
        cases: List[CaseInfo],
        coolers: List[CoolerInfo],
        request: RecommendationRequest,
        allow_low_stock: bool = False
    ) -> List[Dict[str, Any]]:
        """호환 가능한 부품 조합 생성"""
        valid_configs = []
        
        # 각 카테고리에서 상위 3-5개씩만 조합 (성능 최적화)
        cpus_subset = cpus[:3] if len(cpus) > 3 else cpus
        mainboards_subset = mainboards[:3] if len(mainboards) > 3 else mainboards
        rams_subset = rams[:3] if len(rams) > 3 else rams
        gpus_subset = gpus[:3] if len(gpus) > 3 else gpus
        psus_subset = psus[:3] if len(psus) > 3 else psus
        cases_subset = cases[:3] if len(cases) > 3 else cases
        coolers_subset = coolers[:3] if len(coolers) > 3 else coolers
        
        # 조합 생성
        for cpu in cpus_subset:
            # CPU 소켓에 맞는 메인보드 찾기
            matching_mainboards = [m for m in mainboards_subset if m.socket == cpu.socket]
            
            for mainboard in matching_mainboards:
                # 메인보드 DDR에 맞는 메모리 찾기
                matching_rams = [r for r in rams_subset if r.ddr_type == mainboard.ddr_type]
                
                for ram in matching_rams:
                    for gpu in gpus_subset:
                        # GPU 파워에 맞는 PSU 찾기
                        min_psu_wattage = gpu.power_requirement * 1.5
                        matching_psus = [p for p in psus_subset if p.wattage >= min_psu_wattage]
                        
                        for psu in matching_psus:
                            for case in cases_subset:
                                # GPU 길이와 케이스 호환성 확인
                                if gpu.length > case.gpu_clearance:
                                    continue
                                
                                # CPU 소켓에 맞는 쿨러 찾기
                                matching_coolers = [c for c in coolers_subset if cpu.socket in c.socket_support]
                                
                                for cooler in matching_coolers:
                                    # 최종 호환성 검증
                                    is_compatible, checks = CompatibilityValidator.validate_configuration(
                                        cpu, mainboard, ram, gpu, psu, case, cooler
                                    )
                                    
                                    if is_compatible:
                                        total_price = cpu.price + mainboard.price + ram.price + \
                                                    gpu.price + psu.price + case.price + cooler.price
                                        
                                        # 예산 범위 확인
                                        if request.budget_min <= total_price <= request.budget_max:
                                            valid_configs.append({
                                                'cpu': cpu,
                                                'mainboard': mainboard,
                                                'ram': ram,
                                                'gpu': gpu,
                                                'psu': psu,
                                                'case': case,
                                                'cooler': cooler,
                                                'total_price': total_price,
                                                'compatibility_checks': checks
                                            })
        
        return valid_configs
    
    def _select_three_recommendations(
        self,
        valid_configs: List[Dict[str, Any]],
        request: RecommendationRequest
    ) -> List[RecommendedConfiguration]:
        """유효한 구성 중 3가지 유형 선정"""
        if not valid_configs:
            return []
        
        # 가격 기준 정렬
        sorted_by_price = sorted(valid_configs, key=lambda x: x['total_price'])
        
        recommendations = []
        
        # 1. 가성비형: 가장 저렴한 것
        if sorted_by_price:
            value_config = sorted_by_price[0]
            recommendations.append(
                self._create_recommendation_config(value_config, RecommendationType.VALUE, request)
            )
        
        # 2. 권장형: 가격-성능 균형 (중간값)
        if len(sorted_by_price) > 1:
            mid_idx = len(sorted_by_price) // 2
            recommended_config = sorted_by_price[mid_idx]
            recommendations.append(
                self._create_recommendation_config(recommended_config, RecommendationType.RECOMMENDED, request)
            )
        
        # 3. 고성능형: 가장 비싼 것
        if len(sorted_by_price) > 1:
            performance_config = sorted_by_price[-1]
            recommendations.append(
                self._create_recommendation_config(performance_config, RecommendationType.PERFORMANCE, request)
            )
        
        return recommendations
    
    def _create_recommendation_config(
        self,
        config: Dict[str, Any],
        rec_type: RecommendationType,
        request: RecommendationRequest
    ) -> RecommendedConfiguration:
        """추천 구성 객체 생성"""
        cpu = config['cpu']
        mainboard = config['mainboard']
        ram = config['ram']
        gpu = config['gpu']
        psu = config['psu']
        case = config['case']
        cooler = config['cooler']
        total_price = config['total_price']
        
        # 부품 정보 구성
        components = [
            ConfigurationComponent(id=cpu.id, name=cpu.name, price=cpu.price, category="cpu"),
            ConfigurationComponent(id=mainboard.id, name=mainboard.name, price=mainboard.price, category="mainboard"),
            ConfigurationComponent(id=ram.id, name=ram.name, price=ram.price, category="ram"),
            ConfigurationComponent(id=gpu.id, name=gpu.name, price=gpu.price, category="gpu"),
            ConfigurationComponent(id=psu.id, name=psu.name, price=psu.price, category="psu"),
            ConfigurationComponent(id=case.id, name=case.name, price=case.price, category="case"),
            ConfigurationComponent(id=cooler.id, name=cooler.name, price=cooler.price, category="cooler"),
        ]
        
        # 성능 메트릭 계산
        performance_metrics = self._calculate_performance_metrics(
            cpu, gpu, ram, request
        )
        
        # 추천 이유
        reason = self._generate_recommendation_reason(
            rec_type, cpu, gpu, ram, total_price, request
        )
        
        # 재고 상태
        total_stock = min(cpu.stock, mainboard.stock, ram.stock, gpu.stock, psu.stock, case.stock, cooler.stock)
        if total_stock > 3:
            stock_status = "충분"
        elif total_stock > 0:
            stock_status = "소량 남음"
        else:
            stock_status = "입고예정"
        
        return RecommendedConfiguration(
            type=rec_type,
            total_price=total_price,
            components=components,
            performance_metrics=performance_metrics,
            compatibility_checks=config['compatibility_checks'],
            is_fully_compatible=all(check.is_compatible for check in config['compatibility_checks']),
            stock_status=stock_status,
            estimated_lead_time_days=3 if stock_status == "충분" else 7,
            upgrade_potential="높음" if case.gpu_clearance > gpu.length + 50 else "중간",
            recommendation_reason=reason
        )
    
    def _calculate_performance_metrics(
        self,
        cpu: CPUInfo,
        gpu: GPUInfo,
        ram: RAMInfo,
        request: RecommendationRequest
    ) -> List[PerformanceMetric]:
        """성능 메트릭 계산"""
        metrics = []
        
        # 게임 성능 (GPU 기준)
        game_score = min(100, (gpu.memory / 8) * 50 + (gpu.performance_score if hasattr(gpu, 'performance_score') else 50))
        metrics.append(PerformanceMetric(
            name="game_fps",
            score=min(100, game_score),
            description=f"1080p 고사양 게임: {int(game_score * 0.8)}FPS 예상"
        ))
        
        # 작업 성능 (CPU + RAM 기준)
        work_score = min(100, (cpu.cores / 16) * 40 + (ram.capacity / 32) * 40 + 20)
        metrics.append(PerformanceMetric(
            name="work_score",
            score=min(100, work_score),
            description=f"영상편집/렌더링: {int(work_score)}점"
        ))
        
        # 가성비 점수
        value_score = min(100, (request.budget_max / 2000000) * 100)  # 200만원 기준
        metrics.append(PerformanceMetric(
            name="value_score",
            score=min(100, value_score),
            description=f"가성비: {int(value_score)}점"
        ))
        
        return metrics
    
    def _generate_recommendation_reason(
        self,
        rec_type: RecommendationType,
        cpu: CPUInfo,
        gpu: GPUInfo,
        ram: RAMInfo,
        total_price: int,
        request: RecommendationRequest
    ) -> str:
        """추천 이유 생성"""
        reasons = {
            RecommendationType.VALUE: f"{total_price:,}원으로 기본적인 게임과 업무를 충분히 처리할 수 있는 가성비 최고의 구성입니다.",
            RecommendationType.RECOMMENDED: f"{cpu.name}와 {gpu.name}의 최적 조합으로 대부분의 게임과 작업을 쾌적하게 처리할 수 있습니다.",
            RecommendationType.PERFORMANCE: f"최상의 성능을 원하는 사용자를 위한 {total_price:,}원대 고성능 구성입니다."
        }
        return reasons.get(rec_type, "추천 구성입니다.")
    
    def _get_gpu_performance_threshold(self, resolution: Resolution) -> int:
        """해상도별 권장 그래픽카드 메모리"""
        thresholds = {
            Resolution.FHD: 4,
            Resolution.QHD: 6,
            Resolution.UHD: 12,
            Resolution.MULTI_MONITOR: 8
        }
        return thresholds.get(resolution, 4)
    
    def _psu_efficiency_score(self, efficiency: str) -> float:
        """PSU 효율 등급 점수"""
        scores = {
            "80+ Platinum": 5.0,
            "80+ Gold": 4.0,
            "80+ Silver": 3.0,
            "80+ Bronze": 2.0,
            "80+": 1.5,
            "": 1.0
        }
        return scores.get(efficiency, 1.0)
