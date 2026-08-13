@echo off
title Hospital Management System - Launcher
echo ============================================
echo   Hospital Management System - Starting...
echo ============================================
echo.

:: Start the Spring Boot backend in a new window
echo [1/2] Starting Backend (Spring Boot on port 8080)...
start "HMS Backend - Port 8080" cmd /k "cd /d "%~dp0hospital-management-backend" && mvn spring-boot:run"

:: Wait a few seconds to let backend begin initializing
echo      Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start the Vite frontend in a new window
echo [2/2] Starting Frontend (Vite on port 5174)...
start "HMS Frontend - Port 5174" cmd /k "cd /d "%~dp0hospital-management-frontend" && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5174
echo ============================================
echo.
echo You can close this window. The servers run
echo in their own separate windows.
echo.
pause
