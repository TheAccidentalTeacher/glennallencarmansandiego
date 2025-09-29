# Start the test API server in a new PowerShell window on Windows
param(
  [switch]$NoKill
)

$project = "C:\Users\scoso\Sourdough Pete\glennallencarmansandiego"

if (-not $NoKill) {
  Write-Host "🧹 Cleaning up existing node.exe processes (if any)" -ForegroundColor Yellow
  taskkill /F /IM node.exe 2>$null | Out-Null
  Start-Sleep -Seconds 1
}

Write-Host "🚀 Launching test API in a new window..." -ForegroundColor Cyan

# Build a safe command string to execute in the new PowerShell window
$cmd = "& { Set-Location \"$project\"; Write-Host '🔥 Test API Starting (http://localhost:3001)...' -ForegroundColor Red; npm run dev:api:test }"

# Launch a new PowerShell window that keeps running
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$cmd
