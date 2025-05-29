Write-Host "Building SWDP ChatOps Extension..." -ForegroundColor Green

Write-Host "Compiling..." -ForegroundColor Yellow
npm run compile *> $null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Compile failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1 
}

Write-Host "Creating package..." -ForegroundColor Yellow
vsce package *> $null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Package creation failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1 
}

Write-Host "Uninstalling old extension..." -ForegroundColor Yellow
code --uninstall-extension swdp-team.swdp-chatops-extension *> $null

Write-Host "Installing new extension..." -ForegroundColor Yellow
code --install-extension swdp-chatops-extension-1.0.0.vsix *> $null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Installation failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1 
}

Write-Host "Build complete! Extension installed." -ForegroundColor Green
Read-Host "Press Enter to continue"