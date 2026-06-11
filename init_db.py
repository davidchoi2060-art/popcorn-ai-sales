"""
간단한 데이터베이스 초기화 스크립트
"""

import sys
from pathlib import Path
import os

# 경로 설정
project_root = Path(os.getcwd())
apps_api = project_root / "apps" / "api"
sys.path.insert(0, str(apps_api))

# 환경 설정 로드
from dotenv import load_dotenv
load_dotenv(project_root / ".env")

# 모델 임포트 (테이블 정의 로드)
from app import models

# 데이터베이스 초기화
from app.core.database import Base, engine, SessionLocal

print("[*] Creating database tables...")
Base.metadata.create_all(bind=engine)
print("[OK] Tables created")

# CSV file exists?
csv_path = project_root / "scripts" / "seed" / "products_2026-04-08.csv"

if csv_path.exists():
    print(f"\n[*] CSV file found: {csv_path}")
    
    from app.services.csv_parser import load_parts_from_csv
    from app.models import (
        CPUModel, MainboardModel, RAMModel, GPUModel,
        PSUModel, CaseModel, CoolerModel
    )
    
    db = SessionLocal()
    
    try:
        cpus, mainboards, rams, gpus, psus, cases, coolers = load_parts_from_csv(str(csv_path))
        
        print(f"\n[*] Parsed data:")
        print(f"  - CPU: {len(cpus)}")
        print(f"  - Mainboards: {len(mainboards)}")
        print(f"  - RAM: {len(rams)}")
        print(f"  - GPU: {len(gpus)}")
        print(f"  - PSU: {len(psus)}")
        print(f"  - Cases: {len(cases)}")
        print(f"  - Coolers: {len(coolers)}")
        
        print("\n[*] Saving data...")
        
        for cpu in cpus:
            db.merge(CPUModel(
                id=cpu.id, brand=cpu.manufacturer, model=cpu.model,
                socket=cpu.socket, cores=cpu.cores, threads=cpu.threads,
                base_clock=float(cpu.base_clock), boost_clock=float(cpu.boost_clock),
                tdp=cpu.tdp, price=cpu.price, stock=cpu.stock
            ))
        
        for mb in mainboards:
            db.merge(MainboardModel(
                id=mb.id, brand=mb.manufacturer, model=mb.model,
                socket=mb.socket, chipset=mb.chipset, ddr_type=mb.ddr_type,
                form_factor=mb.form_factor, ram_slots=2,
                max_ram_gb=mb.max_memory, price=mb.price, stock=mb.stock
            ))
        
        for ram in rams:
            db.merge(RAMModel(
                id=ram.id, brand=ram.manufacturer, model=ram.model,
                capacity_gb=ram.capacity, ddr_type=ram.ddr_type,
                speed_mhz=ram.speed, latency=4.0,
                modules=ram.modules, price=ram.price, stock=ram.stock
            ))
        
        for gpu in gpus:
            db.merge(GPUModel(
                id=gpu.id, brand=gpu.manufacturer, model=gpu.model,
                memory_gb=gpu.memory, memory_type="GDDR6",
                power_requirement=gpu.power_requirement, length_mm=gpu.length,
                price=gpu.price, stock=gpu.stock
            ))
        
        for psu in psus:
            db.merge(PSUModel(
                id=psu.id, brand=psu.manufacturer, model=psu.model,
                wattage=psu.wattage, efficiency_rating="80+",
                modular=False, fanless=False,
                price=psu.price, stock=psu.stock
            ))
        
        for case in cases:
            db.merge(CaseModel(
                id=case.id, brand=case.manufacturer, model=case.model,
                form_factor=case.form_factor, gpu_max_length_mm=case.max_gpu_length,
                cooler_max_height_mm=case.max_cooler_height, color="Black",
                price=case.price, stock=case.stock
            ))
        
        for cooler in coolers:
            db.merge(CoolerModel(
                id=cooler.id, brand=cooler.manufacturer, model=cooler.model,
                type=cooler.cooler_type, sockets=cooler.supported_sockets,
                max_height_mm=cooler.height, price=cooler.price,
                stock=cooler.stock
            ))
        
        db.commit()
        print("[OK] Data saved")
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
    
    print("\n[OK] Database initialized!")
else:
    print(f"\n[WARNING] CSV file not found: {csv_path}")
    print("[INFO] Continuing with sample data only.")
