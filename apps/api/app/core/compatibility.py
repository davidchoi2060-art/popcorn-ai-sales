"""
호환성 검증 로직
PC 부품 간의 호환성을 검증하는 함수들
"""

from typing import List, Tuple, Dict, Any
from app.schemas import (
    CPUInfo, MainboardInfo, RAMInfo, GPUInfo, PSUInfo, CaseInfo, CoolerInfo,
    CompatibilityCheck
)


# ============================================================================
# 호환성 검증 규칙
# ============================================================================

class CompatibilityValidator:
    """부품 호환성 검증"""
    
    @staticmethod
    def check_cpu_mainboard_socket(cpu: CPUInfo, mainboard: MainboardInfo) -> CompatibilityCheck:
        """CPU와 메인보드 소켓 호환성 검증"""
        is_compatible = cpu.socket == mainboard.socket
        return CompatibilityCheck(
            check_item="cpu_socket",
            is_compatible=is_compatible,
            message=f"CPU 소켓: {cpu.socket}, 메인보드 소켓: {mainboard.socket}" 
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_mainboard_ram_ddr(mainboard: MainboardInfo, ram: RAMInfo) -> CompatibilityCheck:
        """메인보드와 메모리 DDR 버전 호환성 검증"""
        is_compatible = mainboard.ddr_type == ram.ddr_type
        return CompatibilityCheck(
            check_item="memory_type",
            is_compatible=is_compatible,
            message=f"메인보드 DDR: {mainboard.ddr_type}, 메모리 DDR: {ram.ddr_type}"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_gpu_psu_power(gpu: GPUInfo, psu: PSUInfo) -> CompatibilityCheck:
        """그래픽카드와 파워서플라이 호환성 검증"""
        # GPU 권장 파워 < PSU 정격출력의 70% 정도를 권장
        safe_margin = psu.wattage * 0.7
        is_compatible = gpu.power_requirement <= safe_margin
        
        return CompatibilityCheck(
            check_item="gpu_power",
            is_compatible=is_compatible,
            message=f"GPU 권장 파워: {gpu.power_requirement}W, PSU: {psu.wattage}W (권장: {safe_margin:.0f}W 이상)"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_gpu_case_length(gpu: GPUInfo, case: CaseInfo) -> CompatibilityCheck:
        """그래픽카드와 케이스 수용 길이 호환성 검증"""
        is_compatible = gpu.length <= case.gpu_clearance
        return CompatibilityCheck(
            check_item="gpu_length",
            is_compatible=is_compatible,
            message=f"GPU 길이: {gpu.length}mm, 케이스 수용: {case.gpu_clearance}mm"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_cpu_cooler_height(cooler: CoolerInfo, case: CaseInfo) -> CompatibilityCheck:
        """CPU 쿨러와 케이스 내부 높이 호환성 검증"""
        is_compatible = cooler.max_height <= case.cpu_cooler_clearance
        return CompatibilityCheck(
            check_item="cooler_height",
            is_compatible=is_compatible,
            message=f"쿨러 높이: {cooler.max_height}mm, 케이스 수용: {case.cpu_cooler_clearance}mm"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_cpu_cooler_socket(cpu: CPUInfo, cooler: CoolerInfo) -> CompatibilityCheck:
        """CPU와 쿨러 소켓 호환성 검증"""
        is_compatible = cpu.socket in cooler.socket_support
        return CompatibilityCheck(
            check_item="cooler_socket",
            is_compatible=is_compatible,
            message=f"CPU 소켓: {cpu.socket}, 쿨러 지원: {', '.join(cooler.socket_support)}"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_case_form_factor(mainboard: MainboardInfo, case: CaseInfo) -> CompatibilityCheck:
        """케이스와 메인보드 폼팩터 호환성 검증"""
        # Case가 지원하는 폼팩터에 메인보드가 포함되는지 확인
        # 예: ATX 케이스는 Micro-ATX, Mini-ITX도 지원
        case_supports_atx = "ATX" in case.form_factor or case.power_support == "ATX"
        mainboard_is_atx = mainboard.form_factor == "ATX"
        
        is_compatible = True
        if mainboard_is_atx and not case_supports_atx:
            is_compatible = False
        
        return CompatibilityCheck(
            check_item="form_factor",
            is_compatible=is_compatible,
            message=f"메인보드: {mainboard.form_factor}, 케이스: {case.form_factor}"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def check_ram_capacity_limit(ram: RAMInfo, mainboard: MainboardInfo) -> CompatibilityCheck:
        """메모리 총 용량이 메인보드 최대 지원 용량 이하인지 검증"""
        # RAM 개수 * 용량 = 총 메모리
        total_memory = ram.capacity * ram.modules
        is_compatible = total_memory <= mainboard.max_memory
        
        return CompatibilityCheck(
            check_item="memory_capacity",
            is_compatible=is_compatible,
            message=f"메모리 용량: {total_memory}GB, 메인보드 최대: {mainboard.max_memory}GB"
                    + (" ✓ 호환" if is_compatible else " ✗ 불호환")
        )
    
    @staticmethod
    def validate_configuration(
        cpu: CPUInfo,
        mainboard: MainboardInfo,
        ram: RAMInfo,
        gpu: GPUInfo,
        psu: PSUInfo,
        case: CaseInfo,
        cooler: CoolerInfo
    ) -> Tuple[bool, List[CompatibilityCheck]]:
        """전체 구성의 호환성 검증
        
        Returns:
            (전체 호환성, 검증 결과 리스트)
        """
        checks = [
            CompatibilityValidator.check_cpu_mainboard_socket(cpu, mainboard),
            CompatibilityValidator.check_mainboard_ram_ddr(mainboard, ram),
            CompatibilityValidator.check_gpu_psu_power(gpu, psu),
            CompatibilityValidator.check_gpu_case_length(gpu, case),
            CompatibilityValidator.check_cpu_cooler_height(cooler, case),
            CompatibilityValidator.check_cpu_cooler_socket(cpu, cooler),
            CompatibilityValidator.check_case_form_factor(mainboard, case),
            CompatibilityValidator.check_ram_capacity_limit(ram, mainboard),
        ]
        
        is_fully_compatible = all(check.is_compatible for check in checks)
        return is_fully_compatible, checks
