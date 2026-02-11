# GrocerSmart AI - Startup Script
Write-Host '🚀 Starting GrocerSmart AI...' -ForegroundColor Cyan
Write-Host ''

# Start Backend
Write-Host '📦 Starting Backend (Spring Boot)...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\Dell\Desktop\Retail\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Green; mvn spring-boot:run"

# Wait a bit for backend to initialize
Write-Host '⏳ Waiting for backend to initialize...' -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start Frontend
Write-Host '🎨 Starting Frontend (React + Vite)...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\Dell\Desktop\Retail\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Green; npm run dev"

Write-Host ''
Write-Host '✅ GrocerSmart AI is starting up!' -ForegroundColor Green
Write-Host ''
Write-Host '📍 Access Points:' -ForegroundColor Cyan
Write-Host '   Frontend:  http://localhost:5173' -ForegroundColor White
Write-Host '   Backend:   http://localhost:8080' -ForegroundColor White
Write-Host '   Swagger:   http://localhost:8080/swagger-ui/index.html' -ForegroundColor White
Write-Host ''
Write-Host '🔐 Default Login:' -ForegroundColor Cyan
Write-Host '   Username: VTNV' -ForegroundColor White
Write-Host '   Password: vtnv' -ForegroundColor White
Write-Host ''
