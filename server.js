const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// CORS 허용 (브라우저와 백엔드 간 통신용 허락)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// 우분투 PostgreSQL DB 접속 정보 주입
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: '1234qwer', // 성공하셨던 비밀번호
    port: 5433,           // 찾으셨던 진짜 DB 포트
});

// DB 연결 테스트 API 경로
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as db_time;');
        res.json({
            status: "Success",
            message: "우분투 PostgreSQL DB와 완벽하게 연결되었습니다!",
            dbTime: result.rows[0].db_time
        });
    } catch (err) {
        res.status(500).json({ status: "Error", message: err.message });
    }
});

app.listen(port, () => {
    console.log(`통역사(백엔드)가 ${port}번 포트에서 일을 시작했습니다!`);
});
