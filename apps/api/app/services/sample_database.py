"""
샘플 부품 데이터
추천 엔진 테스트용 메모리 기반 부품 데이터
"""

from typing import List, Tuple
from pathlib import Path
from app.schemas import (
    CPUInfo, MainboardInfo, RAMInfo, GPUInfo, PSUInfo, CaseInfo, CoolerInfo
)


class PartsDataLoader:
    """부품 데이터 로더 (CSV 또는 샘플 데이터)"""
    
    _cached_parts = None  # 캐시
    
    @staticmethod
    def load_all_parts() -> Tuple[List, List, List, List, List, List, List]:
        """모든 부품 데이터 로드 (CSV 우선, 없으면 샘플)"""
        
        # 캐시 확인
        if PartsDataLoader._cached_parts:
            return PartsDataLoader._cached_parts
        
        # CSV 파일 경로
        csv_path = Path(__file__).parent.parent.parent.parent / "scripts" / "seed" / "products_2026-04-08.csv"
        
        # CSV에서 로드 시도
        if csv_path.exists():
            try:
                from app.services.csv_parser import load_parts_from_csv
                cpus, mainboards, rams, gpus, psus, cases, coolers = load_parts_from_csv(str(csv_path))
                
                # CSV에서 최소 부품이 있으면 사용
                if cpus or mainboards or gpus:
                    # 각 카테고리별로 최소 데이터가 있으면 사용
                    if not cpus:
                        cpus = SamplePartsDatabase.get_cpus()
                    if not mainboards:
                        mainboards = SamplePartsDatabase.get_mainboards()
                    if not rams:
                        rams = SamplePartsDatabase.get_rams()
                    if not gpus:
                        gpus = SamplePartsDatabase.get_gpus()
                    if not psus:
                        psus = SamplePartsDatabase.get_psus()
                    if not cases:
                        cases = SamplePartsDatabase.get_cases()
                    if not coolers:
                        coolers = SamplePartsDatabase.get_coolers()
                    
                    result = (cpus, mainboards, rams, gpus, psus, cases, coolers)
                    PartsDataLoader._cached_parts = result
                    return result
            except Exception as e:
                print(f"CSV 로드 오류, 샘플 데이터 사용: {e}")
        
        # CSV 없으면 샘플 데이터 사용
        result = (
            SamplePartsDatabase.get_cpus(),
            SamplePartsDatabase.get_mainboards(),
            SamplePartsDatabase.get_rams(),
            SamplePartsDatabase.get_gpus(),
            SamplePartsDatabase.get_psus(),
            SamplePartsDatabase.get_cases(),
            SamplePartsDatabase.get_coolers()
        )
        PartsDataLoader._cached_parts = result
        return result


class SamplePartsDatabase:
    """메모리 기반 샘플 부품 데이터베이스"""
    
    @staticmethod
    def get_cpus() -> list:
        """샘플 CPU 목록"""
        return [
            CPUInfo(
                id="cpu_001",
                name="Intel Core i5-13600K",
                category="cpu",
                price=330000,
                manufacturer="Intel",
                model="i5-13600K",
                stock=5,
                socket="LGA1700",
                brand="intel",
                cores=14,
                threads=20,
                base_clock=3.0,
                boost_clock=5.1,
                tdp=125,
                gen=13,
                performance_score=75.0
            ),
            CPUInfo(
                id="cpu_002",
                name="Intel Core i7-13700K",
                category="cpu",
                price=500000,
                manufacturer="Intel",
                model="i7-13700K",
                stock=3,
                socket="LGA1700",
                brand="intel",
                cores=16,
                threads=24,
                base_clock=3.4,
                boost_clock=5.4,
                tdp=125,
                gen=13,
                performance_score=85.0
            ),
            CPUInfo(
                id="cpu_003",
                name="AMD Ryzen 5 7600X",
                category="cpu",
                price=320000,
                manufacturer="AMD",
                model="Ryzen 5 7600X",
                stock=4,
                socket="AM5",
                brand="amd",
                cores=6,
                threads=12,
                base_clock=4.7,
                boost_clock=5.3,
                tdp=105,
                gen=7,
                performance_score=70.0
            ),
            CPUInfo(
                id="cpu_004",
                name="AMD Ryzen 7 7700X",
                category="cpu",
                price=480000,
                manufacturer="AMD",
                model="Ryzen 7 7700X",
                stock=2,
                socket="AM5",
                brand="amd",
                cores=8,
                threads=16,
                base_clock=4.5,
                boost_clock=5.4,
                tdp=105,
                gen=7,
                performance_score=82.0
            ),
        ]
    
    @staticmethod
    def get_mainboards() -> list:
        """샘플 메인보드 목록"""
        return [
            MainboardInfo(
                id="mb_001",
                name="MSI MPG Z790 Edge WiFi",
                category="mainboard",
                price=350000,
                manufacturer="MSI",
                model="MPG Z790 Edge WiFi",
                stock=4,
                socket="LGA1700",
                chipset="Z790",
                ddr_type="DDR5",
                form_factor="ATX",
                max_memory=192,
                rating=4.7
            ),
            MainboardInfo(
                id="mb_002",
                name="ASUS ROG STRIX B760-I",
                category="mainboard",
                price=280000,
                manufacturer="ASUS",
                model="ROG STRIX B760-I",
                stock=3,
                socket="LGA1700",
                chipset="B760",
                ddr_type="DDR5",
                form_factor="Mini-ITX",
                max_memory=192,
                rating=4.5
            ),
            MainboardInfo(
                id="mb_003",
                name="ASUS ROG STRIX X870-E",
                category="mainboard",
                price=420000,
                manufacturer="ASUS",
                model="ROG STRIX X870-E",
                stock=2,
                socket="AM5",
                chipset="X870",
                ddr_type="DDR5",
                form_factor="ATX",
                max_memory=192,
                rating=4.8
            ),
            MainboardInfo(
                id="mb_004",
                name="MSI B850-E Carbon WiFi",
                category="mainboard",
                price=380000,
                manufacturer="MSI",
                model="B850-E Carbon WiFi",
                stock=3,
                socket="AM5",
                chipset="B850",
                ddr_type="DDR5",
                form_factor="ATX",
                max_memory=192,
                rating=4.6
            ),
        ]
    
    @staticmethod
    def get_rams() -> list:
        """샘플 메모리 목록"""
        return [
            RAMInfo(
                id="ram_001",
                name="Corsair Vengeance DDR5 16GB",
                category="ram",
                price=90000,
                manufacturer="Corsair",
                model="CMK16GX5M1B6000C30",
                stock=10,
                capacity=16,
                ddr_type="DDR5",
                speed=6000,
                modules=1
            ),
            RAMInfo(
                id="ram_002",
                name="Samsung DDR5 32GB (16GBx2)",
                category="ram",
                price=180000,
                manufacturer="Samsung",
                model="M321R16GA00-CQKDE",
                stock=6,
                capacity=16,
                ddr_type="DDR5",
                speed=7200,
                modules=2
            ),
            RAMInfo(
                id="ram_003",
                name="G.SKILL Trident Z5 RGB 32GB",
                category="ram",
                price=200000,
                manufacturer="G.SKILL",
                model="F5-6000J3038F16GX2-TZ5R",
                stock=5,
                capacity=16,
                ddr_type="DDR5",
                speed=6000,
                modules=2
            ),
        ]
    
    @staticmethod
    def get_gpus() -> list:
        """샘플 그래픽카드 목록"""
        return [
            GPUInfo(
                id="gpu_001",
                name="NVIDIA RTX 4070 SUPER",
                category="gpu",
                price=850000,
                manufacturer="NVIDIA",
                model="RTX 4070 SUPER",
                stock=3,
                brand="nvidia",
                memory=12,
                length=320,
                power_requirement=220,
                tdp=220,
                performance_score=80.0
            ),
            GPUInfo(
                id="gpu_002",
                name="NVIDIA RTX 4080",
                category="gpu",
                price=1350000,
                manufacturer="NVIDIA",
                model="RTX 4080",
                stock=2,
                brand="nvidia",
                memory=16,
                length=330,
                power_requirement=320,
                tdp=320,
                performance_score=92.0
            ),
            GPUInfo(
                id="gpu_003",
                name="AMD Radeon RX 7700 XT",
                category="gpu",
                price=650000,
                manufacturer="AMD",
                model="Radeon RX 7700 XT",
                stock=4,
                brand="amd",
                memory=12,
                length=310,
                power_requirement=250,
                tdp=250,
                performance_score=78.0
            ),
            GPUInfo(
                id="gpu_004",
                name="NVIDIA RTX 4060 Ti",
                category="gpu",
                price=550000,
                manufacturer="NVIDIA",
                model="RTX 4060 Ti",
                stock=5,
                brand="nvidia",
                memory=8,
                length=290,
                power_requirement=150,
                tdp=150,
                performance_score=65.0
            ),
        ]
    
    @staticmethod
    def get_psus() -> list:
        """샘플 파워서플라이 목록"""
        return [
            PSUInfo(
                id="psu_001",
                name="Corsair RM850x (2021)",
                category="psu",
                price=180000,
                manufacturer="Corsair",
                model="RM850x",
                stock=5,
                wattage=850,
                efficiency="80+ Gold",
                modular="full"
            ),
            PSUInfo(
                id="psu_002",
                name="Seasonic Focus GX-1000",
                category="psu",
                price=210000,
                manufacturer="Seasonic",
                model="Focus GX-1000",
                stock=3,
                wattage=1000,
                efficiency="80+ Gold",
                modular="full"
            ),
            PSUInfo(
                id="psu_003",
                name="EVGA SuperNOVA 750 GT",
                category="psu",
                price=130000,
                manufacturer="EVGA",
                model="SuperNOVA 750 GT",
                stock=6,
                wattage=750,
                efficiency="80+ Gold",
                modular="full"
            ),
            PSUInfo(
                id="psu_004",
                name="Corsair RM650x (2021)",
                category="psu",
                price=130000,
                manufacturer="Corsair",
                model="RM650x",
                stock=4,
                wattage=650,
                efficiency="80+ Gold",
                modular="full"
            ),
        ]
    
    @staticmethod
    def get_cases() -> list:
        """샘플 케이스 목록"""
        return [
            CaseInfo(
                id="case_001",
                name="Lian Li O11 Dynamic",
                category="case",
                price=180000,
                manufacturer="Lian Li",
                model="O11 Dynamic",
                stock=4,
                form_factor="Mid-Tower",
                gpu_clearance=430,
                cpu_cooler_clearance=180,
                power_support="ATX",
                rating=4.8
            ),
            CaseInfo(
                id="case_002",
                name="Corsair Crystal 570X",
                category="case",
                price=200000,
                manufacturer="Corsair",
                model="Crystal 570X",
                stock=3,
                form_factor="Mid-Tower",
                gpu_clearance=370,
                cpu_cooler_clearance=170,
                power_support="ATX",
                rating=4.6
            ),
            CaseInfo(
                id="case_003",
                name="NZXT H7 Flow",
                category="case",
                price=150000,
                manufacturer="NZXT",
                model="H7 Flow",
                stock=5,
                form_factor="Mid-Tower",
                gpu_clearance=410,
                cpu_cooler_clearance=160,
                power_support="ATX",
                rating=4.5
            ),
            CaseInfo(
                id="case_004",
                name="Fractal Design Meshify C",
                category="case",
                price=140000,
                manufacturer="Fractal Design",
                model="Meshify C",
                stock=6,
                form_factor="Mid-Tower",
                gpu_clearance=390,
                cpu_cooler_clearance=175,
                power_support="ATX",
                rating=4.7
            ),
        ]
    
    @staticmethod
    def get_coolers() -> list:
        """샘플 CPU 쿨러 목록"""
        return [
            CoolerInfo(
                id="cooler_001",
                name="Noctua NH-D15 chromax.black",
                category="cooler",
                price=120000,
                manufacturer="Noctua",
                model="NH-D15 chromax.black",
                stock=4,
                socket_support=["LGA1700", "LGA1200", "AM5", "AM4"],
                max_height=165
            ),
            CoolerInfo(
                id="cooler_002",
                name="Be Quiet! Dark Rock Pro 4",
                category="cooler",
                price=90000,
                manufacturer="Be Quiet!",
                model="Dark Rock Pro 4",
                stock=5,
                socket_support=["LGA1700", "LGA1200", "AM5", "AM4"],
                max_height=162
            ),
            CoolerInfo(
                id="cooler_003",
                name="Corsair H150i Elite Capellix",
                category="cooler",
                price=150000,
                manufacturer="Corsair",
                model="H150i Elite Capellix",
                stock=3,
                socket_support=["LGA1700", "LGA1200", "AM5", "AM4"],
                max_height=120
            ),
            CoolerInfo(
                id="cooler_004",
                name="Arctic Liquid Freezer II 240",
                category="cooler",
                price=100000,
                manufacturer="Arctic",
                model="Liquid Freezer II 240",
                stock=4,
                socket_support=["LGA1700", "LGA1200", "AM5", "AM4"],
                max_height=119
            ),
        ]
