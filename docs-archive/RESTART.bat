@echo off
echo ========================================
echo  GrocerSmart AI - Clean Restart
echo ========================================
echo.

echo [1/4] Stopping all Java processes...
taskkill /F /IM java.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [3/4] Starting Backend (Port 8080)...
start "GrocerSmart Backend" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [4/4] Starting Frontend (Port 5173)...
start "GrocerSmart Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo  Services Starting...
echo ========================================
echo.
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8080
echo  Swagger:  http://localhost:8080/swagger-ui/index.html
echo.
echo  Login: VTNV / vtnv
echo.
echo ========================================
pause
