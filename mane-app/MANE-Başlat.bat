@echo off
chcp 65001 >nul
cd /d "C:\Users\Şeyma Nur\Desktop\Mane\mane-app"

echo [1/2] Sunucu baslatiliyor...
start "MANE-Sunucu" /min cmd /k "node server.js"

echo [2/2] Sunucunun ayaga kalkması icin bekleniyor...
timeout /t 4 /nobreak >nul

echo [3/3] Uygulama aciliyor...
npm run dev
