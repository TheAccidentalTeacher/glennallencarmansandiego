# Sourdough Pete Development Server Startup Script
# This script handles all the annoying complexity of starting both servers reliably

param(
    [switch]$Clean,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                    SOURDOUGH PETE DEV STARTUP                ║
║              Making this less ridiculous since 2025          ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# Change to project directory
$projectDir = "c:\Users\scoso\Sourdough Pete\glennallencarmansandiego"
Set-Location $projectDir
Write-Host "✓ Working in: $projectDir" -ForegroundColor Cyan

# Step 1: Clean up any hanging processes
Write-Host "ℹ Step 1: Cleaning up any hanging Node processes..." -ForegroundColor Cyan
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "⚠ Found $($nodeProcesses.Count) hanging Node processes. Killing them..." -ForegroundColor Yellow
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ Node processes cleaned up" -ForegroundColor Green
    } else {
        Write-Host "✓ No hanging Node processes found" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ Node cleanup completed" -ForegroundColor Cyan
}

# Step 2: Build the server
Write-Host "ℹ Step 2: Building the server..." -ForegroundColor Cyan
$buildResult = npm run build:server 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Server build failed!" -ForegroundColor Red
    if ($Verbose) { Write-Host $buildResult }
    exit 1
}
Write-Host "✓ Server built successfully" -ForegroundColor Green

# Step 3: Start the API server in background
Write-Host "ℹ Step 3: Starting API server (port 3001)..." -ForegroundColor Cyan
$env:USE_FS_CONTENT = "true"

# Start API server in new window
$apiJob = Start-Process powershell -ArgumentList "-Command", "cd '$projectDir'; `$env:USE_FS_CONTENT='true'; npm start" -WindowStyle Minimized -PassThru

# Step 4: Wait for API server to be ready
Write-Host "ℹ Step 4: Waiting for API server to be ready..." -ForegroundColor Cyan
$apiReady = $false
$apiAttempts = 0
$maxApiAttempts = 30

do {
    Start-Sleep -Seconds 2
    $apiAttempts++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/content/cases" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Host "✓ API server is ready! (attempt $apiAttempts)" -ForegroundColor Green
        }
    } catch {
        if ($Verbose) {
            Write-Host "ℹ API attempt $apiAttempts failed: $($_.Exception.Message)" -ForegroundColor Cyan
        } else {
            Write-Host "." -NoNewline
        }
    }
} while (-not $apiReady -and $apiAttempts -lt $maxApiAttempts)

if (-not $apiReady) {
    Write-Host "✗ API server failed to start after $maxApiAttempts attempts" -ForegroundColor Red
    if ($apiJob -and -not $apiJob.HasExited) {
        Stop-Process -Id $apiJob.Id -Force
    }
    exit 1
}

# Step 5: Start the frontend dev server
Write-Host "ℹ Step 5: Starting frontend dev server (port 5173)..." -ForegroundColor Cyan
$frontendJob = Start-Process powershell -ArgumentList "-Command", "cd '$projectDir'; npm run dev" -WindowStyle Minimized -PassThru

# Step 6: Wait for frontend server to be ready
Write-Host "ℹ Step 6: Waiting for frontend dev server to be ready..." -ForegroundColor Cyan
$frontendReady = $false
$frontendAttempts = 0
$maxFrontendAttempts = 20

do {
    Start-Sleep -Seconds 2
    $frontendAttempts++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "✓ Frontend server is ready! (attempt $frontendAttempts)" -ForegroundColor Green
        }
    } catch {
        if ($Verbose) {
            Write-Host "ℹ Frontend attempt $frontendAttempts failed: $($_.Exception.Message)" -ForegroundColor Cyan
        } else {
            Write-Host "." -NoNewline
        }
    }
} while (-not $frontendReady -and $frontendAttempts -lt $maxFrontendAttempts)

if (-not $frontendReady) {
    Write-Host "✗ Frontend server failed to start after $maxFrontendAttempts attempts" -ForegroundColor Red
    # Clean up API server
    if ($apiJob -and -not $apiJob.HasExited) {
        Stop-Process -Id $apiJob.Id -Force
    }
    if ($frontendJob -and -not $frontendJob.HasExited) {
        Stop-Process -Id $frontendJob.Id -Force
    }
    exit 1
}

# Step 7: Final health check
Write-Host "ℹ Step 7: Final health check..." -ForegroundColor Cyan
try {
    # Test API endpoint
    $apiTest = Invoke-WebRequest -Uri "http://localhost:3001/api/content/cases" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ API responding: $($apiTest.StatusCode)" -ForegroundColor Green
    
    # Test frontend
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ Frontend responding: $($frontendTest.StatusCode)" -ForegroundColor Green
    
} catch {
    Write-Host "⚠ Health check had issues, but servers appear to be running" -ForegroundColor Yellow
}

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                        🎉 SUCCESS! 🎉                        ║
║                                                               ║
║  Both servers are running and ready:                         ║
║                                                               ║
║  Frontend: http://localhost:5173                             ║
║  API:      http://localhost:3001                             ║
║                                                               ║
║  API Process ID: $($apiJob.Id.ToString().PadRight(10))                              ║
║  Frontend Process ID: $($frontendJob.Id.ToString().PadRight(10))                        ║
║                                                               ║
║  To stop servers: Ctrl+C in their windows or run:           ║
║  Stop-Process -Id $($apiJob.Id), $($frontendJob.Id)                                    ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "ℹ Opening browser to http://localhost:5173..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "Press Enter to keep this window open and monitor, or Ctrl+C to exit..." -ForegroundColor Cyan
Read-Host