"""
CSV 데이터 → PostgreSQL 데이터베이스 마이그레이션
products_2026-04-08.csv를 읽어서 DB에 적재
"""

import csv
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

# 경로 설정
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import SessionLocal, engine, Base
from app.models import (
    CPUModel, MainboardModel, RAMModel, GPUModel,
    PSUModel, CaseModel, CoolerModel
)
from app.services.csv_parser import CSVPartParser


def clear_all_tables(db: Session):
    """모든 데이터 테이블 초기화"""
    db.query(CPUModel).delete()
    db.query(MainboardModel).delete()
    db.query(RAMModel).delete()
    db.query(GPUModel).delete()
    db.query(PSUModel).delete()
    db.query(CaseModel).delete()
    db.query(CoolerModel).delete()
    db.commit()
    print("✅ 기존 데이터 초기화 완료")


def load_cpus_to_db(cpus: list, db: Session):
    """CPU 데이터 DB에 저장"""
    for cpu in cpus:
        model = CPUModel(
            id=cpu.id,
            brand=cpu.brand,
            model=cpu.model,
            socket=cpu.socket,
            cores=cpu.cores,
            threads=cpu.threads,
            base_clock=cpu.base_clock,
            boost_clock=cpu.boost_clock,
            tdp=cpu.tdp,
            price=cpu.price,
            stock=cpu.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ CPU {len(cpus)}개 저장 완료")


def load_mainboards_to_db(boards: list, db: Session):
    """메인보드 데이터 DB에 저장"""
    for board in boards:
        model = MainboardModel(
            id=board.id,
            brand=board.brand,
            model=board.model,
            socket=board.socket,
            chipset=board.chipset,
            ddr_type=board.ddr_type,
            form_factor=board.form_factor,
            ram_slots=board.ram_slots,
            max_ram_gb=board.max_ram_gb,
            price=board.price,
            stock=board.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ 메인보드 {len(boards)}개 저장 완료")


def load_rams_to_db(rams: list, db: Session):
    """메모리 데이터 DB에 저장"""
    for ram in rams:
        model = RAMModel(
            id=ram.id,
            brand=ram.brand,
            model=ram.model,
            capacity_gb=ram.capacity_gb,
            ddr_type=ram.ddr_type,
            speed_mhz=ram.speed_mhz,
            latency=ram.latency,
            modules=ram.modules,
            price=ram.price,
            stock=ram.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ 메모리 {len(rams)}개 저장 완료")


def load_gpus_to_db(gpus: list, db: Session):
    """그래픽카드 데이터 DB에 저장"""
    for gpu in gpus:
        model = GPUModel(
            id=gpu.id,
            brand=gpu.brand,
            model=gpu.model,
            memory_gb=gpu.memory_gb,
            memory_type=gpu.memory_type,
            power_requirement=gpu.power_requirement,
            length_mm=gpu.length_mm,
            price=gpu.price,
            stock=gpu.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ 그래픽카드 {len(gpus)}개 저장 완료")


def load_psus_to_db(psus: list, db: Session):
    """파워서플라이 데이터 DB에 저장"""
    for psu in psus:
        model = PSUModel(
            id=psu.id,
            brand=psu.brand,
            model=psu.model,
            wattage=psu.wattage,
            efficiency_rating=psu.efficiency_rating,
            modular=psu.modular,
            fanless=psu.fanless,
            price=psu.price,
            stock=psu.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ 파워서플라이 {len(psus)}개 저장 완료")


def load_cases_to_db(cases: list, db: Session):
    """케이스 데이터 DB에 저장"""
    for case in cases:
        model = CaseModel(
            id=case.id,
            brand=case.brand,
            model=case.model,
            form_factor=case.form_factor,
            gpu_max_length_mm=case.gpu_max_length_mm,
            cooler_max_height_mm=case.cooler_max_height_mm,
            color=case.color,
            price=case.price,
            stock=case.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ 케이스 {len(cases)}개 저장 완료")


def load_coolers_to_db(coolers: list, db: Session):
    """쿨러 데이터 DB에 저장"""
    for cooler in coolers:
        model = CoolerModel(
            id=cooler.id,
            brand=cooler.brand,
            model=cooler.model,
            type=cooler.type,
            sockets=cooler.sockets,
            max_height_mm=cooler.max_height_mm,
            price=cooler.price,
            stock=cooler.stock_count,
        )
        db.merge(model)
    db.commit()
    print(f"✅ 쿨러 {len(coolers)}개 저장 완료")


def migrate_csv_to_db(csv_path: str):
    """메인 마이그레이션 함수"""
    db = SessionLocal()
    try:
        print(f"🔄 CSV 파일 로드 중: {csv_path}")
        
        # CSV 파서 실행
        parser = CSVPartParser()
        cpus, mainboards, rams, gpus, psus, cases, coolers = parser.load_parts_from_csv(csv_path)
        
        print(f"📊 파싱된 데이터:")
        print(f"  - CPU: {len(cpus)}")
        print(f"  - 메인보드: {len(mainboards)}")
        print(f"  - 메모리: {len(rams)}")
        print(f"  - 그래픽카드: {len(gpus)}")
        print(f"  - 파워서플라이: {len(psus)}")
        print(f"  - 케이스: {len(cases)}")
        print(f"  - 쿨러: {len(coolers)}")
        
        # 기존 데이터 초기화 (선택사항)
        clear_all_tables(db)
        
        # DB에 저장
        if cpus:
            load_cpus_to_db(cpus, db)
        if mainboards:
            load_mainboards_to_db(mainboards, db)
        if rams:
            load_rams_to_db(rams, db)
        if gpus:
            load_gpus_to_db(gpus, db)
        if psus:
            load_psus_to_db(psus, db)
        if cases:
            load_cases_to_db(cases, db)
        if coolers:
            load_coolers_to_db(coolers, db)
        
        print("✅ 모든 데이터 마이그레이션 완료!")
        
    except Exception as e:
        print(f"❌ 마이그레이션 오류: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # 데이터베이스 테이블 생성
    print("🔨 데이터베이스 테이블 생성 중...")
    Base.metadata.create_all(bind=engine)
    print("✅ 테이블 생성 완료")
    
    # CSV 파일 경로
    csv_path = Path(__file__).parent.parent.parent.parent / "scripts" / "seed" / "products_2026-04-08.csv"
    
    if csv_path.exists():
        migrate_csv_to_db(str(csv_path))
    else:
        print(f"⚠️ CSV 파일을 찾을 수 없음: {csv_path}")
        print("📝 스크립트를 통해 샘플 데이터를 로드하려면:")
        print(f"   python scripts/migrate_csv_to_db.py")
