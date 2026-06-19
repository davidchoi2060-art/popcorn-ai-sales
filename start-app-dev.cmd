@echo off
cd /d "%~dp0app"
"C:\Program Files\nodejs\npm.cmd" run dev -- --host 127.0.0.1 --port 5174
