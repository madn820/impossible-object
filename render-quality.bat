@echo off
cd /d "%~dp0"
call node scripts/render.js --quality
pause
