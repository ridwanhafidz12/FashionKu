@echo off
title CIRCULAI Web App
color 0A
echo ========================================================
echo             MEMULAI CIRCULAI WEB APP
echo ========================================================
echo.
cd /d "%~dp0"

if not exist "node_modules\" (
    echo [INFO] Folder node_modules belum ditemukan.
    echo Mengunduh dan menginstall dependencies terlebih dahulu...
    echo.
    call npm install
    echo.
)

echo Membuka Expo Web...
echo Tunggu beberapa detik, browser akan terbuka otomatis.
echo.
echo (Jika ingin berhenti, tekan Ctrl + C di jendela ini)
echo ========================================================
echo.

call npx expo start --web

pause

