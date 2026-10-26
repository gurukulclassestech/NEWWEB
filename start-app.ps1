$projectRoot = Join-Path $PSScriptRoot 'njeduhub-update-main'
$backendExe = Join-Path $projectRoot '.venv\Scripts\python.exe'
$frontendRoot = Join-Path $projectRoot 'frontend'

if (-not (Test-Path $projectRoot)) {
    throw "Project folder not found: $projectRoot"
}

if (-not (Test-Path $backendExe)) {
    throw "Backend Python runtime not found: $backendExe"
}

Write-Host "Starting backend from: $projectRoot"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; & '$backendExe' -m uvicorn backend.server:app --host 0.0.0.0 --port 8000"

Write-Host "Starting frontend from: $frontendRoot"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendRoot'; npm install; npm start"

Write-Host "Backend and frontend startup launched."
Write-Host "Login: admin / admin@123"
Write-Host "Admin URL: http://localhost:3000/admin-x9k2/login"
