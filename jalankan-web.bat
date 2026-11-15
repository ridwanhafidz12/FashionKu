@echo off
title CIRCULAI Web App
color 0A
echo ========================================================
echo             MEMULAI CIRCULAI WEB APP
echo ========================================================
echo.
cd /d "%~dp0"

echo Membuka Expo Web...
echo Tunggu beberapa detik, browser akan terbuka otomatis.
echo.
echo (Jika ingin berhenti, tekan Ctrl + C di jendela ini)
echo ========================================================
echo.

call npx expo start --web

pause

