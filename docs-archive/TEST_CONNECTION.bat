@echo off
echo ========================================
echo  GrocerSmart AI - Connection Test
echo ========================================
echo.

echo [1/3] Testing Database Connection...
mysql -u root -proot -e "USE grocersmart; SELECT 'Database Connected!' as Status;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database is connected
) else (
    echo [ERROR] Database connection failed
    goto :end
)
echo.

echo [2/3] Testing Backend API...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/status' -ErrorAction Stop; Write-Host '[OK] Backend API is responding' } catch { Write-Host '[ERROR] Backend API not responding'; exit 1 }"
if %ERRORLEVEL% NEQ 0 goto :end
echo.

echo [3/3] Testing Login Endpoint...
powershell -Command "$body = '{\"username\":\"VTNV\",\"password\":\"vtnv\"}'; try { $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -ErrorAction Stop; Write-Host '[OK] Login successful - Token received'; Write-Host '     Username:' $response.data.username; Write-Host '     Role:' $response.data.role } catch { Write-Host '[ERROR] Login failed'; exit 1 }"
if %ERRORLEVEL% NEQ 0 goto :end
echo.

echo ========================================
echo  ALL CONNECTIONS VERIFIED!
echo ========================================
echo.
echo  Database: MySQL (localhost:3306)
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:5173
echo.
echo  Login: VTNV / vtnv
echo.
echo ========================================
goto :success

:end
echo.
echo ========================================
echo  CONNECTION TEST FAILED
echo ========================================
echo.
echo Please ensure:
echo  1. MySQL is running
echo  2. Backend is running (mvn spring-boot:run)
echo  3. Frontend is running (npm run dev)
echo.
pause
exit /b 1

:success
pause
exit /b 0
