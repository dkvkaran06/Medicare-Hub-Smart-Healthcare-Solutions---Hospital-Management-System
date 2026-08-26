@echo off
setlocal enableextensions
title Hospital Management System - Launcher
echo ============================================
echo   Hospital Management System - Starting...
echo ============================================
echo.

:: Start the Spring Boot backend in a new window
echo [1/2] Starting Backend (Spring Boot on port 8080)...
start "HMS Backend - Port 8080" cmd /k "cd /d "%~dp0hospital-management-backend" && mvn spring-boot:run"

:: Wait until the backend actually answers HTTP, instead of a fixed delay.
:: Spring Boot + Maven + MySQL can take 20-45s to cold start. The old flat
:: 5-second wait let the frontend open before the API was reachable, so early
:: form submits failed with "Registration failed. Please try again."
:: curl exits 0 as soon as the server responds (any status, even 404 = it's up),
:: and non-zero while the connection is still refused.
echo.
echo      Waiting for backend to become reachable at http://localhost:8080 ...
set /a attempt=0
set /a maxAttempts=90
:waitBackend
set /a attempt+=1
curl -s -o NUL --connect-timeout 2 --max-time 4 http://localhost:8080/healthz
if not errorlevel 1 goto backendReady
if %attempt% geq %maxAttempts% goto backendTimeout
<nul set /p "=."
timeout /t 2 /nobreak >nul
goto waitBackend

:backendTimeout
echo.
echo      [!] Backend did not respond after ~3 minutes.
echo          Starting the frontend anyway - check the backend window for errors.
goto startFrontend

:backendReady
echo.
echo      [OK] Backend is up and responding.

:startFrontend
:: Start the Vite frontend in a new window (Vite's default port is 5173)
echo.
echo [2/2] Starting Frontend (Vite on port 5173)...
start "HMS Frontend - Port 5173" cmd /k "cd /d "%~dp0hospital-management-frontend" && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo ============================================
echo.
echo You can close this window. The servers run
echo in their own separate windows.
echo.
pause
