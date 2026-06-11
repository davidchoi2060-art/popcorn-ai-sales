"""
데이터베이스 연결 테스트 API
PostgreSQL 데이터베이스 연결 상태 확인, 테이블 목록 및 데이터 조회
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import create_engine, text, inspect
from typing import Optional
import os

router = APIRouter(prefix="/db-test", tags=["DB 연결 테스트"])


class DBConnectionRequest(BaseModel):
    """DB 연결 요청 스키마"""
    host: str = "localhost"
    port: int = 5432
    database: str = "popcorn_pc"
    username: str = "postgres"
    password: str = ""
    sslmode: str = "disable"
    table_name: str | None = None
    limit: int = 100
    offset: int = 0


class DBConnectionResponse(BaseModel):
    """DB 연결 응답 스키마"""
    success: bool
    message: str
    server_version: str | None = None
    current_database: str | None = None
    current_user: str | None = None
    error: str | None = None


class TableInfo(BaseModel):
    """테이블 정보 스키마"""
    name: str
    table_schema: str = "public"
    row_count: int


class TableListResponse(BaseModel):
    """테이블 목록 응답 스키마"""
    success: bool
    tables: list[TableInfo]
    total_count: int
    error: str | None = None


class ColumnInfo(BaseModel):
    """컬럼 정보 스키마"""
    name: str
    type: str
    nullable: bool
    default: str | None = None


class TableDataRequest(BaseModel):
    """테이블 데이터 조회 요청 스키마"""
    host: str = "localhost"
    port: int = 5432
    database: str = "popcorn_pc"
    username: str = "postgres"
    password: str = ""
    sslmode: str = "disable"
    table_name: str
    limit: int = 100
    offset: int = 0


class TableDataResponse(BaseModel):
    """테이블 데이터 조회 응답 스키마"""
    success: bool
    table_name: str
    columns: list[ColumnInfo]
    rows: list[dict]
    total_count: int
    row_count: int
    error: str | None = None


def create_db_engine(config: dict):
    """데이터베이스 엔진 생성"""
    connection_string = (
        f"postgresql://{config['username']}:{config['password']}"
        f"@{config['host']}:{config['port']}/{config['database']}"
        f"?sslmode={config.get('sslmode', 'disable')}"
    )
    return create_engine(
        connection_string,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 10}
    )


@router.post("/connect", response_model=DBConnectionResponse)
async def test_connection(config: DBConnectionRequest):
    """
    PostgreSQL 데이터베이스 연결 테스트

    - **host**: 데이터베이스 호스트 (기본값: localhost)
    - **port**: 데이터베이스 포트 (기본값: 5432)
    - **database**: 데이터베이스 이름
    - **username**: 데이터베이스 사용자명
    - **password**: 데이터베이스 비밀번호
    - **sslmode**: SSL 모드 (기본값: disable)
    """
    engine = None
    try:
        # 데이터베이스 엔진 생성
        config_dict = config.model_dump()
        engine = create_db_engine(config_dict)

        # 연결 테스트 (실제 쿼리 실행)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version_row = result.fetchone()
            server_version = version_row[0] if version_row else None

            result = conn.execute(text("SELECT current_database()"))
            db_row = result.fetchone()
            current_database = db_row[0] if db_row else None

            result = conn.execute(text("SELECT current_user"))
            user_row = result.fetchone()
            current_user = user_row[0] if user_row else None

        return DBConnectionResponse(
            success=True,
            message="✅ PostgreSQL 연결 성공!",
            server_version=server_version,
            current_database=current_database,
            current_user=current_user
        )

    except Exception as e:
        error_message = str(e)

        # 일반적인 연결 오류 메시지 정리
        if "password authentication failed" in error_message:
            detail = "❌ 인증 실패: 비밀번호가 일치하지 않습니다."
        elif "does not exist" in error_message:
            detail = "❌ 데이터베이스가 존재하지 않습니다."
        elif "connection refused" in error_message:
            detail = "❌ 연결 거부: PostgreSQL 서버가 실행 중인지 확인하세요."
        elif "could not connect to server" in error_message:
            detail = "❌ 서버 연결 실패: 호스트/포트를 확인하세요."
        else:
            detail = f"❌ 연결 실패: {error_message}"

        return DBConnectionResponse(
            success=False,
            message=detail,
            error=error_message
        )

    finally:
        # 엔진 정리
        if engine:
            engine.dispose()


@router.post("/tables", response_model=TableListResponse)
async def get_tables(config: DBConnectionRequest):
    """
    PostgreSQL 데이터베이스의 테이블 목록 조회

    - public 스키마와 커스텀 스키마의 테이블을 모두 반환합니다
    - 각 테이블의 행 수(count)도 함께 조회합니다
    """
    engine = None
    try:
        config_dict = config.model_dump()
        engine = create_db_engine(config_dict)

        with engine.connect() as conn:
            # 테이블 목록 및 행 수 조회 ( INFORMATION_SCHEMA 사용)
            query = text("""
                SELECT
                    t.table_name,
                    t.table_schema,
                    COALESCE(cc.row_count, 0) as row_count
                FROM information_schema.tables t
                LEFT JOIN (
                    SELECT
                        c.relname as table_name,
                        n.nspname as table_schema,
                        c.reltuples::bigint as row_count
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'r'
                    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
                ) cc ON cc.table_name = t.table_name AND cc.table_schema = t.table_schema
                WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
                AND t.table_type = 'BASE TABLE'
                ORDER BY t.table_schema, t.table_name
            """)

            result = conn.execute(query)
            rows = result.fetchall()

            tables = [
                TableInfo(
                    name=row[0],
                    table_schema=row[1],
                    row_count=row[2]
                )
                for row in rows
            ]

        return TableListResponse(
            success=True,
            tables=tables,
            total_count=len(tables)
        )

    except Exception as e:
        return TableListResponse(
            success=False,
            tables=[],
            total_count=0,
            error=str(e)
        )

    finally:
        if engine:
            engine.dispose()


@router.post("/table-data", response_model=TableDataResponse)
async def get_table_data(config: DBConnectionRequest):
    """
    PostgreSQL 테이블의 데이터 조회

    - **table_name**: 조회할 테이블 이름
    - **limit**: 반환할 행 수 (기본값: 100)
    - **offset**: 건너뛸 행 수 (기본값: 0)
    """
    engine = None
    try:
        if not config.table_name:
            return TableDataResponse(
                success=False,
                table_name="",
                columns=[],
                rows=[],
                total_count=0,
                row_count=0,
                error="table_name이 필요합니다."
            )

        config_dict = config.model_dump()
        table_name = config_dict['table_name']
        limit = config_dict.get('limit', 100)
        offset = config_dict.get('offset', 0)

        engine = create_db_engine(config_dict)

        with engine.connect() as conn:
            # 테이블 존재 여부 확인
            check_query = text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = :table_name
                )
            """)
            exists_result = conn.execute(check_query, {"table_name": table_name})
            if not exists_result.fetchone()[0]:
                return TableDataResponse(
                    success=False,
                    table_name=table_name,
                    columns=[],
                    rows=[],
                    total_count=0,
                    row_count=0,
                    error=f"테이블 '{table_name}'이(가) 존재하지 않습니다."
                )

            # 컬럼 정보 조회
            columns_query = text("""
                SELECT
                    column_name,
                    data_type,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = :table_name
                ORDER BY ordinal_position
            """)
            columns_result = conn.execute(columns_query, {"table_name": table_name})
            columns = [
                ColumnInfo(
                    name=row[0],
                    type=row[1],
                    nullable=(row[2] == 'YES'),
                    default=row[3]
                )
                for row in columns_result.fetchall()
            ]

            # 전체 행 수 조회
            count_query = text(f'SELECT COUNT(*) FROM "{table_name}"')
            count_result = conn.execute(count_query)
            total_count = count_result.fetchone()[0]

            # 데이터 조회 (SQL 인젝션 방지 위해 테이블명 이스케이프)
            # 먼저 컬럼 순서 확인 후 데이터 조회
            col_order_query = text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = :table_name
                ORDER BY ordinal_position
            """)
            col_result = conn.execute(col_order_query, {"table_name": table_name})
            column_names = [row[0] for row in col_result.fetchall()]

            data_query = text(f'SELECT * FROM "{table_name}" LIMIT :limit OFFSET :offset')
            data_result = conn.execute(data_query, {"limit": limit, "offset": offset})
            raw_rows = data_result.fetchall()

            # 행 데이터 매핑
            rows = [
                {column_names[i]: row[i] for i in range(len(column_names))}
                for row in raw_rows
            ]

        return TableDataResponse(
            success=True,
            table_name=table_name,
            columns=columns,
            rows=rows,
            total_count=total_count,
            row_count=len(rows)
        )

    except Exception as e:
        return TableDataResponse(
            success=False,
            table_name=table_name,
            columns=[],
            rows=[],
            total_count=0,
            row_count=0,
            error=str(e)
        )

    finally:
        if engine:
            engine.dispose()


@router.get("/health")
async def db_health_check():
    """기본 DB 연결 상태 확인 (환경 변수 사용)"""
    from app.core.database import engine

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), current_user"))
            row = result.fetchone()

        return {
            "status": "healthy",
            "database": row[0] if row else None,
            "user": row[1] if row else None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }