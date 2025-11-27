# NeuroHabit Server Auto-Startup (PowerShell Version)
# Save as: start-server.ps1
# Run with: powershell -ExecutionPolicy Bypass -File start-server.ps1

Write-Host "`n" -ForegroundColor Green
Write-Host "╔═════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  NeuroHabit - Auto-Start (PowerShell)   ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Check if Node.js is installed
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "✗ Node.js tidak terdeteksi" -ForegroundColor Red
    Write-Host "  Download dari: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "  Tekan Enter untuk keluar"
    exit 1
}

Write-Host "✓ Node.js terdeteksi" -ForegroundColor Green

# Check/create .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  File .env tidak ditemukan" -ForegroundColor Yellow
    Write-Host "✓ Membuat file .env template..." -ForegroundColor Green
    
    @"
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3000
HOSTNAME=localhost
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✓ File .env telah dibuat" -ForegroundColor Green
    Write-Host "  Silakan isi OPENAI_API_KEY Anda di file .env" -ForegroundColor Yellow
    Read-Host "  Tekan Enter setelah dikonfigurasi"
}

# Check/install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "`n✓ Menginstal dependencies..." -ForegroundColor Green
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Gagal menginstal dependencies" -ForegroundColor Red
        Read-Host "Tekan Enter untuk keluar"
        exit 1
    }
}

Write-Host "`n✓ Memulai NeuroHabit Server..." -ForegroundColor Green
Write-Host ""

# Start server
npm start

Write-Host "`n✗ Server telah berhenti" -ForegroundColor Yellow
Read-Host "Tekan Enter untuk keluar"
