@echo off
title MANE - Baslatiliyor...
cd /d "c:\Users\Şeyma Nur\Desktop\Mane\mane-app"
echo.
echo  ===================================================
echo   MANE Sunucu baslatiliyor... (port 3001)
echo  ===================================================
start "MANE Sunucu" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
echo.
echo  ===================================================
echo   MANE uygulamasi aciliyor...
echo  ===================================================
npm run dev
