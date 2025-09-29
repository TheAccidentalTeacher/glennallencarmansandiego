# Simple Single-Terminal Dev Server Startup
# For when you want to see all output in one place

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                SIMPLE SOURDOUGH PETE STARTUP                 ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

# Change to project directory
$projectDir = "c:\Users\scoso\Sourdough Pete\glennallencarmansandiego"
Set-Location $projectDir

# Kill any hanging processes
Write-Host "Cleaning up any hanging Node processes..." -ForegroundColor Cyan
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Build server
Write-Host "Building server..." -ForegroundColor Cyan
npm run build:server
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Set environment and start both servers using concurrently (if available) or start them manually
Write-Host "Starting both servers..." -ForegroundColor Cyan
$env:USE_FS_CONTENT = "true"

# Try to use npm script if it exists, otherwise start them separately
Write-Host @"

🚀 Starting servers now...

Frontend will be at: http://localhost:5173
API will be at: http://localhost:3001

"@ -ForegroundColor Green

# Start API server first
Start-Job -ScriptBlock {
    Set-Location "c:\Users\scoso\Sourdough Pete\glennallencarmansandiego"
    $env:USE_FS_CONTENT = "true"
    npm start
} -Name "ApiServer"

# Give API server a moment
Start-Sleep -Seconds 3

# Start frontend
npm run dev