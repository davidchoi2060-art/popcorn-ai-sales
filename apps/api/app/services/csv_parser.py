"""
CSV 파일 파싱 및 부품 데이터 로드
실제 부품 정보를 CSV에서 추출하여 부품 객체로 변환
"""

import csv
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.schemas import (
    CPUInfo, MainboardInfo, RAMInfo, SSDInfo, GPUInfo, PSUInfo, CaseInfo, CoolerInfo
)


class CSVPartParser:
    """CSV 파일에서 부품 정보를 파싱"""
    
    # 카테고리 매핑
    CATEGORY_MAPPING = {
        "CPU(PROCESSOR)": "cpu",
        "메인보드": "mainboard",
        "메모리": "ram",
        "저장장치": "ssd",
        "그래픽카드": "gpu",
        "GPU": "gpu",
        "파워(POWER)": "psu",
        "파워": "psu",
        "케이스(CASE)": "case",
        "케이스": "case",
        "쿨러": "cooler",
        "CPU쿨러": "cooler",
    }
    
    @staticmethod
    def parse_csv(csv_path: str) -> Dict[str, List]:
        """CSV 파일을 파싱하여 부품 객체 리스트 반환"""
        parts_by_category = {
            "cpu": [],
            "mainboard": [],
            "ram": [],
            "ssd": [],
            "gpu": [],
            "psu": [],
            "case": [],
            "cooler": []
        }
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for idx, row in enumerate(reader):
                    if not row.get('상품명') or not row.get('카테고리2'):
                        continue
                    
                    category2 = row.get('카테고리2', '').strip()
                    category = CSVPartParser.CATEGORY_MAPPING.get(category2)
                    
                    if not category:
                        continue
                    
                    # 가격 추출
                    price = CSVPartParser._extract_price(row)
                    if price <= 0:
                        continue
                    
                    # 부품별 파싱
                    try:
                        if category == "cpu":
                            part = CSVPartParser._parse_cpu(row, idx)
                        elif category == "mainboard":
                            part = CSVPartParser._parse_mainboard(row, idx)
                        elif category == "ram":
                            part = CSVPartParser._parse_ram(row, idx)
                        elif category == "ssd":
                            part = CSVPartParser._parse_ssd(row, idx)
                        elif category == "gpu":
                            part = CSVPartParser._parse_gpu(row, idx)
                        elif category == "psu":
                            part = CSVPartParser._parse_psu(row, idx)
                        elif category == "case":
                            part = CSVPartParser._parse_case(row, idx)
                        elif category == "cooler":
                            part = CSVPartParser._parse_cooler(row, idx)
                        else:
                            continue
                        
                        if part:
                            parts_by_category[category].append(part)
                    except Exception as e:
                        # 파싱 오류는 무시하고 계속 진행
                        continue
        
        except Exception as e:
            print(f"CSV 파일 읽기 오류: {e}")
        
        return parts_by_category
    
    @staticmethod
    def _extract_price(row: Dict) -> int:
        """행에서 가격 추출"""
        for price_field in ['일반회원', '딜러Lv1', '시중가', '발주가']:
            try:
                price_str = row.get(price_field, '').strip()
                if price_str and price_str.isdigit():
                    return int(price_str)
            except:
                continue
        return 0
    
    @staticmethod
    def _extract_spec_value(spec_str: str, key: str, pattern: Optional[str] = None) -> Optional[str]:
        """스펙 문자열에서 특정 값 추출"""
        if not spec_str:
            return None
        
        # 기본 패턴
        if pattern:
            match = re.search(pattern, spec_str, re.IGNORECASE)
            if match:
                return match.group(1)
        
        # 키워드 기반 추출
        key_lower = key.lower()
        for part in spec_str.split('/'):
            part = part.strip()
            if key_lower in part.lower():
                # "소켓 : LGA1700" → "LGA1700"
                if ':' in part:
                    return part.split(':')[1].strip()
                # "LGA1700 소켓" 형태
                words = part.split()
                for word in words:
                    if word and not word.lower() in [key_lower, ':', '소켓', 'socket']:
                        return word
        
        return None
    
    # ========================================================================
    # CPU 파싱
    # ========================================================================
    @staticmethod
    def _parse_cpu(row: Dict, idx: int) -> Optional[CPUInfo]:
        """CPU 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 소켓 추출
        socket_patterns = [
            r'LGA\d+',
            r'AM\d',
            r'TR\d+',
        ]
        socket = None
        for pattern in socket_patterns:
            match = re.search(pattern, spec, re.IGNORECASE)
            if match:
                socket = match.group(0).upper()
                break
        
        if not socket:
            return None
        
        # 코어/스레드 추출
        cores_match = re.search(r'(\d+)\s*코어', spec)
        cores = int(cores_match.group(1)) if cores_match else 8
        
        threads_match = re.search(r'(\d+)\s*스레드', spec)
        threads = int(threads_match.group(1)) if threads_match else cores * 2
        
        # 브랜드 추출
        brand = "intel" if "intel" in product_name.lower() else \
                "amd" if "amd" in product_name.lower() or "ryzen" in product_name.lower() else "unknown"
        
        return CPUInfo(
            id=f"cpu_csv_{idx}",
            name=product_name,
            category="cpu",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=5,  # 기본값
            socket=socket,
            brand=brand,
            cores=cores,
            threads=threads,
            base_clock=2.5,  # 기본값
            boost_clock=4.5,  # 기본값
            tdp=65,  # 기본값
            gen=13,  # 기본값
            performance_score=70.0
        )
    
    # ========================================================================
    # 메인보드 파싱
    # ========================================================================
    @staticmethod
    def _parse_mainboard(row: Dict, idx: int) -> Optional[MainboardInfo]:
        """메인보드 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 소켓 추출
        socket_patterns = [
            r'LGA\d+',
            r'AM\d',
            r'TR\d+',
        ]
        socket = None
        for pattern in socket_patterns:
            match = re.search(pattern, spec, re.IGNORECASE)
            if match:
                socket = match.group(0).upper()
                break
        
        if not socket:
            return None
        
        # DDR 타입 추출
        ddr_match = re.search(r'DDR[45]', spec, re.IGNORECASE)
        ddr_type = ddr_match.group(0).upper() if ddr_match else "DDR5"
        
        # 폼팩터 추출
        form_factor = "ATX"
        if "mini-itx" in spec.lower() or "mini itx" in spec.lower():
            form_factor = "Mini-ITX"
        elif "micro-atx" in spec.lower() or "micro atx" in spec.lower():
            form_factor = "Micro-ATX"
        elif "e-atx" in spec.lower():
            form_factor = "E-ATX"
        
        return MainboardInfo(
            id=f"mb_csv_{idx}",
            name=product_name,
            category="mainboard",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=3,  # 기본값
            socket=socket,
            chipset="Z" + socket[-3:] if socket else "Z790",
            ddr_type=ddr_type,
            form_factor=form_factor,
            max_memory=192,
            rating=4.5
        )
    
    # ========================================================================
    # 메모리 파싱
    # ========================================================================
    @staticmethod
    def _parse_ram(row: Dict, idx: int) -> Optional[RAMInfo]:
        """메모리 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 용량 추출 (GB 단위)
        capacity_match = re.search(r'(\d+)\s*GB', spec, re.IGNORECASE)
        capacity = int(capacity_match.group(1)) if capacity_match else 16
        
        # 모듈 수 추출 (예: 16GBx2)
        modules_match = re.search(r'(\d+)GB\s*x\s*(\d+)', spec)
        modules = int(modules_match.group(2)) if modules_match else 1
        
        # DDR 타입 추출
        ddr_match = re.search(r'DDR[45]', spec, re.IGNORECASE)
        ddr_type = ddr_match.group(0).upper() if ddr_match else "DDR5"
        
        # 속도 추출 (MHz)
        speed_match = re.search(r'(\d{4,5})\s*MHz', spec)
        speed = int(speed_match.group(1)) if speed_match else 6000
        
        return RAMInfo(
            id=f"ram_csv_{idx}",
            name=product_name,
            category="ram",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=8,  # 기본값
            capacity=capacity,
            ddr_type=ddr_type,
            speed=speed,
            modules=modules
        )
    
    # ========================================================================
    # SSD 파싱
    # ========================================================================
    @staticmethod
    def _parse_ssd(row: Dict, idx: int) -> Optional[SSDInfo]:
        """SSD 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 용량 추출
        capacity_match = re.search(r'(\d+)GB', spec, re.IGNORECASE)
        capacity = int(capacity_match.group(1)) if capacity_match else 500
        
        # 폼팩터 추출
        form_factor = "M.2" if "M.2" in spec else "2.5\"" if "2.5" in spec else "M.2"
        
        # 읽기 속도 추출
        speed_match = re.search(r'(\d+)\s*MB/s', spec)
        speed = int(speed_match.group(1)) if speed_match else 3500
        
        return SSDInfo(
            id=f"ssd_csv_{idx}",
            name=product_name,
            category="ssd",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=10,  # 기본값
            capacity=capacity,
            speed_seq_read=speed,
            form_factor=form_factor
        )
    
    # ========================================================================
    # GPU 파싱
    # ========================================================================
    @staticmethod
    def _parse_gpu(row: Dict, idx: int) -> Optional[GPUInfo]:
        """그래픽카드 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 브랜드 추출
        brand = "nvidia" if "nvidia" in product_name.lower() or "rtx" in product_name.lower() or "gtx" in product_name.lower() else \
                "amd" if "amd" in product_name.lower() or "radeon" in product_name.lower() else "unknown"
        
        if brand == "unknown":
            return None
        
        # 메모리 용량 추출
        memory_match = re.search(r'(\d+)\s*GB', spec)
        memory = int(memory_match.group(1)) if memory_match else 8
        
        # 길이 추출 (mm)
        length = 300  # 기본값
        
        # 파워 요구사항 추출
        power_match = re.search(r'(\d+)\s*W', spec)
        power_requirement = int(power_match.group(1)) if power_match else 200
        
        return GPUInfo(
            id=f"gpu_csv_{idx}",
            name=product_name,
            category="gpu",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=4,  # 기본값
            brand=brand,
            memory=memory,
            length=length,
            power_requirement=power_requirement,
            tdp=power_requirement,
            performance_score=70.0
        )
    
    # ========================================================================
    # PSU 파싱
    # ========================================================================
    @staticmethod
    def _parse_psu(row: Dict, idx: int) -> Optional[PSUInfo]:
        """파워서플라이 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 정격출력 추출
        wattage_match = re.search(r'정격출력\s*:\s*(\d+)\(W\)', spec)
        if not wattage_match:
            wattage_match = re.search(r'(\d{3,4})\s*W', spec)
        wattage = int(wattage_match.group(1)) if wattage_match else 650
        
        # 효율 등급 추출
        efficiency = "80+ Gold"  # 기본값
        if "Platinum" in spec:
            efficiency = "80+ Platinum"
        elif "Gold" in spec:
            efficiency = "80+ Gold"
        elif "Silver" in spec:
            efficiency = "80+ Silver"
        elif "80+" in spec:
            efficiency = "80+"
        
        # 모듈러 여부
        modular = "full" if "풀" in spec or "full" in spec.lower() else "semi"
        
        return PSUInfo(
            id=f"psu_csv_{idx}",
            name=product_name,
            category="psu",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=5,  # 기본값
            wattage=wattage,
            efficiency=efficiency,
            modular=modular
        )
    
    # ========================================================================
    # 케이스 파싱
    # ========================================================================
    @staticmethod
    def _parse_case(row: Dict, idx: int) -> Optional[CaseInfo]:
        """케이스 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 폼팩터 추출
        form_factor = "Mid-Tower"
        if "미니" in spec or "mini" in spec.lower():
            form_factor = "Mini-Tower"
        elif "full" in spec.lower() or "풀" in spec:
            form_factor = "Full-Tower"
        
        # GPU 장착 길이 추출
        gpu_match = re.search(r'그래픽카드\s*장착\s*:\s*(\d+)\s*mm', spec)
        gpu_clearance = int(gpu_match.group(1)) if gpu_match else 370
        
        # CPU 쿨러 높이 추출
        cooler_match = re.search(r'CPU\s*쿨러\s*장착\s*:\s*CPU\s*쿨러높이:(\d+)mm', spec)
        cpu_cooler_clearance = int(cooler_match.group(1)) if cooler_match else 160
        
        # 파워 지원 추출
        power_support = "ATX"
        if "micro" in spec.lower() or "마이크로" in spec:
            power_support = "Micro-ATX"
        
        return CaseInfo(
            id=f"case_csv_{idx}",
            name=product_name,
            category="case",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=4,  # 기본값
            form_factor=form_factor,
            gpu_clearance=gpu_clearance,
            cpu_cooler_clearance=cpu_cooler_clearance,
            power_support=power_support,
            rating=4.5
        )
    
    # ========================================================================
    # 쿨러 파싱
    # ========================================================================
    @staticmethod
    def _parse_cooler(row: Dict, idx: int) -> Optional[CoolerInfo]:
        """CPU 쿨러 정보 파싱"""
        product_name = row.get('상품명', '').strip()
        if not product_name:
            return None
        
        spec = row.get('스펙', '')
        
        # 지원 소켓 추출
        socket_patterns = [
            r'LGA\d+',
            r'AM\d',
            r'TR\d+',
        ]
        socket_support = []
        for pattern in socket_patterns:
            matches = re.findall(pattern, spec, re.IGNORECASE)
            socket_support.extend([m.upper() for m in matches])
        
        # 기본 소켓 지원
        if not socket_support:
            socket_support = ["LGA1700", "AM5"]
        
        # 높이 추출
        height_match = re.search(r'높이\s*:\s*(\d+)\s*mm', spec)
        max_height = int(height_match.group(1)) if height_match else 160
        
        return CoolerInfo(
            id=f"cooler_csv_{idx}",
            name=product_name,
            category="cooler",
            price=CSVPartParser._extract_price(row),
            manufacturer=row.get('제조사', '').strip(),
            model=row.get('모델명', '').strip(),
            stock=6,  # 기본값
            socket_support=socket_support,
            max_height=max_height
        )


def load_parts_from_csv(csv_path: str) -> tuple:
    """CSV 파일에서 부품 데이터 로드"""
    parts_dict = CSVPartParser.parse_csv(csv_path)
    
    return (
        parts_dict.get("cpu", []),
        parts_dict.get("mainboard", []),
        parts_dict.get("ram", []),
        parts_dict.get("gpu", []),
        parts_dict.get("psu", []),
        parts_dict.get("case", []),
        parts_dict.get("cooler", [])
    )
