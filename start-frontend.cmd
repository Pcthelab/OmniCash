@echo off
setlocal
pushd "%~dp0frontend"
if errorlevel 1 exit /b 1
call npm run dev -- %*
set "FRONTEND_EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %FRONTEND_EXIT_CODE%
