@echo off
setlocal EnableDelayedExpansion
echo Building SWDP ChatOps Extension...

echo Compiling...
call npm run compile > nul 2>&1
if %errorlevel% neq 0 (
    echo Compile failed!
    pause
    exit /b 1
)

echo Creating package...
call vsce.cmd package > nul 2>&1
if %errorlevel% neq 0 (
    echo Package creation failed!
    pause
    exit /b 1
)

echo Uninstalling old extension...
call code --uninstall-extension swdp-team.swdp-chatops-extension > nul 2>&1

echo Installing new extension...
call code --install-extension swdp-chatops-extension-1.0.0.vsix > nul 2>&1
if %errorlevel% neq 0 (
    echo Installation failed!
    pause
    exit /b 1
)

echo Build complete! Extension installed.
pause