@echo off
setlocal
pushd "%~dp0backend"
if errorlevel 1 exit /b 1
call mvnw.cmd spring-boot:run %*
set "BACKEND_EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %BACKEND_EXIT_CODE%
