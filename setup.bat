@echo off
cd /d "%~dp0"
call npm install || goto fail
call npx playwright install chromium || goto fail
echo Setup complete. Install FFmpeg separately and add it to PATH.
pause
exit /b 0
:fail
echo Setup failed.
pause
exit /b 1
